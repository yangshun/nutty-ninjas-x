function AmmoBoardController ($scope) {
  $scope.ammoLeft = 0;
  $scope.range = function (n) {
    return new Array(n);
  };

  PubSub.subscribe('updateAmmo', function (event, data) {
    $scope.ammoLeft = data.ammoLeft;
    $scope.$apply();
  });
}
