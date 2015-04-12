var Config = {
  setup: {
    development: true,
    maximize: true,
    scaleToFit: true
  },
  player: {
    asset: 'player.png',
    jumpSpeed: -750
  },
  bullet: {
    speed: 750,
    typeShuriken: 0,
    typePortal: 1,
    typeLast: 2
  },
  map: {
    tile: {
      width: 40,
      height: 40
    }
  },
  levelName: 'level2.tmx',
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
Q.SPRITE_DOOR = 8;
Q.SPRITE_UI = 32;


Q.Sprite.extend('Actor', {
  init: function (p) {
    this._super(p, {
      sheet: "player",  // Setting a sprite sheet sets sprite width and height
      sprite: "player",
      scale: 0.70, 
      jumpSpeed: Config.player.jumpSpeed,
      speed: 400,
      bulletSpeed: 1000,
      update: true,
      type: Q.SPRITE_PLAYER,
      collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_DOOR | Q.SPRITE_COLLECTABLE,
      standingPoints: [ [ -16, 44], [ -23, 35 ], [-23,-48], [23,-48], [23, 35 ], [ 16, 44 ]],
      duckingPoints : [ [ -16, 44], [ -23, 35 ], [-23,-10], [23,-10], [23, 35 ], [ 16, 44 ]],
      animationState: 'walk_right',
      weaponType: Config.bullet.typeShuriken
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
    console.log('actor.shoot');
    var p = this.p;
    var dx = p.direction === 'right' ? 1 : -1;
    var bullet = new Q.Bullet({ 
                    x: p.x + (dx * (p.w/2 + 10)),
                    y: p.y,
                    vx: dx * Config.bullet.speed,
                    vy: 0
                  });
    //this.stage.insert(bullet);

    var shuriken = new Q.Shuriken({ 
                    x: p.x + (dx * (p.w/2 + 20)),
                    y: p.y,
                    vx: dx * Config.bullet.speed,
                    vy: 0});
    this.stage.insert(shuriken);
  },

  shootWithData: function(data)   {
    //simulate latency
    //data.latency = 500;
    console.log("latency: " + data.latency);
    //find out which x-direction the bullet is traveling towards
    var bulletXDirection = data.targetX - data.startX;
    bulletXDirection = bulletXDirection / Math.abs(bulletXDirection);
    var bulletYDirection = data.targetY - data.startY;
    bulletYDirection = bulletYDirection / Math.abs(bulletYDirection);

    //find out if the bullet is traveling towards the local player
    var travelingToLocalPlayer = false;
    if(Number(data.playerId) != Number(GameState.player.p.playerId))
    {
      if((GameState.player.p.x > data.startX )
        && (bulletXDirection > 0))
      {
        travelingToLocalPlayer = true;
      }
      else if((GameState.player.p.x < data.startX )
            && (bulletXDirection < 0))
      {
        travelingToLocalPlayer = true;
      } 
    }

    //get the x and y speed for the case if there is no modification 
    //needed
    //now we must find the x-y ratio of the triangle 
    //formed by the starting point, ending point, and 
    //the x-axis, y-axis. Using this ratio, and the speed 
    //as the hypotenus, we can then figure out how much 
    //to modify the bullet speed by
    var distanceX = Math.abs(data.targetX - data.startX);
    var distanceY = Math.abs(data.targetY - data.startY);
    var diagonalDistance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
    var speedToDistanceRatio = Config.bullet.speed * 1.2 / diagonalDistance;

    var finalSpeedX = speedToDistanceRatio * (data.targetX - data.startX);
    var finalSpeedY = speedToDistanceRatio * (data.targetY - data.startY);

    //modify the speed if the shuriken is traveling towards 
    //the local player
    if(travelingToLocalPlayer 
      && (data.playerId != GameState.player.p.playerId) )
    {

      //here we modify the x distance by the distance to speed ratio.
      //the logic here is that first we assume the distance from the 
      //starting xy coordinate to the target xy coordinate is covered 
      //in one unit time. But we know that is unlikely, so by using 
      //the ratio of the actual speed and the hypotenus, we can tell 
      //what is the ratio we must modify the (end-start) distance to 
      //get the respective x-speed and y-speed, then we can use this 
      //adjusted speed to find out how much to modify the bullet speed 
      //by
      var adjustedSpeedX = speedToDistanceRatio * distanceX;

      //we will only use the x-speed to find the time it would take 
      //to reach the player's x coordinate
      var timeToReach = Math.abs(data.startX - GameState.player.p.x) / adjustedSpeedX;

      //now we will adjust the expected time to reach by minusing 
      //the RTT
      var timeToReachModified = Math.max((timeToReach - (data.latency/1000)), 0.1);

      //now find the final speed x
      finalSpeedX = (data.targetX - data.startX) / timeToReachModified;

      //get the final speed for the y axis
      finalSpeedY = (data.targetY - data.startY) / timeToReachModified;
    }

    //generate a shuriken based on the data
    var p = this.p;
    var finalSpeed = Math.sqrt((finalSpeedX * finalSpeedX) + (finalSpeedY * finalSpeedY));
    var offsetRatio = p.w * 1.0 / finalSpeed;
    console.log("final x: " + finalSpeedX);
    console.log("final y: " + finalSpeedY);
    console.log("p.w: " + p.w);
    if(this.p.weaponType == Config.bullet.typeShuriken)
    {
      var shuriken = new Q.Shuriken({ 
                      x: data.startX + finalSpeedX * offsetRatio,
                      y: data.startY + finalSpeedY * offsetRatio,
                      vx: finalSpeedX,
                      vy: finalSpeedY,
                      playerId: data.playerId});
      this.stage.insert(shuriken);
    }
    else if(this.p.weaponType == Config.bullet.typePortal)
    {
      var shuriken = new Q.PortalBullet({ 
                      x: data.startX + finalSpeedX * offsetRatio * 1.3,
                      y: data.startY + finalSpeedY * offsetRatio * 1.3,
                      vx: finalSpeedX,
                      vy: finalSpeedY,
                      playerId: data.playerId,
                      targetX: data.targetX,
                      targetY: data.targetY});
      this.stage.insert(shuriken);
    }

  },

  step: function (dt) {
    this.play(this.p.animationState);
  }
});

Q.Actor.extend("Player",{

  init: function (p) {

    this._super(p, {
      direction: "left"
    });

    this.p.points = this.p.standingPoints;

    this.add('2d, platformerControls, ');

    this.on("bump.top","breakTile");

    this.on("sensor.tile","checkLadder");
    this.on("jump");
    this.on("jumped");
    this.add('platformerControls');

    Q.input.on('fire', this, 'shoot');
    Q.input.on("down",this, "checkDoor");
    Q.input.on('e', this, 'toggleWeapon');

    Q.el.addEventListener('mousemove',function(e) {
      var x = e.offsetX || e.layerX,
          y = e.offsetY || e.layerY,
          stage = Q.stage();

      var stageX = Q.canvasToStageX(x, stage),
      stageY = Q.canvasToStageY(y, stage);

      //console.log("stageX: " + stageX);
      //console.log("stageY: " + stageY);
    });

    var self = this;

    //this.touchstart = fucntion(e) {self.touchstart(e);};

    Q.el.addEventListener('touchend', this.touchEnd);
    Q.el.addEventListener('mouseup', this.touchEnd);
  },

  touchEnd: function(e)   {

    console.log("touchstart!");
      var x = e.offsetX || e.layerX,
          y = e.offsetY || e.layerY,
          stage = Q.stage();

      var stageX = Q.canvasToStageX(x, stage),
      stageY = Q.canvasToStageY(y, stage);

      console.log("stageX: " + stageX);
      console.log("stageY: " + stageY);

      //build the data package to be sent to the shoot function
      var shootingData = {
        playerId: GameState.player.p.playerId,
        startX: GameState.player.p.x,
        startY: GameState.player.p.y,
        targetX: stageX,
        targetY: stageY,
        latency: 0,
        weaponType: GameState.player.p.weaponType
      };
      GameState.player.p.socket.emit('player.shoot', shootingData);
      //this._super();
      //this.actor.shoot(firing_data);
      GameState.player.shootWithData(shootingData);
  },

  toggleWeapon: function ()   {
    console.log("toggleWeapon!");
    this.p.weaponType = (this.p.weaponType + 1) % Config.bullet.typeLast;
    console.log("weapon tyep is now: " + this.p.weaponType);
  },

  shoot: function () {
    console.log('player.shoot is deprecated!');
  },

  shootWithData: function(data)   {

    this._super(data);
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
    Q.stageScene("level2");
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


    //move the ui elements
    var myAsset = "shuriken.png";
    if(this.p.weaponType == Config.bullet.typeShuriken)
    {
      myAsset = "shurikenRed.png";
    }
    else if(this.p.weaponType == Config.bullet.typePortal)
    {
      myAsset = "whirlpoolPink.png";
    }
    this.p.weaponIndicator.updateStuff({
      x: this.p.x + 0.0, 
      y: this.p.y + 20.0,
      asset: myAsset});
  }
});

Q.Sprite.extend('Shuriken', {
  init: function (p) {
    this._super(p, { 
      w: 0,
      h: 0,
      asset: "shurikenRed.png",
      scale: 0.05,
      gravity: 0.00,
      damage: 20,
      lifetime: 5,
      playerId: p.playerId
    });
        
    this.add('2d');
    this.on('bump.left', this, 'collisionLeft');
    this.on('bump.right', this, 'collisionRight');
    this.on('bump.bottom', this, 'collisionBottom');
    this.on('bump.top', this, 'collisionTop');
  },
  collisionLeft: function (col) {
    this.handleCollision(col, 'left');
  },
  collisionRight: function (col) {
    this.handleCollision(col, 'right');
  },
  collisionBottom: function (col)   {
    this.handleCollision(col, 'bottom');
  },
  collisionTop: function (col) {
    this.handleCollision(col, 'top');
  },
  handleCollision: function (col, dir) {
    //skip if the the object being hit is the owner
    if(col.obj.isA('Player') 
      && (this.p.playerId == col.obj.p.playerId))
    {
      return;
    }
    this.destroy();
    if (col.obj.isA('Player')) {
      //var knockBack = 200 * (dir === 'left' ? 1 : -1 );
      col.obj.p.vy = -100;
      col.obj.p.hp -= this.p.damage;
    }
  },

  step: function (dt) {
    this.p.angle += dt * 4 * 360;
    this.p.lifetime -= dt;

    if(this.p.lifetime <= 0)
    {
      this.destroy();
    }
  }
});

Q.Sprite.extend('WeaponIndicator', {
  init: function (p) {
    this._super(p, { 
      w: 0,
      h: 0,
      asset: "whirlpool2.png",
      scale: 0.05,
      gravity: 0.00,
      damage: 20,
      lifetime: 5,
      z: 1,
      type: Q.SPRITE_UI,
      collisionMask: Q.SPRITE_NONE
    });
        
    this.add('2d');
  },

  updateStuff: function(data)  {
    //console.log("update stuff!");
    this.p.x = data.x;
    this.p.y = data.y;
    this.p.asset = data.asset;
  },

  step: function (dt) {
    var rotationRatio = 1;
    if(this.p.asset == "whirlpool2.png")
    {
      rotationRatio = 1;
    }
    else if(this.p.asset == "shurikenRed.png")
    {
      rotationRatio = 4;
    }
    this.p.angle += dt * rotationRatio * 360;
  }
});


Q.Sprite.extend('PortalBullet', {
  init: function (p) {
    this._super(p, { 
      w: 0,
      h: 0,
      asset: "whirlpoolPink.png",
      scale: 0.05,
      gravity: 0.00,
      damage: 20,
      lifetime: 5
    });
        
    this.add('2d');
    this.on('bump.left', this, 'collisionLeft');
    this.on('bump.right', this, 'collisionRight');
    this.on('bump.bottom', this, 'collisionBottom');
    this.on('bump.top', this, 'collisionTop');
  },
  collisionLeft: function (col) {
    this.handleCollision(col, 'left');
  },
  collisionRight: function (col) {
    this.handleCollision(col, 'right');
  },
  collisionBottom: function (col)   {
    this.handleCollision(col, 'bottom');
  },
  collisionTop: function (col) {
    this.handleCollision(col, 'top');
  },
  handleCollision: function (col, dir) {
    //skip if the the object being hit is the owner
    if(col.obj.isA('Player') 
      && (this.p.playerId == col.obj.p.playerId))
    {
      return;
    }
    this.deployPortal({
      x: this.p.x,
      y: this.p.y
    });
    this.destroy();
    if (col.obj.isA('Player')) {
      //var knockBack = 200 * (dir === 'left' ? 1 : -1 );
      //col.obj.p.vy = -100;
      col.obj.p.hp -= this.p.damage;
    }
  },

  deployPortal: function (data)   {

    console.log("deploy potral! x: " + data.x + " y: " + data.y);
    var portal = new Q.Portal({ 
                      x: data.x,
                      y: data.y});
      this.stage.insert(portal);

    if(this.p.playerId == GameState.player.p.playerId)
    {
      console.log("emit deploy portal");
      var shootingData = {
        playerId: this.p.playerId,
        x: data.x,
        y: data.y
      }
      GameState.player.p.socket.emit('player.deployPortal', shootingData); 
    }
  },

  step: function (dt) {
    this.p.angle += dt * 1 * 360;
    this.p.lifetime -= dt;

    if(this.p.lifetime <= 0)
    {
      this.destroy();
    }

    //check if the portal bullet has passed by the target position
    var displacementLeftX = this.p.targetX - this.p.x;
    var displacementLeftY = this.p.targetY - this.p.y;
    var createPortal = false;
    if(displacementLeftX < 2.0 && displacementLeftX > -2.0
      && displacementLeftY < 2.0 && displacementLeftY > -2.0)
    {
      console.log("displacement within threshold");
      createPortal = true;
    }
    else if(displacementLeftX != 0
      && this.p.vx != 0 
      && ((displacementLeftX / this.p.vx) < 0))
    {
      //this means it has overshot
      console.log("overshoot on x");
      createPortal = true;
    }
    else if(displacementLeftY != 0
      && this.p.vy != 0
      && ((displacementLeftY / this.p.vy) < 0))
    {
      //this means it has overshot
      console.log("overshoot on Y");
      createPortal = true;
    }

    //check if the portal should be created
    if(createPortal)
    {
      this.deployPortal({
        x: this.p.targetX,
        y: this.p.targetY
      });
      this.destroy();
    }
  }
});



Q.Sprite.extend('Portal', {
  init: function (p) {
    this._super(p, { 
      w: 0,
      h: 0,
      asset: "whirlpoolPink.png",
      scale: 0.10,
      gravity: 0.00,
      damage: 20,
      lifetime: 5
    });
        
    this.add('2d');
    this.on('bump.left', this, 'collisionLeft');
    this.on('bump.right', this, 'collisionRight');
    this.on('bump.bottom', this, 'collisionBottom');
    this.on('bump.top', this, 'collisionTop');
  },
  collisionLeft: function (col) {
    this.handleCollision(col, 'left');
  },
  collisionRight: function (col) {
    this.handleCollision(col, 'right');
  },
  collisionBottom: function (col)   {
    this.handleCollision(col, 'bottom');
  },
  collisionTop: function (col) {
    this.handleCollision(col, 'top');
  },
  handleCollision: function (col, dir) {
    //skip if the the object being hit is the owner
    return;
    if(col.obj.isA('Player') 
      && (this.p.playerId == col.obj.p.playerId))
    {
      return;
    }
    this.destroy();
    if (col.obj.isA('Player')) {
      //var knockBack = 200 * (dir === 'left' ? 1 : -1 );
      //col.obj.p.vy = -100;
      col.obj.p.hp -= this.p.damage;
    }
  },

  step: function (dt) {
    this.p.angle += dt * 1 * 360;
    this.p.lifetime -= dt;

    if(this.p.lifetime <= 0)
    {
      this.destroy();
    }
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

Q.scene("level2",function(stage) {
  Q.stageTMX("level2.tmx",stage);
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
      var myWeaponIndicator = new Q.WeaponIndicator({
        x: 110,
        y: 400,
        scale: 0.05,
        asset: "shuriken.png"});
      var newPlayer = new Q.Player({
        playerId: data.playerId,
        name: data.name,
        x: 110,
        y: 400,
        socket: socket,
        hp: 100,
        weaponIndicator: myWeaponIndicator
      });
      this.player = newPlayer;
      this.gameStage.insert(this.player);
      this.gameStage.insert(myWeaponIndicator);
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
  }
};

Q.loadTMX("level2.tmx, collectables.json, doors.json, enemies.json, fire.mp3, jump.mp3, heart.mp3, hit.mp3, coin.mp3, player.json, player.png, shuriken.png, whirlpool.png, whirlpool2.png, shurikenRed.png, whirlpoolPink.png", function() {
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
  Q.stageScene("level2");

  var app = angular.module('NuttyNinjasX', []);
  app.controller('ScoreBoardController', ScoreBoardController);
  angular.bootstrap(document, ['NuttyNinjasX']);
});

/*
Q.el.addEventListener('mousemove',function(e) {
  var x = e.offsetX || e.layerX,
      y = e.offsetY || e.layerY,
      stage = Q.stage();

  var stageX = Q.canvasToStageX(x, stage),
  stageY = Q.canvasToStageY(y, stage);

  console.log("stageX: " + stageX);
  console.log("stageY: " + stageY);
});
*/
