define('Config', [], function () {

  var config = {
    setup: {
      development: true,
      maximize: true,
      scaleToFit: true
    },
    player: {
      asset: 'player.png',
      jumpSpeed: -380
    },
    map: {
      tile: {
        width: 70,
        height: 70
      }
    },
    levelName: 'arena.tmx',
    assets: {
      tile: {
        width: 70,
        height: 70
      }
    }
  };

  return config;
});



