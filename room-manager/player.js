function Player (name, roomId, playerId, socket) {
	this.name = name;
	this.roomId = roomId;
	this.playerId = playerId;
	this.socket = socket;
	this.startMeasuringLatency();
}

Player.prototype.startMeasuringLatency = function () {
	var that = this;
	var lastSentTime;
	var lastSentRttResponseReceived = true;

	that.socket.on('connection.rtt.fromclient', function (data) {
		lastSentRttResponseReceived = true;
		var currentTime = new Date().getTime();
		that.latency = currentTime - lastSentTime;
		console.log('Player', that.playerId, 'latency', that.latency);
	});

	var rttMeasure = setInterval(function () {
		if (lastSentRttResponseReceived) {
			that.socket.emit('connection.rtt.toclient');
			lastSentTime = new Date().getTime();
			lastSentRttResponseReceived = false;
		}
	}, 1000);
}

Player.prototype.getState = function () {
	return {
		name: this.name,
		playerId: this.playerId
	};
}

module.exports = Player;
