var Physics = require('./physics.js'),
    math_extensions = require('./math_extension.js'),
    Vector2 = Physics.Vector2,
    BoundingBox = Physics.BoundingBox,
    fs = require('fs'),
    config = JSON.parse(fs.readFileSync('./app/config/settings.json'));

//Base GameObject for both Paddles and The Ball
var GameObject = function(name, position, bounding_box) {
  this.position = position;
  this.velocity = new Vector2(0, 0);
  this.name = name;
  this.bounding_box = bounding_box;
}

GameObject.constructor = GameObject;

GameObject.prototype.intersects = function(other_object) {
  //console.log('Checking Intersection!', this.bounding_box, other_object.bounding_box);
  return this.bounding_box.intersects(other_object.bounding_box);
}

var Ball = function(position) {
  var ball_size = config.game_settings.ball_size;
  GameObject.call(this, "Ball", position, new BoundingBox(position, ball_size, ball_size));
  this.colliding = false;
  this.colliding_with = null;
  this.game = null; //Game Object
}

Ball.prototype = Object.create(GameObject.prototype);
Ball.prototype.constructor = Ball;

Ball.prototype.updatePosition = function(dt) {
  this.position.add(this.velocity.scaleTo(dt/1000));
  this.bounding_box.update(this.position);
  //If we are not colliding with anything anymore
  if (this.colliding_with !== null && this.colliding) {
    if (!this.intersects(this.colliding_with)) {
      this.colliding_with = null;
      this.colliding = false;
    }
  } else if (this.colliding_with === null && this.colliding) {
    this.colliding = false;
  }
}

Ball.prototype.checkBounds = function(){
  var player_score;
  if (this.position.x < -50 && this.velocity.x < 0) {
    //Hit Player 4's wall
    player_score = 'p4';
  } else if (this.position.x > 50 && this.velocity.x > 0) {
    //Hit Player 2's wall
    player_score = 'p2';
  } else if (this.position.y < -50 && this.velocity.y < 0) {
    //Hit Player 1's wall
    player_score = 'p1';
  } else if (this.position.y > 50 && this.velocity.y > 0) {
    //Hit Player 3's wall
    player_score = 'p3';
  } else {
    return;
  }
  if (this.game.isPlayerActive(player_score)) {
    //Score and reset
    this.game.emit('point',player_score);
    this.reset();
  } else {
    //Bounce off empty walls
    if (player_score === 'p1' || player_score === 'p3') {
      this.bounce_y();
    } else {
      this.bounce_x();
    }
  }
}

Ball.prototype.reset = function(){
  var self = this;
  this.position = new Vector2(0, 0);
  this.velocity = new Vector2(0, 0);
  setTimeout(function(){ self.start_velocity(); }, config.game_settings.reset_timer);
}

Ball.prototype.start_velocity = function() {
  var direction = getRandomValidDirection();
  this.velocity = Physics.getVectorFromDirection(direction, config.game_settings.ball_speed);
}

Ball.prototype.bounce_x = function() {
  this.velocity.x *= -1;
}

Ball.prototype.bounce_y = function() {
  this.velocity.y *= -1;
}

//obj must be a game object
Ball.prototype.bounce_against = function(game_obj) {
  //determine game_object normal we're bouncing against,
  if (!this.colliding) {
    this.colliding = true;
    this.colliding_with = game_obj;
    var normal = game_obj.normal_vector.copy().normalize();
    this.velocity.reflect(normal);
    var additional_velocity = this.position.copy().subtract(game_obj.position).scalarMultiply(config.game_settings.paddle_velocity_multiplier);
    var initial_velocity = this.velocity.copy();
    var orig_mag = initial_velocity.getMagnitude();
    this.velocity = initial_velocity.add(additional_velocity).normalize().setMagnitude(orig_mag);
  }
}

var Paddle = function (player_id, player_num, is_comp) {
  var starting_location = getStartingLocation(player_num);
  var bbox = getPlayerBoundingBox(starting_location, player_num, config.game_settings.paddle_width);
  GameObject.call(this, "Paddle", starting_location, bbox);
  this.life = config.game_settings.player_max_life;
  this.paddle_width = config.game_settings.paddle_width;
  this.playerID = player_id;
  this.playerNum = player_num;
  this.action = "N"; //L, R, or N
  this.is_computer = is_comp || false; //default to false
  this.positive_vector = getPositiveVectorDirection(this.playerNum);
  this.normal_vector = this.positive_vector.copy().rotateDegrees(90);
  this.active = true;
}

Paddle.prototype = Object.create(GameObject.prototype);
Paddle.prototype.constructor = Paddle;

Paddle.prototype.updateAction = function(action) {
  this.action = action;
}

Paddle.prototype.updatePosition = function(dt) {
  if (this.action === 'R') {
    this.position.add(this.positive_vector.scaleTo(config.game_settings.paddle_speed * dt / 1000));
  } else if (this.action === 'L') {
    this.position.subtract(this.positive_vector.scaleTo(config.game_settings.paddle_speed * dt / 1000));
  }
  //Clamp to boundries
  if (this.playerNum == 1 || this.playerNum == 3) {
    this.position.x = Math.clamp(-50 + this.paddle_width/2, 50 - this.paddle_width/2, this.position.x);
  } else {
    this.position.y = Math.clamp(-50 + this.paddle_width/2, 50 - this.paddle_width/2, this.position.y);
  }
  this.bounding_box.update(this.position);
}

Paddle.prototype.updateWidth = function() {
  var max_width = config.game_settings.paddle_width;
  this.bounding_box = getPlayerBoundingBox(this.position, this.playerNum, max_width * (this.life / config.game_settings.player_max_life));
  if (this.life <= 0) {
    this.active = false;
  }
}

Paddle.prototype.computerAction = function(ball) {
  if (this.is_computer) {
    var movement_vector = ball.position.copy();
    movement_vector.subtract(this.position).multiplyMask(this.positive_vector.copy().absoluteValue()).normalize();
    if (movement_vector.getDirection() === this.positive_vector.getDirection()) {
      this.action = 'R';
    } else if (Math.abs(movement_vector.getDirection() - this.positive_vector.getDirection()) === 180) {
      this.action = 'L';
    } else {
      this.action = 'N';
    }
  }
}

//PRIVATE FUNCTIONS
function getStartingLocation(player_num) {
  switch(player_num) {
    case 1:
      return new Vector2(0,-50);
    case 2:
      return new Vector2(50, 0);
    case 3:
      return new Vector2(0, 50);
    case 4:
      return new Vector2(-50, 0);
  }
}

function getPlayerBoundingBox(center, player_num, paddle_width) {
  var paddle_depth = config.game_settings.paddle_depth;
  switch(player_num) {
    case 1:
    case 3:
      return new BoundingBox(center, paddle_width, paddle_depth);
    case 2:
    case 4:
      return new BoundingBox(center, paddle_depth, paddle_width);
  }
}


//The Positive Vector Direction corresponds to moving Right 
function getPositiveVectorDirection(p_num) {
  switch (p_num) {
    case 1:
      return new Vector2(1, 0);
    case 2:
      return new Vector2(0, 1);
    case 3:
      return new Vector2(-1, 0);
    case 4:
      return new Vector2(0, -1);
  }
}

function getRandomValidDirection() {
  var dir = Math.random() * 360;
  for (var i = 0; i < 5; i++) {
    if (Math.abs(dir - (90 * i)) < 5) {
      return getRandomValidDirection();
    }
  }
  return dir;
}

module.exports = {
  Ball: Ball,
  Paddle: Paddle
}