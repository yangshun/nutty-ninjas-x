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
  $scope.roomName = '';
  $scope.playerName = '';
  $scope.chosenRoom = '';
  $scope.selectedColour = 'red';

  var socket = io(window.location.host + '/lobby');
  socket.on('lobby.state', function (data) {
    $scope.rooms = data;
    $scope.$apply();
  });

  $scope.createGame = function () {
    var roomName = $scope.roomName.replace(/[^a-zA-Z0-9]/g, '');
    var playerName = $scope.playerName.replace(/[^a-zA-Z0-9]/g, '');
    if (roomName === '' || playerName === '') {
      $scope.errorMessage = 'Please fill in valid names for room and player.';
      return;
    } else {
      $scope.errorMessage = '';
    }
    window.location.href = '/play?room=' + roomName + '&playerName=' + playerName + '&color=' + $scope.selectedColour;
  }

  $scope.chooseRoom = function (roomName) {
    $scope.chosenRoom = roomName;
    $('#joinGameModal').modal();
  }

  $scope.joinGame = function () {
    var playerName = $scope.playerName.replace(/[^a-zA-Z0-9]/g, '');
    if (playerName === '') {
      $scope.errorMessage = 'Please fill in valid name for player.';
      return;
    } else {
      $scope.errorMessage = '';
    }
    window.location.href = '/play?room=' + $scope.chosenRoom + '&playerName=' + playerName + '&color=' + $scope.selectedColour;
  }
}

app.controller('LobbyController', LobbyController);
angular.bootstrap(document, ['NuttyNinjasX']);
