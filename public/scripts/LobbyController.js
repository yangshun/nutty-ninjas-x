var app = angular.module('NuttyNinjasX', []);
app.filter('keylength', function(){
  return function(input){
    if(!angular.isObject(input)){
      throw Error("Usage of non-objects with keylength filter!!")
    }
    return Object.keys(input).length;
  }
});

function LobbyController ($scope) {
  $scope.rooms = {};

  var socket = io(window.location.host + '/lobby');
  socket.on('lobby.state', function (data) {
    $scope.rooms = data;
    $scope.$apply();
  });
}

app.controller('LobbyController', LobbyController);
angular.bootstrap(document, ['NuttyNinjasX']);
