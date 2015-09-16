var socket = io();
var player_id = localStorage["player_id"] || null;
var game_id = localStorage["game_id"] || null;
var players_in_game = 0;
var game_list = [];
var winner = "";

socket.on('connect', function(){
  var playerData = {
    "player_id": player_id,
    "game_id": game_id
  }
  socket.emit('new_player', playerData);
  socket.emit('request_game_list');
});

socket.on('player_credentials', function(data){
  player_id = data.player_id;
  console.log('Recieved Player ID: '+player_id);
});

socket.on('update',function(data){
  GameObjects = data;
  PlayerData = extract_player_data(data);
  update_player_list();
  updateCanvas();
});

socket.on('reconnect',function(data){
  //Reconnect to game
  STATE = states.GAME;
  player_id = data.player_id;
  game_id = data.game_id;
});

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

socket.on('game_settings', function(data) {
  game_settings = data;
})

function create_game() {
  socket.emit('create_game', {'player_id': player_id});
  player_num = 1;
  add_player("Human",{ player_num: 1, player_life: 1 });
}

function join_game() {
  socket.emit('join_game', {'player_id': player_id});
}

socket.on('created_game', function(data) {
  game_id = data.game_id;
  STATE = states.WAITING;
  save_data();
});

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

socket.on('added_computer', function(data) {
  console.log("Added Computer Player to Game!");
  add_player("Computer", data);
});

socket.on('added_player', function(data) {
  console.log("Added Human Player to Game!");
  add_player("Human", data);
});

socket.on('game_list', function(data) {
  game_list = data;
});

socket.on('no_games', function(){
  alert('No Available Games!');
});

socket.on('game_over', function(data) {
  winner = data.winner;
  STATE = states.GAME_END;
});

function save_data(){
  localStorage["player_id"] = player_id;
  localStorage["game_id"] = game_id;
}

//Adds a player to the list of players - is_player is the client, can be left blank
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

function add_computer_to_game() {
  var data = {
    'game_id': game_id
  }
  socket.emit('add_computer_player', data);
}

function start_game(){
  if (players_in_game < 4) {
    alert("Not Enough Players!");
  } else {
    socket.emit('start_game', {'game_id': game_id});
  }
}

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

function clear_player_list(){
  $("#players tbody").empty();
}

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