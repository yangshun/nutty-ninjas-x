define('Socket', ['Scene'], function (Scene) {
  
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
  var socket = io(window.location.host + '/' + roomId);
  
  socket.on('player.connected.self', function (data) {
    Scene.addPlayer(data, socket);
  });

  // socket.on('player.connected.new', function (data) {
  //   Scene.addActor(data);
  // });

  socket.on('player.disconnected', function (data) {
    Scene.removeActor(data);
    PubSub.publish('removePlayer', data);
  });

  socket.on('player.updated', function (data) {
    Scene.updateActors(data);
    PubSub.publish('updatePlayer', data);
  });

  socket.on('player.shoot', function (data) {
    Scene.actorFire(data);
  });

  socket.on('connection.rtt.toclient', function () {
    socket.emit('connection.rtt.fromclient');
  });

  return socket;
});
