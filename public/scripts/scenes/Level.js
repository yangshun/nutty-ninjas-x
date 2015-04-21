

Q.scene("level", function (stage) {

	// Initialize stage and play background music
	GameState.gameStage = stage;
	Q.stageTMX('level.tmx', stage);

	var backgroundMusic = 'background-music.mp3';
	PubSub.subscribe('toggleMusic', function (event, data) {
    var state = data.state;
    if (state) {
    	Q.audio.play(backgroundMusic, { 
				loop: true 
			});
    } else {
    	Q.audio.stop(backgroundMusic);
    }
  });

	(function () {
		// Get the variable from url query string
		function getQueryVariable (variable) {
			var query = window.location.search.substring(1);
			var vars = query.split('&');
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split('=');
				if (pair[0] === variable) {
					return pair[1];
				}
			}
			return false;
		}

		var roomId = getQueryVariable('room');
		var socket = io(window.location.host + '/game');

		// Some default names, will be given randomly to player if their name is empty
		var names = ['John', 'Mary', 'Jane', 'Peter', 'Bob', 'Karen', 'YangShun', 'ZhengHan', 'TrungHieu'];
		var playerName = getQueryVariable('playerName');
		if (!playerName) {
			playerName = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 1000);
		}

		// Color will also be given randomly to player if their color is empty
		var colors = ['red', 'blue', 'green', 'yellow'];
		var color = getQueryVariable('color');
		if (!color || colors.indexOf(color) === -1) {
			color = colors[Math.floor(Math.random() * colors.length)];
		}

		// On conntected - send 'player.join' request to server immediately
		socket.on('connect', function () {
			socket.emit('player.join', {
				name: playerName,
				roomId: roomId,
				color: color
			});
		});

		// On 'player.conntected.self' - server just sent the all whole state
		// Initialize the player's ninja as Player and other ninjas as Actor
		socket.on('player.connected.self', function (data) {
			var room = data.room;
			var pid = data.id;

			for (id in room) {
				if (pid == id) {
					GameState.addPlayer(room[id], socket);		
				} else {
					GameState.addActor(room[id]);
				}
			}
		});

		socket.on('player.disconnected', function (data) {
			GameState.removeActor(data);
			PubSub.publish('removePlayer', data);
		});

		socket.on('player.updated', function (data) {
			GameState.updateActors(data);
			PubSub.publish('updatePlayer', data);
			GameState.updateLatency(data.latency);
		});

		socket.on('player.shoot', function (data) {
			GameState.actorFire(data);
			GameState.updateLatency(data.latency, data.maxLatency);
		});

		socket.on('player.death', function (data) {
			GameState.addNinjaGhost(data);
			GameState.updateLatency(data.latency, data.maxLatency);
		});

		socket.on('connection.rtt.toclient', function () {
			socket.emit('connection.rtt.fromclient');
		});

		socket.on('player.damage', function (data) {
			GameState.addDamageIndicator(data);
			GameState.updateLatency(data.latency, data.maxLatency);
		});

		PubSub.subscribe('player.damage', function (event, data) {
			socket.emit('player.damage', data);
		});

	})();

});
