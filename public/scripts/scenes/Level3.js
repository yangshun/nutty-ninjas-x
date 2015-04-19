Q.scene("level3", function (stage) {
	Q.stageTMX("level3.tmx",stage);
	Q.audio.play('background-music.mp3',{ 
		loop: true 
	});

	GameState.gameStage = stage;
	// stage.add("viewport").follow(Q("Player").first());

	(function () {
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

		var names = ['John', 'Mary', 'Jane', 'Peter', 'Bob', 'Karen'];
		var playerName = getQueryVariable('playerName');
		if (!playerName) {
			playerName = names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 1000);
		}

		var colors = ['red', 'blue', 'green', 'yellow'];
		var color = getQueryVariable('color');
		if (!color || colors.indexOf(color) === -1) {
			color = colors[Math.floor(Math.random() * colors.length)];
		}

		socket.on('connect', function () {
			socket.emit('player.join', {
				name: playerName,
				roomId: roomId,
				color: color
			});
		});

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
		});

		socket.on('player.shoot', function (data) {
			GameState.actorFire(data);
		});

		socket.on('player.death', function (data) {
			GameState.addNinjaGhost(data);
		});

		socket.on('connection.rtt.toclient', function () {
			socket.emit('connection.rtt.fromclient');
		});
	})();

});
