var io;
var rooms = {};			// Associative array of rooms, indexed by roomId
						// Each room is an associative array of player state, indexed by playerId
var sockets = {};		// Associative array of sockets, indexed by playerId

function RoomManager (server) {
	var that = this;
	this.connections = {};
	io = require('socket.io')(server);

	// Lobby connection - Update the lobby state to all player connected to this namespace
	var lobbyCon = io.of('/lobby');
	lobbyCon.on('connection', function (socket) {
		socket.emit('lobby.state', rooms);
	});

	// Room connection - When player join a room
	var roomCon = io.of('/game');
	roomCon.on('connection', function (socket) {
		var Player = require('./player');
		var player = null;							// The current player of this connection
		var roomId;									// The current roomId this player join
		var thisPlayerId = (new Date()).getTime();	// New PlayerId - generated by taking timestamp

		/* 'player.join' event - send immediately by client upon connected
		 * to the server
		 */
		socket.on('player.join', function (data) {
			roomId = data.roomId;
			socket.join(roomId);

			// Create room if it does not existed -> This player is a host
			if (!rooms[roomId]) {
				rooms[roomId] = {};
			}

			// Create player and add to list
			player = new Player(data.name, roomId, thisPlayerId, data.color, socket, socket.id);
			rooms[roomId][thisPlayerId] = player.getState();
			sockets[thisPlayerId] = socket;
			
			// Update the newly joined player about the current room state
			// i.e: send all information about all player in the room
			var payload = {
				room : rooms[roomId],
				id : thisPlayerId
			};
			socket.emit('player.connected.self', payload);

			// Update the lobby about the new player (and new room if just created)
			lobbyCon.emit('lobby.state', rooms);
		});

		/* 'player.disconnected' event - send immediately by client upon disconnection
		 * to the server
		 */
		socket.on('disconnect', function () {
			// Boardcast to other player about this player disconnection
			socket.broadcast.to(roomId).emit('player.disconnected', player.getState());

			// Remove the player from list
			var room = rooms[player.roomId];
			delete room[player.playerId];
			delete sockets[player.playerId];

			// Remove the room if empty
			if (Object.keys(room).length === 0) {
				delete rooms[player.roomId];
			}

			// Update the lobby!
			lobbyCon.emit('lobby.state', rooms);
		});

		/* 'player.update' event - send at every step by client to the server
		 * data containing game state of that player, including playerId, name, hp, position, etc.
		 */
		socket.on('player.update', function (data) {
			// Add latency to the data
			data.latency = player.latency;

			// Update the server game state
			var room = rooms[roomId];
			var myId = data.playerId;
			if (room[myId] != undefined) {
				room[myId].gameState = data;
			}

			// Selectively forward the update event to other player
			for (playerId in room) {

				// Do not forward to itself
				if (playerId != myId) {
					var forward = false;

					// Distance based interest management

					// Simple distance calculation
					var distance = 0;
					if (room[myId] != undefined && room[myId].gameState != undefined && 
						room[playerId] != undefined && room[playerId].gameState != undefined) {
						distance = Math.abs(room[myId].gameState.x - room[playerId].gameState.x) + Math.abs (room[myId].gameState.y - room[playerId].gameState.y);
					}

					if (distance < 2 * 1000) {
						// Close enough! Send everything
						forward = true;

					} else if (distance < 4 * 1000) {
						// Quite far away, not interested
						// But might still be visible in large screen

						// 50% chance to discard all optional fields
						// Effectively reduce package size
						// Client will use the old data instead
						var discardChance = Math.random () < 0.5;
						if (discardChance) {
							delete data.vx;
							delete data.vy;
							delete data.landed;
							delete data.onLadder;
							delete data.ducked;
						}

						// 70% chance to forward the package
						var forwardChance = Math.random() < 0.7;
						forward = forwardChance;

					} else {
						// Super far away, definitely not interested
						// But still need forward to at least get update
						// on position (for future distance calculation)
						// and hp (for hud displace)

						// Don't even bother sending optional fields
						// Only send position and hp
						delete data.vx;
						delete data.vy;
						delete data.landed;
						delete data.onLadder;
						delete data.ducked;

						// Only forward 40% of the package
						var forwardChance = Math.random () < 0.4;
						forward = forwardChance;
					}

					// Forward the package to the recipient
					if (forward) {

						// 'player.updated' is sent from server to client
						// 'player.update' is sent from client to server 
						sockets[playerId].emit ('player.updated', data);
					}
				}
			}
		});

		/* 'player.shoot' event - send every time the client shoots something
		 */
		socket.on('player.shoot', function (data) {
			// Add latency to the data
			data.latency = player.latency;

			// Boardcast too all player except the sender
			socket.broadcast.to(roomId).emit('player.shoot', data);
		});

		/* 'player.death' event - send every time the client dies
		 */
		socket.on('player.death', function (data) {
			// Add latency to the data
			data.latency = player.latency;

			// Boardcast too all player except the sender
			socket.broadcast.to(roomId).emit('player.death', data);
		});
	});
}

module.exports = RoomManager;
