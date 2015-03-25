var Config = {
  setup: {
    development: true,
    maximize: true,
    scaleToFit: true
  },
  player: {
    asset: 'player.png',
    jumpSpeed: -500
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
  levelName: 'level1.tmx',
  assets: {
    tile: {
      width: 40,
      height: 40
    }
  }
};

var Q = window.Q = Quintus({audioSupported: [ 'wav','mp3','ogg' ]})
        .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
        // Maximize this game to whatever the size of the browser is
        .setup({ maximize: true })
        // And turn on default input controls and touch input (for UI)
        .controls(true).touch()
        // Enable sounds.
        .enableSound();

// Load and init audio files.

Q.SPRITE_PLAYER = 1;
Q.SPRITE_COLLECTABLE = 2;
Q.SPRITE_ENEMY = 4;
Q.SPRITE_DOOR = 8;


Q.Sprite.extend('Actor', {
  init: function (p) {
    this._super(p, {
      sheet: "player",  // Setting a sprite sheet sets sprite width and height
      sprite: "player",
      jumpSpeed: Config.player.jumpSpeed,
      speed: 300,
      bulletSpeed: 1000,
      update: true,
      type: Q.SPRITE_PLAYER,
      collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_DOOR | Q.SPRITE_COLLECTABLE,
      standingPoints: [ [ -16, 44], [ -23, 35 ], [-23,-48], [23,-48], [23, 35 ], [ 16, 44 ]],
      duckingPoints : [ [ -16, 44], [ -23, 35 ], [-23,-10], [23,-10], [23, 35 ], [ 16, 44 ]],
      animationState: 'walk_right'
    });
    this.add(['2d', 'animation', 'tween']);
  },
  updateState: function (data) {
    this.p.x = data.x;
    this.p.y = data.y;
    this.p.direction = data.direction;
    this.p.flip = this.p.direction === 'left' ? 'x' : false;
    this.p.update = true;
    this.p.gravity = data.landed < 0 ? 0 : 1;
    this.p.animationState = data.animationState;
  },
  shoot: function () {
    var p = this.p;
    var dx = p.direction === 'right' ? 1 : -1;
    var bullet = new Q.Bullet({ 
                    x: p.x + (dx * (p.w/2 + 10)),
                    y: p.y,
                    vx: dx * Config.bullet.speed,
                    vy: 0
                  });
    this.stage.insert(bullet);
  },
  step: function (dt) {
    this.play(this.p.animationState);
  }
});

Q.Actor.extend("Player",{

  init: function (p) {

    this._super(p, {
      direction: "left",
    });

    this.p.points = this.p.standingPoints;

    this.add('2d, platformerControls, ');

    this.on("bump.top","breakTile");

    this.on("sensor.tile","checkLadder");
    this.on("enemy.hit","enemyHit");
    this.on("jump");
    this.on("jumped");
    this.add('platformerControls');

    Q.input.on('fire', this, 'shoot');
    Q.input.on("down",this, "checkDoor");
  },

  shoot: function () {
    this.p.socket.emit('player.shoot', { 
      playerId: this.p.playerId,
    });
    this._super();
  },

  jump: function(obj) {
    // Only play sound once.
    if (!obj.p.playedJump) {
      Q.audio.play('jump.mp3');
      obj.p.playedJump = true;
    }
  },

  jumped: function(obj) {
    obj.p.playedJump = false;
  },

  checkLadder: function(colObj) {
    if(colObj.p.ladder) { 
      this.p.onLadder = true;
      this.p.ladderX = colObj.p.x;
    }
  },

  checkDoor: function() {
    this.p.checkDoor = true;
  },

  resetLevel: function() {
    Q.stageScene("level1");
    this.p.strength = 100;
    this.animate({opacity: 1});
    Q.stageScene('hud', 3, this.p);
  },

  enemyHit: function(data) {
    var col = data.col;
    var enemy = data.enemy;
    this.p.vy = -150;
    if (col.normalX == 1) {
      // Hit from left.
      this.p.x -=15;
      this.p.y -=15;
    }
    else {
      // Hit from right;
      this.p.x +=15;
      this.p.y -=15;
    }
    this.p.immune = true;
    this.p.immuneTimer = 0;
    this.p.immuneOpacity = 1;
    this.p.strength -= 25;
    Q.stageScene('hud', 3, this.p);
    if (this.p.strength == 0) {
      this.resetLevel();
    }
  },

  continueOverSensor: function() {
    this.p.vy = 0;
    if(this.p.vx != 0) {
      this.play("walk_" + this.p.direction);
    } else {
      this.play("stand_" + this.p.direction);
    }
  },

  breakTile: function(col) {
    if(col.obj.isA("TileLayer")) {
      if(col.tile == 24) { col.obj.setTile(col.tileX,col.tileY, 36); }
      else if(col.tile == 36) { col.obj.setTile(col.tileX,col.tileY, 24); }
    }
    Q.audio.play('coin.mp3');
  },

  step: function(dt) {
    var processed = false;
    if (this.p.immune) {
      // Swing the sprite opacity between 50 and 100% percent when immune.
      if ((this.p.immuneTimer % 12) == 0) {
        var opacity = (this.p.immuneOpacity == 1 ? 0 : 1);
        this.animate({"opacity":opacity}, 0);
        this.p.immuneOpacity = opacity;
      }
      this.p.immuneTimer++;
      if (this.p.immuneTimer > 144) {
        // 3 seconds expired, remove immunity.
        this.p.immune = false;
        this.animate({"opacity": 1}, 1);
      }
    }

    var animationState = 'walk_left';

    if(this.p.onLadder) {
      this.p.gravity = 0;

      if(Q.inputs['up']) {
        this.p.vy = -this.p.speed;
        this.p.x = this.p.ladderX;
        animationState = 'climb';
      } else if(Q.inputs['down']) {
        this.p.vy = this.p.speed;
        this.p.x = this.p.ladderX;
        animationState = 'climb';
      } else {
        this.continueOverSensor();
      }
      processed = true;
    } 
      
    if(!processed && this.p.door) {
      this.p.gravity = 1;
      if(this.p.checkDoor && this.p.landed > 0) {
        // Enter door.
        this.p.y = this.p.door.p.y;
        this.p.x = this.p.door.p.x;
        animationState = 'climb';
        this.p.toDoor = this.p.door.findLinkedDoor();
        processed = true;
      }
      else if (this.p.toDoor) {
        // Transport to matching door.
        this.p.y = this.p.toDoor.p.y;
        this.p.x = this.p.toDoor.p.x;
        this.stage.centerOn(this.p.x, this.p.y);
        this.p.toDoor = false;
        this.stage.follow(this);
        processed = true;
      }
    } 
      
    if(!processed) { 
      this.p.gravity = 1;

      if(Q.inputs['down'] && !this.p.door) {
        this.p.ignoreControls = true;
        animationState = "duck_" + this.p.direction;        
        if(this.p.landed > 0) {
          this.p.vx = this.p.vx * (1 - dt*2);
        }
        this.p.points = this.p.duckingPoints;
      } else {
        this.p.ignoreControls = false;
        this.p.points = this.p.standingPoints;

        if(this.p.vx > 0) {
          if(this.p.landed > 0) {
            animationState = 'walk_right';
          } else {
            animationState = 'jump_right';
          }
          this.p.direction = "right";
        } else if(this.p.vx < 0) {
          if(this.p.landed > 0) {
            animationState = 'walk_left';
          } else {
            animationState = 'jump_left';
          }
          this.p.direction = "left";
        } else {
          animationState = "stand_" + this.p.direction;
        }
      }
    }

    this.p.onLadder = false;
    this.p.door = false;
    this.p.checkDoor = false;

    if (this.p.y > 2000) {
      this.p.y = 0;
    }
    this.play(animationState);

    var data = { 
      playerId: this.p.playerId,
      name: this.p.name,
      x: this.p.x, 
      y: this.p.y,
      direction: this.p.direction,
      landed: this.p.landed,
      hp: this.p.hp,
      animationState: animationState
    };
    this.p.socket.emit('player.update', data);
    PubSub.publish('updateSelf', data);
  }
});

Q.Sprite.extend("Enemy", {
  init: function(p,defaults) {

    this._super(p,Q._defaults(defaults||{},{
      sheet: p.sprite,
      vx: 50,
      defaultDirection: 'left',
      type: Q.SPRITE_ENEMY,
      collisionMask: Q.SPRITE_DEFAULT
    }));

    this.add("2d, aiBounce, animation");
    this.on("bump.top",this,"die");
    this.on("hit.sprite",this,"hit");
  },

  step: function(dt) {
    if(this.p.dead) {
      this.del('2d, aiBounce');
      this.p.deadTimer++;
      if (this.p.deadTimer > 24) {
        // Dead for 24 frames, remove it.
        this.destroy();
      }
      return;
    }
    var p = this.p;

    p.vx += p.ax * dt;
    p.vy += p.ay * dt;

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    this.play('walk');
  },

  hit: function(col) {
    if(col.obj.isA("Player") && !col.obj.p.immune && !this.p.dead) {
      col.obj.trigger('enemy.hit', {"enemy":this,"col":col});
      Q.audio.play('hit.mp3');
    }
  },

  die: function(col) {
    if(col.obj.isA("Player")) {
      Q.audio.play('coin.mp3');
      this.p.vx=this.p.vy=0;
      this.play('dead');
      this.p.dead = true;
      var that = this;
      col.obj.p.vy = -300;
      this.p.deadTimer = 0;
    }
  }
});

Q.Enemy.extend("Fly", {

});

Q.Enemy.extend("Slime", {
  init: function(p) {
    this._super(p,{
      w: 55,
      h: 34
    });
  }
});

Q.Enemy.extend("Snail", {
  init: function(p) {
    this._super(p,{
      w: 55,
      h: 36
    });
  }
});

Q.Sprite.extend('Bullet',{
  init: function (p) {
    this._super(p, { 
      w: 10,
      h: 10,
      gravity: 0,
      damage: 20
    });
        
    this.add('2d');
    this.on('bump.left', this, 'collisionLeft');
    this.on('bump.right', this, 'collisionRight');
  },
  collisionLeft: function (col) {
    this.handleCollision(col, 'left');
  },
  collisionRight: function (col) {
    this.handleCollision(col, 'right');
  },
  handleCollision: function (col, dir) {
    console.log('handleCollision');
    this.destroy();
    if (col.obj.isA('Player')) {
      var knockBack = 200 * (dir === 'left' ? 1 : -1 );
      col.obj.p.vy = -100;
      col.obj.p.hp -= this.p.damage;
    }
  },
  draw: function (ctx) {
    ctx.fillStyle = '#f00';
    ctx.fillRect(-this.p.cx, -this.p.cy, this.p.w, this.p.h);
  },

  step: function (dt) {

  }
});

Q.Sprite.extend("Collectable", {
  init: function(p) {
    this._super(p,{
      sheet: p.sprite,
      type: Q.SPRITE_COLLECTABLE,
      collisionMask: Q.SPRITE_PLAYER,
      sensor: true,
      vx: 0,
      vy: 0,
      gravity: 0
    });
    this.add("animation");

    this.on("sensor");
  },

  // When a Collectable is hit.
  sensor: function(colObj) {
    // Increment the score.
    if (this.p.amount) {
      colObj.p.score += this.p.amount;
      Q.stageScene('hud', 3, colObj.p);
    }
    Q.audio.play('coin.mp3');
    this.destroy();
  }
});

Q.Sprite.extend("Door", {
  init: function(p) {
    this._super(p,{
      sheet: p.sprite,
      type: Q.SPRITE_DOOR,
      collisionMask: Q.SPRITE_NONE,
      sensor: true,
      vx: 0,
      vy: 0,
      gravity: 0
    });
    this.add("animation");

    this.on("sensor");
  },
  findLinkedDoor: function() {
    return this.stage.find(this.p.link);
  },
  // When the player is in the door.
  sensor: function(colObj) {
    // Mark the door object on the player.
    colObj.p.door = this;
  }
});

Q.Collectable.extend("Heart", {
  // When a Heart is hit.
  sensor: function(colObj) {
    // Increment the strength.
    if (this.p.amount) {
      colObj.p.strength = Math.max(colObj.p.strength + 25, 100);
      Q.stageScene('hud', 3, colObj.p);
      Q.audio.play('heart.mp3');
    }
    this.destroy();
  }
});

Q.scene("level1",function(stage) {
  Q.stageTMX("level1.tmx",stage);
  GameState.gameStage = stage;
  // stage.add("viewport").follow(Q("Player").first());


  (function () {
    function getQueryVariable (variable) {
      var query = window.location.search.substring(1);
      var vars = query.split('&');
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] === variable) {
          return pair[1];
        }
      }
      return false;
    }

    var roomId = getQueryVariable('room');
    var socket = io(window.location.host + '/game');
    var names = ['John', 'Mary', 'Jane', 'Peter', 'Bob', 'Karen'];
    var playerName = getQueryVariable('playerName');
    if (!playerName) {
      playerName = names[Math.floor(Math.random() * 6)] + Math.floor(Math.random() * 1000);
    }

    socket.on('connect', function () {
      socket.emit('player.join', {
        name: playerName,
        roomId: roomId
      });
    });

    socket.on('player.connected.self', function (data) {
      GameState.addPlayer(data, socket);
    });

    socket.on('player.disconnected', function (data) {
      GameState.removeActor(data);
      PubSub.publish('removePlayer', data);
    });

    socket.on('player.updated', function (data) {
      GameState.updateActors(data);
      PubSub.publish('updatePlayer', data);
    });

    socket.on('player.shoot', function (data) {
      GameState.actorFire(data);
    });

    socket.on('connection.rtt.toclient', function () {
      socket.emit('connection.rtt.fromclient');
    });
  })();

});

