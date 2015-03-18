define(['Q', 'Config', 'Actor'], function (Q, Config) {

  Q.Actor.extend('Player', {
    init: function (p) {
      this._super(p, { 
        asset: Config.player.asset, 
        jumpSpeed: Config.player.jumpSpeed
      });
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
    }
  });

  return Q;
});
