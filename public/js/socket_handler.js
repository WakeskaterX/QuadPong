var socket = io();
var player_id = localStorage["player_id"] || null;
var game_id = localStorage["game_id"] || null;
var players_in_game = 0;
var game_list = [];
var winner = "";

/**
 * Once we connect to the server via IO, emit our new player data & request the game list
 */
socket.on('connect', function(){
  var playerData = {
    "player_id": player_id,
    "game_id": game_id
  }
  socket.emit('new_player', playerData);
  socket.emit('request_game_list');
});

/**
 * When we get player credentials - store them and log it to the console
 */
socket.on('player_credentials', function(data){
  player_id = data.player_id;
  console.log('Recieved Player ID: '+player_id);
});

/**
 * When we get an update, Store our data as game objects and extract the player data into our list, and update our game
 */
socket.on('update',function(data){
  GameObjects = data;
  PlayerData = extract_player_data(data);
  update_player_list();
  updateCanvas();
});

/**
 * WHen we reconnect, reset the game so we can rejoin it
 */
socket.on('reconnect',function(data){
  //Reconnect to game
  STATE = data.state ? data.state : states.GAME;
  player_id = data.player_id;
  game_id = data.game_id;
});

/**
 * When we start the game, set our state and save the game data
 */
socket.on('started_game', function(data) {
  if (game_id !== data.game_id) {
    //This shouldn't happen, check in place to make sure
    console.log('WARNING: Game ID Started does not match game ID!')
    game_id = data.game_id;
  }
  console.log('Game Started with ID: '+game_id);
  STATE = states.GAME;
  save_data();
});

/**
 * When we get game settings, save them
 */
socket.on('game_settings', function(data) {
  game_settings = data;
})

/**
 * Create a game and emit to server
 */
function create_game() {
  socket.emit('create_game', {'player_id': player_id});
  player_num = 1;
  add_player("Human",{ player_num: 1, player_life: 1 });
}

/**
 * Join a random open game
 */
function join_game() {
  socket.emit('join_game', {'player_id': player_id});
}

/**
 * When we created a game, enter waiting state while we wait for players to join
 */
socket.on('created_game', function(data) {
  game_id = data.game_id;
  STATE = states.WAITING;
  save_data();
});

/**
 * When we join a game, set up our state correctly and asve the relevant data
 */
socket.on('joined_game', function(data) {
  console.log("Player Joined Game: "+JSON.stringify(data));
  player_num = data.player_num;
  game_id = data.game_id;
  var players = data.players;
  for (var item in players) {
    var player = players[item];
    add_player(player.type, player);
  }
  add_player('Human', { player_num: data.player_num, player_life: 0 });
  STATE = states.WAITING;
  save_data();
});

/**
 * When we add a computer - list them and add to game
 */
socket.on('added_computer', function(data) {
  console.log("Added Computer Player to Game!");
  add_player("Computer", data);
});

/**
 * When we add a player - list them and add to game
 */
socket.on('added_player', function(data) {
  console.log("Added Human Player to Game!");
  add_player("Human", data);
});

/**
 * When we get a game list, list all the games
 */
socket.on('game_list', function(data) {
  game_list = data;
});

/**
 * When there are no open games, alert the player they can't join
 */
socket.on('no_games', function(){
  alert('No Available Games!');
});

/**
 * When the game ends, set our state to game end and declare the winner
 */
socket.on('game_over', function(data) {
  winner = data.winner;
  STATE = states.GAME_END;
});

/** 
 * Saves our data to local storage - cookies aren't used this is HTML5 people
 */
function save_data(){
  localStorage["player_id"] = player_id;
  localStorage["game_id"] = game_id;
}

/** 
 * Adds a player to the list of players - is_player is the client, can be left blank
 */
function add_player(player_type, data){
  if (PlayerData) {
    players_in_game++;
    PlayerData["p"+data.player_num] = {
      player_num: data.player_num,
      is_self: data.player_num === player_num ? true : false,
      type: player_type,
      player_life: data.player_life || 0
    }
  }
  update_player_list();
}

/**
 * Adds a computer to the game and emits to server
 */
function add_computer_to_game() {
  var data = {
    'game_id': game_id
  }
  socket.emit('add_computer_player', data);
}

/**
 * Starts a game and emits to server
 */
function start_game(){
  if (players_in_game < 4) {
    alert("Not Enough Players!");
  } else {
    socket.emit('start_game', {'game_id': game_id});
  }
}

/**
 * Restarts the game and sets our game state to a blank slate - also emits we're quitting our current game
 */
function restart_game(){
  STATE = states.MENU;
  PlayerData = {
    p1: null,
    p2: null,
    p3: null,
    p4: null
  };
  GameObjects = {
    ball: {position: {x: 0, y: 0}},
  }
  LOBBY_SELECT = 0;
  players_in_game = 0;
  socket.emit('leave_game', { player_id: player_id, game_id: game_id });
  game_id = null;
  clear_player_list();
}

/**
 * Updates our list of players
 */
function update_player_list(){
  if (PlayerData) {
    $("#players tbody").empty();
    for (var pid in PlayerData) {
      var p = PlayerData[pid];
      if (p) {
        var row = document.createElement('tr');
        var row_data = "<th>Player "+p.player_num+"</th><td>"+p.type+"</td><td>"+p.player_life+"</td><td>"+p.is_self.toString()+"</td>";
        row.innerHTML = row_data;
        $("#players tbody").append(row);
        if (p.player_life < 1) {
          row.setAttribute("style","color:red;");
        }
      }
    }
  }
}

/**
 * Erases our player list
 */
function clear_player_list(){
  $("#players tbody").empty();
}

/**
 * Extracts player data from a general data object
 */
function extract_player_data(data){
  var player_data = {};
  for (var item in data) {
    //Only get player data
    if (["p1", "p2", "p3", "p4"].indexOf(item) > -1) {
      var p = data[item];
      player_data[item] = {
        player_num: p.playerNum,
        player_life: p.life,
        type: p.is_computer ? "Computer":"Human",
        is_self: p.playerNum === player_num ? true : false
      }
    }
  }
  return player_data;
}