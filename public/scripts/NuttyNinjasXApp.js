define('NuttyNinjasXApp', ['ScoreBoardController'],
  function (ScoreBoardController) {
  
    var app = angular.module('NuttyNinjasX', []);
    app.controller('ScoreBoardController', ScoreBoardController);
  
  });
