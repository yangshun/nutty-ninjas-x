Q.Sprite.extend('NameIndicator', {
  init: function (p) {
    this._super(p, { 
      w: 0,
      h: 0,
      gravity: 0.00,
      z: 5,
      type: Q.SPRITE_UI,
      collisionMask: Q.SPRITE_NONE
    });
  },

  step: function (dt) {
    this.p.x = this.p.actor.x - this.p.actor.w/2;
    this.p.y = this.p.actor.y + 55;
  },

  draw: function (ctx) {
    var name = this.p.actor.name;
    ctx.font = '16px "Carter One"';
    ctx.textAlign = 'center';
    ctx.lineWidth = 1;

    ctx.fillStyle = '#fff';
    ctx.fillText(name, this.p.actor.w/2, 0);
    
    ctx.fillStyle = '#000';
    ctx.strokeText(name, this.p.actor.w/2, 0);
  }
});
