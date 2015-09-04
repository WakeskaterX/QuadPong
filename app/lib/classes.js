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
  if (this.position.x < -50 && this.velocity.x < 0) {
    //Hit Player 4's wall
    this.reset();
  } else if (this.position.x > 50 && this.velocity.x > 0) {
    //Hit Player 2's wall
    this.reset();
  }
  if (this.position.y < -50 && this.velocity.y < 0) {
    //Hit Player 1's wall
    this.reset();
  } else if (this.position.y > 50 && this.velocity.y > 0) {
    //Hit Player 3's wall
    this.reset();
  }
}

Ball.prototype.reset = function(){
  this.position = new Vector2(0, 0);
  this.velocity = Physics.getVectorFromDirection(Math.random() * 360, config.game_settings.ball_speed);
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
    console.log(normal.toString());
    console.log("Bounce event: \n Initial Velocity: "+this.velocity.toString()+"\n Bounce Velocity: "+this.velocity.copy().reflect(normal).toString());
    this.velocity.reflect(normal);
  }
}

var Paddle = function (player_id, player_num, is_comp) {
  var starting_location = getStartingLocation(player_num);
  var bbox = getPlayerBoundingBox(starting_location, player_num);
  GameObject.call(this, "Paddle", starting_location, bbox);
  this.player_life = config.game_settings.player_max_life;
  this.paddle_width = config.game_settings.paddle_width;
  this.playerID = player_id;
  this.playerNum = player_num;
  this.action = "N"; //L, R, or N
  this.is_computer = is_comp || false; //default to false
  this.positive_vector = getPositiveVectorDirection(this.playerNum);
  this.normal_vector = this.positive_vector.copy().rotateDegrees(90);
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

function getPlayerBoundingBox(center, player_num) {
  var paddle_width = config.game_settings.paddle_width;
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

module.exports = {
  Ball: Ball,
  Paddle: Paddle
}