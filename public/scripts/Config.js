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
    bullet: {
      speed: 500
    },
    map: {
      tile: {
        width: 40,
        height: 40
      }
    },
    levelName: 'arena2.tmx',
    assets: {
      tile: {
        width: 40,
        height: 40
      }
    }
  };

  return config;
});



