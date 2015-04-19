
function Player (name, roomId, playerId, color, socket, socketId) {
	this.name = name;
	this.roomId = roomId;
	this.playerId = playerId;
	this.color = color;
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
		that.latency = currentTime - lastSentTime / 2; // Latency is half rtt
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
		color: this.color
	};
}

module.exports = Player;
