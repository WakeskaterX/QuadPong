var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./app/config/settings.json'));
var classes = require('./lib/classes.js');
var EventEmitter = require('events').EventEmitter;
var Physics = require('./lib/physics.js');
var Vector2 = Physics.Vector2;
var Ball = classes.Ball;
var Paddle = classes.Paddle;

//GAME OBJECT
function Game(id_no){
  EventEmitter.call(this);
  var self = this;
  this.id = id_no; //accessible ID
  var status = 0;
  var players = {
    "p1": null,
    "p2": null,
    "p3": null,
    "p4": null
  };
  var ball = {};

  //Customizations
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
    ball.checkBounds();
    //Finish Game Loop and Set timeout
    var end = +Date.now();
    var time_elapsed = end-start;
    if (time_elapsed > 30) {
      console.log("WARNING: This loop took "+time_elapsed+" ms");
    }
    //Emit the data to the clients
    self.emit('update', {
      ball: ball,
      p1: players.p1,
      p2: players.p2,
      p3: players.p3,
      p4: players.p4
    });
    //Check if the game is over (i.e a player won)
    checkEndGame();
    //If our game is running continue the loop
    setTimeout(function() { if (status === 2) { gameLoop(); }}, Math.max(gameloop_delta-time_elapsed, 1));
  }

  /**
   * Returns and empty slot so we can easily add players
   */
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

  /**
   * Moves the player paddles by updating all the player positions passing in our delta time
   */
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

  /**
   * Moves the ball passing in our delta time
   */
  function moveBall(delta) {
    ball.updatePosition(delta);
  }

  /**
   * Check each player for collisions with the ball
   */
  function checkCollisions() {
    for (var key in players) {
      if (players[key].intersects(ball) && players[key].active) {
        ball.bounce_against(players[key]);
      }
    }
  }

  /**
   * Check if a single player remains - that player wins
   */
  function checkEndGame() {
    var players_remain = 0;
    var survivor = {};
    for (var key in players) {
      if (players[key].life > 0) {
        players_remain++;
        survivor = players[key];
      }
    }
    if (players_remain <= 1) {
      self.emit('end_game', survivor);
      status = 3;
    }
  }

  /**
   * Gets a player by a player_id
   */
  function getPlayer(player_id) {
    for (var key in players) {
      if (players[key].playerID === player_id) {
        return players[key];
      }
    }
    console.log("NO PLAYER FOUND!");
    return null;
  }

  /**
   * Checks if we have a player by player_id in this game
   * @param {string} player_id
   * @returns {bool}
   */
  this.hasPlayer = function(player_id) {
    if (getPlayer(player_id) !== null) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Checks if a player is currently active & alive
   * @param {string} player_id
   * @returns {bool}
   */
  this.isPlayerActive = function(player_num) {
    return players[player_num].active;
  }

  /**
   * Returns a player by requesting with ID
   * @param {string} player_id
   * @returns {Paddle} player
   */
  this.getPlayerByID = function(player_id) {
    return getPlayer(player_id);
  }

  /**
   * Returns all players
   * @returns {Paddle[]}
   */
  this.getAllPlayers = function() {
    return players;
  }

  /**
   * Adds a player to the game
   * @param {string} player_id
   * @returns {number} player number (1-4)
   */
  this.addPlayer = function(player_id) {
    var pNum = getEmptySlot();
    console.log('Got Empty Slot #: '+pNum);
    if (pNum !== 0) {
      players["p"+pNum] = new Paddle(player_id, pNum, false);
      return pNum;
    } else {
      throw new Error("Player Could not be added to the game, the game is full!");
    }
  }

  /**
   * Adds a computer player to the game
   * @param {string} player_id
   * @returns {number} player number (1-4)
   */
  this.addComputer = function(player_id) {
    var pNum = getEmptySlot();
    console.log('Got Empty Slot For Computer #: '+pNum);
    if (pNum !== 0) {
      var comp_player = new Paddle(player_id, pNum, true);
      players["p"+pNum] = comp_player;
      return pNum;
    } else {
      throw new Error("Player Could not be added to the game, the game is full!");
    }
  }

  /**
   * Removes a player from the game
   * @param {player_id}
   * @returns {bool} returns if it succeeded in removing player
   */
  this.removePlayer = function(player_id) {
    var player = getPlayer(player_id);
    if (player) {
      players["p"+player.player_num] = {};
      return true;
    } else {
      return false;
    }
  }

  /**
   * Sets up the game state
   * @param {string} first_player_id - id of the first player (creator) of the game
   */
  this.gameSetup = function(first_player_id) {
    status = 1;
    ball = new Ball(new Vector2(0,0));
    ball.game = this;
    this.addPlayer(first_player_id);
  }

  /**
   * Starts the game
   */
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

  /**
   * Updates a players action
   * @param {string} player_id
   * @param {string} action
   */
  this.updatePlayerAction = function(player_id, action){
    if (status === 2) {
      var player = getPlayer(player_id);
      player.action = action;
    } else {
      throw new Error("Game has not started yet!");
    }
  }

  /**
   * Returns the number of open slots in the game
   * @returns {number} slots
   */
  this.numberSlotsAvailable = function() {
    var slots = 0;
    for (var player_id in players) {
      if (!players[player_id]) slots++;
    }
    return slots;
  }

  /**
   * Event function - onPoint
   * scores a point against player passed in
   */
  this.on('point', function(player) {
    if (players[player].active) {
      players[player].life -= 1;
      players[player].updateWidth();
    }
  });
}

Game.prototype = Object.create(EventEmitter.prototype);
Game.prototype.constructor = Game;

module.exports = Game;