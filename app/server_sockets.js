var helper = require('./lib/helper.js');
var games = {};
var players = [];
var Game = require('./game_loop.js');

function handleSocket(socket) {
  console.log('New Socket Connection: '+socket.id);

  /**
   * When client sends a new player request after joining
   * Client will try to send the playerID and gameID if it exists in the
   * local storage
   * @param {object} data
   * @param {string} [data.player_id]
   * @param {string} [data.game_id] use this to reconnect to a game
   */
  socket.on('new_player', function(data){
    //Check Player ID, if it exists in our players, return that
    //Otherwise create new playerID and send that - if we have a gameID
    //and it's a valid game ID that is in progress, reconnect to that game
    //and send a reconnection emit
    var player_id = helper.createPlayerID(players);
    console.log('A user connected! ID No: '+player_id);
    socket.emit('player_credentials', {"player_id": player_id});
  })

  /**
   * When a Player Disconnects
   * TODO: Set players action to 'N'?
   */
  socket.on('disconnect', function(){
    console.log('A user disconnected!');
  });

  /**
   * Start up a new game
   * takes a player ID and assigns that player to the new game
   * @param {string} player_id - the player ID to create a game for
   */
  socket.on('start_game', function(player_id) {
    console.log('Starting New Game');
    var game_id = helper.createGameID();
    var game = new Game(game_id);
    console.log('Created Game with ID: '+game_id);
    game.gameSetup(player_id);
    game.addComputer(helper.createComputerID+'0');
    game.addComputer(helper.createComputerID+'1');
    game.addComputer(helper.createComputerID+'2');
    game.getPlayer(player_id).is_computer = true; //REMOVE LATER
    game.gameStart();
    games[game_id] = game;
    socket.emit('started_game', {'game_id':game_id});
    games[game_id].on('update', function(data){
      socket.emit('update', data);
    });
  });

  /**
   * Takes a player action and updates that game with the players action
   * @param {object} data
   * @param {string} data.player_id - the player ID to update
   * @param {string} data.game_id - the ID of the game to update
   * @param {string} data.action - the action to update the player to
   */
  socket.on('action', function(data) {
    
  })

  /**
   * Handle Socket Errors
   * Logs the stack and emits the error to the client
   * TODO: Wrap error to hide details and display a nicer message to client
   */
  socket.on('error', function(error) {
    console.log(error.stack);
    socket.emit('error', error);
  });
}

function flushGames () {
  games = {};
}

module.exports = {
  handleSocket: handleSocket,
  flushGames: flushGames
}