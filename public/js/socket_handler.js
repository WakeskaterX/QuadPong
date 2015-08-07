var socket = io();
var player_id = localStorage["player_id"] || null;
var game_id = localStorage["game_id"] || null;

socket.on('connect', function(){
  var playerData = {
    "player_id": player_id,
    "game_id": game_id
  }
  socket.emit('new_player', playerData);
});

socket.on('player_credentials', function(data){
  player_id = data.player_id;
  console.log('Recieved Player ID: '+player_id);
});

socket.on('update',function(data){
  GameObjects = data;
  //console.log(data.p1box);
  updateCanvas();
});

socket.on('reconnect',function(data){
  //Reconnect to game
  STATE = states.GAME;
  player_id = data.player_id;
  game_id = data.game_id;
});

socket.on('started_game', function(data) {
  game_id = data.game_id;
  console.log('Game Started with ID: '+game_id);
  save_data();
});

function start_game(){
  socket.emit('start_game', {'player_id': player_id});
}

function save_data(){
  localStorage["player_id"] = player_id;
  localStorage["game_id"] = game_id;
}