var GameState = {
  player: null,
  actors: [],
  gameStage: null,
  addPlayer: function (data, socket) {
    if (!this.player) {
      var newPlayer = new Q.Player({
        playerId: data.playerId,
        name: data.name,
        x: 110,
        y: 400,
        socket: socket,
        hp: 100
      });
      this.player = newPlayer;
      this.gameStage.insert(this.player);
      this.gameStage.add('viewport').follow(this.player, { 
        x: true, 
        y: true
      });
    } else {
      console.log('Player already exists!');
    }
  },
  addActor: function (data) {
    var temp = new Q.Actor({ 
      playerId: data.playerId, 
      x: 110,
      y: 50
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
      console.log(data.animationState);
      actor.player.updateState(data);
    } else {
      // New actor
      this.addActor(data);
    }
  },
  actorFire: function (data) {
    var actor = this.findActor(data.playerId);
    actor.player.shoot();
  }
};

Q.loadTMX("level1.tmx, collectables.json, doors.json, enemies.json, fire.mp3, jump.mp3, heart.mp3, hit.mp3, coin.mp3, player.json, player.png", function() {
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

  var app = angular.module('NuttyNinjasX', []);
  app.controller('ScoreBoardController', ScoreBoardController);
  angular.bootstrap(document, ['NuttyNinjasX']);
});
