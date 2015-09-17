var helper = require('./lib/helper.js');
var games = {};
var players = [];
var fs = require('fs');
var Game = require('./game_loop.js');
var config = JSON.parse(fs.readFileSync('./app/config/settings.json'));

/**
 * Handles our Socket - sets up IO and our socket connections
 */
function handleSocket(io, socket) {
  console.log('New Socket Connection: ' + socket.id);

  /**
   * When client sends a new player request after joining
   * Client will try to send the playerID and gameID if it exists in the
   * local storage
   * @param {object} data
   * @param {string} [data.player_id]
   * @param {string} [data.game_id] use this to reconnect to a game
   */
  socket.on('new_player', function (data) {
    //Check Player ID, if it exists in our players, return that
    //Otherwise create new playerID and send that - if we have a gameID
    //and it's a valid game ID that is in progress, reconnect to that game
    //and send a reconnection emit
    if (players.indexOf(data.player_id) >= 0 && games.hasOwnProperty(data.game_id)) {
      if (games[data.game_id].hasPlayer(data.player_id)) {
        console.log('Player Reconnecting...');
        var game = games[data.game_id];
        socket.join(gameRoom(game.id));
        socket.emit('reconnect', data);
        return;
      }
    }
    var player_id = helper.createPlayerID(players);
    console.log('A user connected! ID No: ' + player_id);
    socket.emit('player_credentials', { "player_id": player_id });
  });

  /**
   * When a Player Disconnects
   * TODO: Set players action to 'N'?
   */
  socket.on('disconnect', function () {
    console.log('A user disconnected!');
  });

  /**
   * When a player leaves a game, remove them from the socket room
   * @param {string} data.player_id
   * @param {string} data.game_id
   */
  socket.on('leave_game', function(data) {
    //TODO:  Remove player from socket room and emit a leave event -- this happens automatically
    if (players.indexOf(data.player_id) >= 0 && games.hasOwnProperty(data.game_id)) {
      var game = games[data.game_id];
      if (game.hasPlayer(data.player_id)) {
        var thisPlayer = game.getPlayerByID(data.player_id);
        socket.leave(gameRoom(game.id));
        io.to(gameRoom(game.id)).emit('player_left', {player_num: thisPlayer.playerNum});
        thisPlayer.id = "INVALID";
        players[players.indexOf(data.player_id)] = null;  //TODO: Make this better, setting to null is sort of a hack
      }
    }
  });

  /**
   * Start up a new game
   * takes a player ID and assigns that player to the new game
   * @param {string} data.player_id - the player ID to create a game for
   */
  socket.on('start_game', function (data) {
    var game_id = data.game_id;
    var game = games[game_id];
    if (game) {
      console.log('Starting Game: ' + game_id);
      game.gameStart();
      io.to(gameRoom(game.id)).emit('started_game', { 'game_id': game_id });
      game.on('update', function (data) {
        io.to(gameRoom(game.id)).emit('update', data);
      });
      game.on('end_game', function(data) {
        io.to(gameRoom(game.id)).emit('game_over', { winner: data.playerNum });
      });
    } else {
      console.log('Error: INVALID GAME ID: ' + game_id);
      socket.emit('server_error', 'Invalid Game ID Specified');
    }
  });

  /**
   * Join an existing game with slots
   * Takes a player_id and game_id and if the game has space, allows the player to join the game
   * @param {string} data.player_id
   * @param {string} data.game_id
   */
  socket.on('join_game', function (data) {
    var game_id = findEmptyGame();
    if (!game_id) {
      socket.emit('no_games')
      return;
    }
    var player_id = data.player_id;
    var game = games[game_id];
    if (game) {
      //Get open slot, set player to that slot, emit joined game event
      try {
        socket.join(gameRoom(game_id));
        socket.emit('game_settings', config.game_settings);
        var players = game.getAllPlayers();
        var game_players = [];
        for (var pN in players) {
          var p = players[pN];
          if (p) {
            var t = p.is_computer ? "Computer" : "Human";
            game_players.push({player_num: p.playerNum, type: t, player_life: p.life});
          }
        }
        var player_num = game.addPlayer(player_id);
        socket.emit('joined_game', {'game_id': game_id, 'player_num': player_num, 'players': game_players });
        io.to(gameRoom(game_id)).emit('added_player', { game_id: game_id, player_num: player_num, player_life: config.game_settings.player_max_life });
      } catch (e) {
        console.log(e);
        socket.emit('game_full', { 'game_id': game_id });
      }
    } else {
      socket.emit('server_error', 'Invalid Game ID');
    }
  });

  /**
   * Add computer player to existing game
   * Takes a game_id and adds a computer player
   * @param {string} data.game_id
   */
  socket.on('add_computer_player', function(data) {
    var game_id = data.game_id;
    var game = games[game_id];
    if (game) {
      try {
        var pid = helper.createComputerID();
        var player_num = game.addComputer(pid);
        io.to(gameRoom(game.id)).emit('added_computer', { 'game_id': game_id, 'player_num': player_num, 'player_life': config.game_settings.player_max_life });
        console.log('Added Computer Player to Game: '+game_id);
      } catch (e) {
        console.log(e);
        socket.emit('game_full', { 'game_id': game_id });
      }
    } else {
      socket.emit('server_error', 'Invalid Game ID');
    }
  });

  /**
   * Create a brand new game
   * Takes a player ID and creates a new game with that player as player 1
   * @param {string} data.player_id
   */
  socket.on('create_game', function (data) {
    var game_id = helper.createGameID();
    var game = new Game(game_id);
    games[game_id] = game;
    console.log('Created New Game with ID: ' + game_id);
    players.push(data.player_id);
    game.gameSetup(data.player_id);
    socket.emit('game_settings', config.game_settings);
    socket.emit('created_game', { 'game_id': game_id });
    socket.join(gameRoom(game.id));
  });

  /**
   * Takes a player action and updates that game with the players action
   * @param {object} data
   * @param {string} data.player_id - the player ID to update
   * @param {string} data.game_id - the ID of the game to update
   * @param {string} data.action - the action to update the player to
   */
  socket.on('action', function (data) {
    var game_id = data.game_id;
    var game = games[game_id];
    if (game) {
      game.updatePlayerAction(data.player_id, data.action);
    } else {
      socket.emit('server_error', "INVALID GAME ID");
    }
  });

  /**
   * Replies with game list data when a request for the data is made
   */
  socket.on('request_game_list', function() {
    socket.emit('game_list', listGames());
  });

  /**
   * Handle Socket Errors
   * Logs the stack and emits the error to the client
   * TODO: Wrap error to hide details and display a nicer message to client
   */
  socket.on('error', function (error) {
    console.error(error);
    socket.emit('server_error', 'An Error Occurred!');
  });
}

/**
 * Flushes our games list
 */
function flushGames() {
  games = {};
}

/**
 * Lists all games
 */
function listGames() {
  var g = [];
  for (var id in games) {
    var item = {};
    item.game_id = id;
    item.number_slots = games[id].numberSlotsAvailable();
    g.push(item);
  }
  return g;
}

/**
 * Finds an empty game where we have playable slots open
 */
function findEmptyGame() {
  for (var g in games) {
    var game = games[g];
    if (game.numberSlotsAvailable() > 0) {
      return game.id;
    }
  }
  return null;
}

/**
 * modifier function to get a room for sockets to join
 */
function gameRoom(game_id) {
  return 'game_'+game_id;
}

module.exports = {
  handleSocket: handleSocket,
  flushGames: flushGames,
  listGames: listGames
}