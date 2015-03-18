'use strict';

function Room (name, io) {
  var roomId = name;
  // var roomCon = io.of('/' + roomId);
  var roomCon = io;
  console.log('Created room', roomId);
  var connections = {};
  var playerId = 0;

  roomCon.on('connection', function (socket) {
    console.log('Someone connected', playerId);
    var player = { playerId: playerId };

    socket.emit('player.connected.self', player);
    socket.broadcast.emit('player.connected.new', player);

    socket.on('disconnect', function () {
      socket.broadcast.emit('player.disconnected', player);
    });

    socket.on('player.update', function (data) {
      socket.broadcast.emit('player.updated', data);
    });

    socket.on('player.shoot', function (data) {
      socket.broadcast.emit('player.shoot', data);
    });

    playerId++;
  });
}

module.exports = Room;
