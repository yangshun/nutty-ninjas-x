requirejs.config({ 
  baseUrl: '/scripts',
  paths: {
    bower: '../bower_components'
  }
});

(function () {
  // Start the main app logic.
  require(
    [
      'Config',
      'Q',
      'Scene',
      'Player',
      'NuttyNinjasXApp'
    ], 
    function (Config, Q, Scene, Player) {

    // Load assets
    // Q.load(['tiles_map.png', Config.player.asset, Config.levelName], function () {
    //   Q.sheet('tiles','tiles_map.png', { 
    //     tilew: Config.assets.tile.width,
    //     tileh: Config.assets.tile.height
    //   });
    //   Q.stageScene('arena');
    // });
    
    setTimeout(function () {
          Q.loadTMX("level1.tmx, collectables.json, doors.json, enemies.json, fire.mp3, jump.mp3, heart.mp3, hit.mp3, coin.mp3, player.json, player.png", function () {
      // Q.sheet('tiles','tiles_map.png', { 
      //   tilew: Config.assets.tile.width,
      //   tileh: Config.assets.tile.height
      // });
      Q.compileSheets("player.png","player.json");
      Q.compileSheets("collectables.png","collectables.json");
      Q.compileSheets("enemies.png","enemies.json");
      Q.compileSheets("doors.png","doors.json");
      Q.animations("player", {
        walk_right: { frames: [0,1,2,3,4,5,6,7,8,9,10], rate: 1/15, flip: false, loop: true },
        walk_left: { frames:  [0,1,2,3,4,5,6,7,8,9,10], rate: 1/15, flip:"x", loop: true },
        jump_right: { frames: [13], rate: 1/10, flip: false },
        jump_left: { frames:  [13], rate: 1/10, flip: "x" },
        stand_right: { frames:[14], rate: 1/10, flip: false },
        stand_left: { frames: [14], rate: 1/10, flip:"x" },
        duck_right: { frames: [15], rate: 1/10, flip: false },
        duck_left: { frames:  [15], rate: 1/10, flip: "x" },
        climb: { frames:  [16, 17], rate: 1/3, flip: false }
      });
      var EnemyAnimations = {
        walk: { frames: [0,1], rate: 1/3, loop: true },
        dead: { frames: [2], rate: 1/10 }
      };
      Q.animations("fly", EnemyAnimations);
      Q.animations("slime", EnemyAnimations);
      Q.animations("snail", EnemyAnimations);
      Q.stageScene("level1");
    });
    }, 1000);


    angular.bootstrap(document, ['NuttyNinjasX']);
  });
})();
