// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 3000;

// Initialize our room management instance
var RoomManager = require('./room-manager');
var roomManager = new RoomManager(server);

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
app.use(app.router);

// Routing
app.get('/play', function (req, res) {
  var room = req.query.room;
  roomManager.newPlayerJoinsRoom(room);
  res.sendfile(__dirname + '/public/index.html');
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
