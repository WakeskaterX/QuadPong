var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./app/config/settings.json'));
var classes = require('./app/lib/classes.js');
var EventEmitter = require('events').EventEmitter;
var Physics = require('./app/lib/physics.js');
var Vector2 = Physics.Vector2;
var Ball = classes.Ball;
var Paddle = classes.Paddle;

//GAME OBJECT
function Game(id_no){
  EventEmitter.call(this);
  var self = this;
  var game_id = id_no;
  var status = 0;
  var players = {
    "p1": null,
    "p2": null,
    "p3": null,
    "p4": null
  };
  var ball = {};

  //Customizations
  var ball_speed = config.game_settings.ball_speed;
  var gameloop_delta = config.system_settings.gameLoopDelta;
  var lastLoopTime = +Date.now();

  function gameLoop() {
    var delta = +Date.now() - lastLoopTime;
    var start = +Date.now();
    lastLoopTime = start;
    //Time recorded
    movePlayerPaddles(delta);
    moveBall(delta);
    checkCollisions();
    //Finish Game Loop and Set timeout
    var end = +Date.now();
    var time_elapsed = end-start;
    if (time_elapsed > 30) {
      console.log("WARNING: This loop took "+time_elapsed+" ms");
    }
    self.emit('update', {
      ball: ball.position,
      p1: players.p1.position,
      p2: players.p2.position,
      p3: players.p3.position,
      p4: players.p4.position,
      p1box: players.p1.bounding_box
    });
    setTimeout(function() { gameLoop(); }, Math.max(gameloop_delta-time_elapsed, 1));
  }

  function getEmptySlot(){
    switch(true) {
      case !players.p1:
        return 1;
      case !players.p2:
        return 2;
      case !players.p3:
        return 3;
      case !players.p4:
        return 4;
      default:
        return 0;
    }
  }

  //Moves the player paddles
  function movePlayerPaddles(delta){
    for (var key in players) {
      if (players.hasOwnProperty(key)) {
        players[key].updatePosition(delta);
        if (players[key].is_computer) {
          players[key].computerAction(ball);
        }
      }
    }
  }

  function moveBall(delta) {
    ball.updatePosition(delta);
  }

  function checkCollisions() {
    for (var key in players) {
      if (players.hasOwnProperty(key)) {
        if (players[key].intersects(ball)) {
          console.log("BALL HIT PADDLE OF PLAYER: "+key);
          if (key === "p1" || key === "p3") {
            ball.bounce_y();
          } else {
            ball.bounce_x();
          }
        }
      }
    }
  }

  function getPlayer(player_id) {
    for (var key in players) {
      if (players.hasOwnProperty(key)) {
        if (players[key].playerID === player_id) {
          return players[key];
        }
      }
    }
    console.log("NO PLAYER FOUND!");
    return null;
  }

  this.hasPlayer = function(player_id) {
    if (getPlayer(player_id) !== null) {
      return true;
    } else {
      return false;
    }
  }

  this.getPlayer = function(player_id) {
    return getPlayer(player_id);
  }

  this.addPlayer = function(player_id) {
    var pNum = getEmptySlot();
    console.log('Got Empty Slot #: '+pNum);
    if (pNum !== 0) {
      players["p"+pNum] = new Paddle(player_id, pNum);
    } else {
      throw new Error("Player Could not be added to the game, the game is full!");
    }
  }

  this.addComputer = function(player_id) {
    var pNum = getEmptySlot();
    console.log('Got Empty Slot For Computer #: '+pNum);
    if (pNum !== 0) {
      var comp_player = new Paddle(player_id, pNum);
      comp_player.is_computer = true;
      players["p"+pNum] = comp_player;
    } else {
      throw new Error("Player Could not be added to the game, the game is full!");
    }
  }

  this.removePlayer = function(player_id) {
    var player = getPlayer(player_id);
    players["p"+player.player_num] = {};
  }

  this.gameSetup = function(first_player_id) {
    status = 1;
    ball = new Ball(new Vector2(0,0));
    this.addPlayer(first_player_id);
  }

  this.gameStart = function() {
    if (getEmptySlot() === 0) {
      status = 2;
      setTimeout(function(){
        gameLoop();
        ball.reset();
      }, 3 * 1000);
    } else {
      throw new Error("NOT ENOUGH PLAYERS!");
    }
  };

  this.updatePlayerAction = function(player_id, action){
    if (status === 2) {
      var player = getPlayer(player_id);
      player.action = action;
    } else {
      throw new Error("Game has not started yet!");
    }
  }

  this.startGame = function(){
    lastLoopTime = +Date.now();
    gameLoop();
  }
}

Game.prototype = Object.create(EventEmitter.prototype);
Game.prototype.constructor = Game;

module.exports = Game;