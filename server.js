var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var SocketHandler = require('./app/server_sockets.js');

app.get('/', function(req, res) {
  res.redirect('/index.html');
});

app.get('/games', function(req, res) {
  res.send(SocketHandler.listGames());
})

app.use(express.static('public'));

io.on('connection', function(socket){
  SocketHandler.handleSocket(io, socket);
});

http.listen(3000, function() {
  SocketHandler.flushGames();
  var host = http.address().address;
  var port = http.address().port;
  console.log('Server listening at: http://%s:%s', host, port);
});
