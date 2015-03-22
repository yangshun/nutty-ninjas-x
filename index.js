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
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

app.get('/play', function (req, res) {
  res.sendfile(__dirname + '/public/play.html');
});

app.get('/lobby', function (req, res) {
  res.sendfile(__dirname + '/public/lobby.html');
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
