var GameState = {
  player: null,
  actors: [],
  gameStage: null,
  addPlayer: function (data, socket) {
    if (!this.player) {

      var xPos = Math.floor(Math.random() * (5000 - 500)) + 500;

      var newPlayer = new Q.Player({
        playerId: data.playerId,
        name: data.name,
        name_dirty: true,     // Flag to indicate whether name need to be boardcast
        x: xPos,
        y: 0,
        socket: socket,
        hp: 200,
        hp_dirty: true,       // Flag to indicate whether hp has changed and need to be boardcast
        targetX: xPos,
        targetY: 0
      });
      this.player = newPlayer;
      this.gameStage.insert(this.player);
      
      this.gameStage.add('viewport').follow(this.player, { 
        x: true, 
        y: true
      });
      // Temp fix: Add yourself to list of actors
      this.actors.push({
        player: newPlayer,
        playerId: data.playerId
      });
    } else {
      console.log('Player already exists!');
    }
  },
  addActor: function (data) {
    var temp = new Q.Actor({ 
      playerId: data.playerId, 
      x: 0,
      y: 0
    });
    this.gameStage.insert(temp);
    this.actors.push({
      player: temp,
      playerId: data.playerId
    });
  },
  findActor: function (playerId) {
    return this.actors.filter(function (obj) {
      return obj.playerId == playerId;
    })[0];
  },
  removeActor: function (data) {
    var actor = this.findActor(data.playerId);
    if (actor) {
      this.gameStage.remove(actor.player);
    }
  },
  updateActors: function (data) {
    var actor = this.findActor(data.playerId);
    if (actor) {
      //console.log(data.animationState);
      actor.player.updateState(data);
    } else {
      // New actor
      this.addActor(data);
    }
  },
  actorFire: function (data) {
    var actor = this.findActor(data.playerId);
    actor.player.shootWithData(data);
  },
  createPortal: function (data) {
    var actor = this.findActor(data.playerId).player;
    var portal = new Q.Portal({
                        x: data.targetX,
                        y: data.targetY,
                        portalType: data.portalType,
                        belongsToPlayer: actor
                      });
    if (data.portalType === 'pink') {
      if (actor.portalA) {
        actor.portalA.destroy();
      }
      actor.portalA = portal;
    } else {
      if (actor.portalB) {
        actor.portalB.destroy();
      }
      actor.portalB = portal;
    }
    this.gameStage.insert(portal);
  },
  actorTombstone: function (data) {
    //var actor = this.findActor(data.playerId).player;
    //var tombstone = actor.p.tombstone;
    //tombstone.p.x = data.x;
    //tombstone.p.y = data.y;
    //tombstone.p.lifetime = data.life;

    var tombstone = new Q.Tombstone({
      px: data.px,
      py: data.py,
      x: data.x,
      y: data.y,
      lifetime: data.lifetime
    });
    this.gameStage.insert(tombstone);
  }
};
