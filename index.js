// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

// Routing
app.use(express.static(__dirname + '/public'));

var playerId = 0;

io.on('connection', function (socket) {

  playerId++;

  var player = { playerId: playerId };
  socket.emit('player.connected.self', player);
  socket.broadcast.emit('player.connected.new', player);

  socket.on('disconnect', function () {
    socket.broadcast.emit('player.disconnected', player);
  });

  socket.on('player.update', function (data) {
    socket.broadcast.emit('player.updated', data);
  });
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

