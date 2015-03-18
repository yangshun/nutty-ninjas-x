function Room (name, io) {
  var roomId = name;
  var roomCon = io.of('/' + roomId);
  console.log('Created room', roomId);
  var connections = {};
  var playerId = 0;

  roomCon.on('connection', function (socket) {
    var Player = require('./player');
    
    var player = new Player('Name', playerId, socket);

    console.log('Player', playerId, 'connected to', roomId);

    socket.emit('player.connected.self', player.getState());
    socket.broadcast.emit('player.connected.new', player.getState());

    socket.on('disconnect', function () {
      socket.broadcast.emit('player.disconnected', player.getState());
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
