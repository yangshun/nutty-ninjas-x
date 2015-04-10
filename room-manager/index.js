var io;
var rooms = {};

function RoomManager (server) {
  var that = this;
  io = require('socket.io')(server);

  var lobbyCon = io.of('/lobby');
  lobbyCon.on('connection', function (socket) {
    socket.emit('lobby.state', rooms);
  });

  var that = this;
  this.connections = {};
  var playerId = 0;

  var roomCon = io.of('/game');
  roomCon.on('connection', function (socket) {
    var Player = require('./player');
    var player = null;
    var roomId;
    var thisPlayerId = playerId;

    socket.on('player.join', function (data) {
      roomId = data.roomId;
      socket.join(roomId);
      if (!rooms[roomId]) {
        rooms[roomId] = {};
      }
      player = new Player(data.name, roomId, thisPlayerId, socket);
      console.log('Player', thisPlayerId, 'connected to', roomId);
      rooms[roomId][thisPlayerId] = player.getState();
      socket.emit('player.connected.self', player.getState());
      socket.broadcast.to(roomId).emit('player.connected.new', player.getState());
      lobbyCon.emit('lobby.state', rooms);
    });

    socket.on('disconnect', function () {
      socket.broadcast.to(roomId).emit('player.disconnected', player.getState());
      var room = rooms[player.roomId];
      delete room[player.playerId];
      if (Object.keys(room).length === 0) {
        delete rooms[player.roomId];
      }
      lobbyCon.emit('lobby.state', rooms);
    });

    socket.on('player.update', function (data) {
      socket.broadcast.to(roomId).emit('player.updated', data);
    });

    socket.on('player.shoot', function (data) {
      var dataUpdated = {
        playerid: data.playerid,
        startX: data.startX,
        startY: data.startY,
        targetX: data.targetX,
        targetY: data.targetY,
        latency: 0
      }
      console.log("playerId: " + dataUpdated.playerid);
      socket.broadcast.to(roomId).emit('player.shoot', dataUpdated);
    });

    playerId++;
  });
}

module.exports = RoomManager;
