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
}

socket.on('created_game', function(data) {
  game_id = data.game_id;
  STATE = states.WAITING;
  save_data();
  //temp -- add 3 computers then start game
  for(var i = 0; i < 3; i++) {
    setTimeout(function() {
      var data = {
        'game_id': game_id
      }
      socket.emit('add_computer_player', data);
    }, 1000 * i);
  }
  setTimeout(function(){
    socket.emit('start_game', {'game_id': game_id});
  }, 5000);
});

socket.on('added_computer', function(data) {
  console.log("Added Computer Player to Game!");
});

socket.on('added_player', function(data) {
  console.log("Added Human Player to Game!");
})

function save_data(){
  localStorage["player_id"] = player_id;
  localStorage["game_id"] = game_id;
}