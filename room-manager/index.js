var io;
var rooms = {};
var sockets = {};

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
			player = new Player(data.name, roomId, thisPlayerId, socket, socket.id);
			rooms[roomId][thisPlayerId] = player.getState();
			sockets[thisPlayerId] = socket;
			socket.emit('player.connected.self', player.getState());
			socket.broadcast.to(roomId).emit('player.connected.new', player.getState());
			lobbyCon.emit('lobby.state', rooms);
		});

		socket.on('disconnect', function () {
			socket.broadcast.to(roomId).emit('player.disconnected', player.getState());
			var room = rooms[player.roomId];
			delete room[player.playerId];
			delete sockets[player.playerId];
			if (Object.keys(room).length === 0) {
				delete rooms[player.roomId];
			}
			lobbyCon.emit('lobby.state', rooms);
		});

		socket.on('player.update', function (data) {
			/*// Update the server game state
			var room = rooms[roomId];
			var myId = data.playerId;
			if (room[myId] != undefined) {
				room[myId].gameState = data;
			}

			for (playerId in room) {
				if (playerId != myId) {
					var forward = false;

					// Simple distance calculation
					var distance = 0;
					if (room[myId].gameState != null && room[playerId].gameState != null) {
						Math.abs (room[myId].gameState.x - room[playerId].gameState.x) + Math.abs (room[myId].gameState.y - room[playerId].gameState.y);
					}

					if (distance < 5 * 1000) {
						// Close enough! Send everything
						forward = true;

					} else if (distance < 10 * 1000) {
						// Quite far away, not interested
						// But might still be visible in large screen

						// 30% chance to discard all optional fields
						// Effectively reduce package size
						var discardChance = Math.random () < 0.3;
						if (discardChance) {
							delete data.vx;
							delete data.vy;
							delete data.landed;
							delete data.onLadder;
							delete data.ducked;
						}

						// Only forward 70% of the package
						var forwardChance = Math.random () < 0.7;
						forward = true;

					} else {
						// Super far away, definitely not interested

						// Don't even bother sending optional fields
						delete data.vx;
						delete data.vy;
						delete data.landed;
						delete data.onLadder;
						delete data.ducked;

						// Only forward 40% of the package
						var forwardChance = Math.random () < 0.4;
						forward = true;
					}

					// Forward the package to the recipient
					if (true) {
						sockets[playerId].emit ('player.updated', data);
					}
				}
			}*/

			// Boardcast to all player in room
			/*socket.broadcast.to(roomId).emit('player.updated', data);*/

			var room = rooms[roomId];
			for (playerId in room) {
				if (playerId != data.playerId) {
					console.log (data.playerId + " move event to " + playerId);
					sockets[playerId].emit('player.updated', data);
				}
			}
		});

		socket.on('player.shoot', function (data) {
			data.latency = player.latency;
			/*socket.broadcast.to(roomId).emit('player.shoot', data);*/

			var room = rooms[roomId];
			for (playerId in room) {
				if (playerId != data.playerId) {
					console.log (data.playerId + " shoot event to " + playerId);
					sockets[playerId].emit('player.shoot', data);
				}
			}
		});

		playerId++;
	});
}

module.exports = RoomManager;
