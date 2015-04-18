function AmmoBoardController ($scope) {
  $scope.ammoLeft = 5;
  $scope.range = function (n) {
    return new Array(n);
  };

  PubSub.subscribe('ammoChange', function (event, data) {
    $scope.ammoLeft = data.ammoLeft;
    $scope.$apply();
  });
}
