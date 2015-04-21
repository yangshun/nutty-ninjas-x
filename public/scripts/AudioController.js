function AudioController ($scope) {
  $scope.musicPlaying = true;

  function updateGameEngine() {
    PubSub.publish('toggleMusic', {
      state: $scope.musicPlaying
    });
  }

  $scope.toggleMusic = function (n) {
    $scope.musicPlaying = !$scope.musicPlaying;
    updateGameEngine();
  };

  updateGameEngine();
}
