'use strict';

var roomManager;

function routes (rm) {
  console.log('init routes')
  roomManager = rm;
}

routes.prototype.index = function (req, res) {
  res.sendFile('index.html');
}

routes.prototype.play = function (req, res) {
  var room = req.body.room;
  console.log(room);
  roomManager.addRoom(room);
  res.sendFile('index.html');
}

module.exports = routes;
