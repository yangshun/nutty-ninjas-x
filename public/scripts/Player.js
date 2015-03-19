define(['Q', 'Config', 'Actor'], function (Q, Config) {

  Q.Actor.extend('Player', {
    init: function (p) {

      this._super(p, {
        sheet: 'player',  // Setting a sprite sheet sets sprite width and height
        sprite: 'player',
        direction: 'right',
        standingPoints: [ [ -16, 44], [ -23, 35 ], [-23,-48], [23,-48], [23, 35 ], [ 16, 44 ]],
        duckingPoints : [ [ -16, 44], [ -23, 35 ], [-23,-10], [23,-10], [23, 35 ], [ 16, 44 ]],
        jumpSpeed: -400,
        speed: 300,
        strength: 100,
        score: 0,
        type: Q.SPRITE_PLAYER,
        collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_DOOR | Q.SPRITE_COLLECTABLE
      });

      this.add('2d, platformerControls, animation, tween');
      this.on("jump");
      this.on("jumped");
      
      this.add(['2d', 'platformerControls']);
      Q.input.on('fire', this, 'shoot');
      Q.input.on('left', this, function () {
        if (this.p.direction == 'right') {
          this.p.flip = 'x';
        }
      });
      Q.input.on('right', this, function () {
        if (this.p.direction == 'left') {
          this.p.flip = false;
        }
      });
    },
    shoot: function () {
      this.p.socket.emit('player.shoot', { 
        playerId: this.p.playerId,
      });
      this._super();
    },
    step: function (dt) {
      var data = { 
        playerId: this.p.playerId,
        name: this.p.name,
        x: this.p.x, 
        y: this.p.y,
        direction: this.p.direction,
        landed: this.p.landed,
        hp: this.p.hp
      };

      this.p.socket.emit('player.update', data);
      PubSub.publish('updateSelf', data);
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
    }
  });

  return Q;
});
