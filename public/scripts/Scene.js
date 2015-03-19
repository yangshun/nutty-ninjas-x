define('Scene',
  ['Q', 'Config', 'Player'], 
  function (Q, Config) {

  var player;
  var actors = [];
  var gameStage;
  var background;
  var collisionLayer;
  
  Q.scene('level1', function (stage) { 
    gameStage = stage;
    background = new Q.TileLayer({ 
      dataAsset: Config.levelName, 
      layerIndex: 0, 
      sheet: 'tiles', 
      tileW: Config.map.tile.width, 
      tileH: Config.map.tile.height, 
      type: Q.SPRITE_NONE
    });
    stage.insert(background);

    collisionLayer = new Q.TileLayer({ 
      dataAsset: Config.levelName, 
      layerIndex: 1, 
      sheet: 'tiles', 
      tileW: Config.map.tile.width, 
      tileH: Config.map.tile.height
    });
    stage.collisionLayer(collisionLayer);
    
    // Init networking related events only after the scene is loaded.
    require(['Socket']);
  });

  function addPlayer (data, socket) {
    if (!player) {
      var newPlayer = new Q.Player({
        playerId: data.playerId,
        name: data.name,
        x: 110,
        y: 50,
        socket: socket,
        hp: 100
      });
      player = newPlayer;
      gameStage.insert(player);
      gameStage.add('viewport').follow(player, { 
        x: true, 
        y: true 
      }, { 
        minX: 0, 
        maxX: background.p.w, 
        minY: 0, 
        maxY: background.p.h 
      });
    } else {
      console.log('Player already exists!');
    }
  }

  function addActor (data) {
    var temp = new Q.Actor({ 
      playerId: data.playerId, 
      x: 110,
      y: 50
    });
    gameStage.insert(temp);
    actors.push({
      player: temp,
      playerId: data.playerId
    });
  }

  function findActor (playerId) {
    return actors.filter(function (obj) {
      return obj.playerId == playerId;
    })[0];
  }

  function removeActor (data) {
    var actor = findActor(data.playerId);
    if (actor) {
      gameStage.remove(actor.player);
    }
  }

  function updateActors (data) {
    var actor = findActor(data.playerId);
    if (actor) {
      actor.player.updateState(data);
    } else {
      // New actor
      addActor(data);
    }
  }

  function actorFire (data) {
    var actor = findActor(data.playerId);
    actor.player.shoot();
  }

  return {
    addPlayer: addPlayer,
    addActor: addActor,
    removeActor: removeActor,
    updateActors: updateActors,
    actorFire: actorFire
  };
});
