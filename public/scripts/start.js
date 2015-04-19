var assets = [
  'level3.tmx', 
  'collectables.json', 
  'doors.json', 
  'fire.mp3', 
  'jump.mp3', 
  'heart.mp3', 
  'hit.mp3', 
  'coin.mp3',
  'shooting-sound-1.mp3',
  'shooting-sound-2.mp3',
  'background-music.mp3',
  'player.json', 
  'player-red.png',
  'player-blue.png',
  'player-green.png',
  'player-yellow.png',
  'shuriken.png',
  'swirls-red.png',
  'swirls-blue.png',
  'swirls-green.png',
  'swirls-yellow.png',
  'gun-red.png',
  'gun-blue.png',
  'gun-green.png',
  'gun-yellow.png',
  'ninja-ghost.png'
];

Q.loadTMX(assets.join(','), function() {

  Q.compileSheets("collectables.png","collectables.json");
  Q.compileSheets("doors.png","doors.json");
  var animations = {
    walk_right: { frames: [0,1,2,3,4,5,6,7,8,9,10], rate: 1/15, flip: false, loop: true },
    walk_left: { frames:  [0,1,2,3,4,5,6,7,8,9,10], rate: 1/15, flip:"x", loop: true },
    jump_right: { frames: [13], rate: 1/10, flip: false },
    jump_left: { frames:  [13], rate: 1/10, flip: "x" },
    stand_right: { frames:[14], rate: 1/10, flip: false },
    stand_left: { frames: [14], rate: 1/10, flip:"x" },
    duck_right: { frames: [15], rate: 1/10, flip: false },
    duck_left: { frames:  [15], rate: 1/10, flip: "x" },
    climb: { frames:  [16, 17], rate: 1/3, flip: false }
  };
  ['red', 'blue', 'green', 'yellow'].forEach(function (color) {
    Q.compileSheets("player-" + color + ".png", ".json");
    Q.animations("player-" + color, animations);
  });
  
  Q.stageScene("level3");

  var app = angular.module('NuttyNinjasX', []);
  app.controller('ScoreBoardController', ScoreBoardController);
  app.controller('AmmoBoardController', AmmoBoardController);
  angular.bootstrap(document, ['NuttyNinjasX']);
});
