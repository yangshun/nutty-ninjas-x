define(['Socket'], function (Socket) {
  
  function ScoreBoardController ($scope) {
    $scope.players = {};
    $scope.playerName = '';

    PubSub.subscribe('setPlayerName', function (event, data) {
      $scope.playerName = data.name;
      $scope.players[data.playerId] = {
        name: data.name,
        hp: 100
      };
      $scope.$apply();
    });

    PubSub.subscribe('updatePlayer', function (event, data) {
      $scope.players[data.playerId] = {
        name: data.name,
        hp: 100
      };
      $scope.$apply();
    });
  }

  return ScoreBoardController;
});
