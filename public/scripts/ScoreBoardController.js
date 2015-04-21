function ScoreBoardController ($scope) {
  $scope.players = {};
  $scope.playerName = '';

  PubSub.subscribe('updateSelf', function (event, data) {
    $scope.playerName = data.name;
    var playerId = data.playerId;
    if ($scope.players.hasOwnProperty(playerId)) {
      $scope.players[playerId].hp = data.hp;
    } else {
      $scope.players[playerId] = {
        name: data.name,
        hp: data.hp,
        kills: 0,
        deaths: 0
      };
    }
    $scope.$apply();
  });

  PubSub.subscribe('updatePlayer', function (event, data) {
    var playerId = data.playerId;
    if ($scope.players.hasOwnProperty(playerId)) {
      $scope.players[playerId].hp = data.hp;
    } else {
      $scope.players[playerId] = {
        name: data.name,
        hp: data.hp,
        kills: 0,
        deaths: 0
      };
    }
    $scope.$apply();
  });

  PubSub.subscribe('updateScoreboard', function (event, data) {
    for (playerId in data) {
      if ($scope.players.hasOwnProperty(playerId)) {
        $scope.players[playerId].kills = data[playerId].kills;
        $scope.players[playerId].deaths = data[playerId].deaths;
      }
    }
    $scope.$apply();
  });

  PubSub.subscribe('removePlayer', function (event, data) {
    delete $scope.players[data.playerId];
    $scope.$apply();
  });
}
