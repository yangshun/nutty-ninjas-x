var Room = require('./room');

var io;
var rooms = {};

function RoomManager (server) {
  io = require('socket.io')(server);
}

RoomManager.prototype.newPlayerJoinsRoom = function (roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = new Room(roomId, io);
  }
}

module.exports = RoomManager;
