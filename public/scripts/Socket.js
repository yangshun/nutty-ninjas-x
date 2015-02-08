define('Socket', ['Scene'], function (Scene) {
  
  var socket = io();
  
  socket.on('player.connected.self', function (data) {
    Scene.addPlayer(data, socket);
  });

  socket.on('player.connected.new', function (data) {
    Scene.addActor(data);
  });

  socket.on('player.disconnected', function (data) {
    Scene.removeActor(data);
  });

  socket.on('player.updated', function (data) {
    Scene.updateActors(data);
  });

});
