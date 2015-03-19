function ScoreBoardController ($scope) {
  $scope.players = {};
  $scope.playerName = '';

  PubSub.subscribe('updateSelf', function (event, data) {
    $scope.playerName = data.name;
    $scope.players[data.playerId] = {
      name: data.name,
      hp: data.hp
    };
    $scope.$apply();
  });

  PubSub.subscribe('updatePlayer', function (event, data) {
    $scope.players[data.playerId] = {
      name: data.name,
      hp: data.hp
    };
    $scope.$apply();
  });

  PubSub.subscribe('removePlayer', function (event, data) {
    delete $scope.players[data.playerId];
    $scope.$apply();
  });
}
