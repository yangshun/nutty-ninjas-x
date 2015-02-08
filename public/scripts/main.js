requirejs.config({ 
  baseUrl: 'scripts',
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
      'Player'
    ], 
    function (Config, Q, Scene, Player) {

    // Load assets
    Q.load(['tiles_map.png', Config.player.asset, Config.levelName], function () {
      Q.sheet('tiles','tiles_map.png', { 
        tilew: Config.assets.tile.width,
        tileh: Config.assets.tile.height
      });
      Q.stageScene('arena');
    });
  });
})();