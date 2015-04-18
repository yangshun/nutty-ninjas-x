function Player (name, roomId, playerId, socket, socketId) {
	this.name = name;
	this.roomId = roomId;
	this.playerId = playerId;
	this.socket = socket;
	this.socketId = socketId;

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
		playerId: this.playerId,
		socketId: this.socketId,
	};
}

module.exports = Player;
