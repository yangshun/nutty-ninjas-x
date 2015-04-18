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
			// Update the server game state
			if (rooms[roomId][data.playerId] != undefined) {
				rooms[roomId][data.playerId].gameState = data;
			}

			// Boardcast to all player in room
			socket.broadcast.to(roomId).emit('player.updated', data);
		});

		socket.on('player.shoot', function (data) {
			data.latency = player.latency;
			socket.broadcast.to(roomId).emit('player.shoot', data);
		});

		playerId++;
	});
}

module.exports = RoomManager;
