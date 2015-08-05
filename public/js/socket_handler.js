var socket = io();
var player_id = "";
var game_id = "";

socket.on('player_credentials', function(data){
  player_id = data.player_id;
  console.log('Recieved Player ID: '+player_id);
});

socket.on('update',function(data){
  GameObjects = data;
  //console.log(data.p1box);
  updateGame();
});

socket.on('started_game', function(data) {
  game_id = data.game_id;
  console.log('Game ID: '+game_id);
});

function start_game(){
  socket.emit('start_game', {'player_id': player_id});
}