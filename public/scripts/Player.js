define(['Q', 'Config', 'Actor'], function (Q, Config) {

  Q.Actor.extend('Player', {
    init: function (p) {
      this._super(p, { 
        asset: Config.player.asset, 
        jumpSpeed: Config.player.jumpSpeed
      });
      this.add('2d, platformerControls');              
    },
    step: function (dt) {
      if (Q.inputs['left'] && this.p.direction == 'right') {
        this.p.flip = 'x';
      } 
      if (Q.inputs['right']  && this.p.direction == 'left') {
        this.p.flip = false;                    
      }
      this.p.socket.emit('player.update', { 
        playerId: this.p.playerId, 
        x: this.p.x, 
        y: this.p.y
      });
    }                    
  });

  return Q;
});
