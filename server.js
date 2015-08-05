var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var helper = require('./app/lib/helper.js');
var games = {};
var players = [];
var Game = require('./game_loop.js');

app.get('/', function(req, res) {
  res.redirect('/index.html');
});

app.use(express.static('public'));

io.on('connection', function(socket){
  var player_id = helper.createPlayerID(players);
  console.log('A user connected! ID No: '+player_id);
  socket.emit('player_credentials', {"player_id": player_id});
  //Disconnection
  socket.on('disconnect', function(){
    console.log('A user disconnected!');
  });
  //Start up a game
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
  socket.on('error', function(error) {
    console.log(error.stack);
    socket.emit(error);
  })
})

function flushGames() {
  games = {};
}

http.listen(3000, function() {
  flushGames();
  var host = http.address().address;
  var port = http.address().port;
  console.log('Server listening at: http://%s:%s', host, port);
});
