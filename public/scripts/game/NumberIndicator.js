Q.Sprite.extend('NumberIndicator', {
  init: function (p) {
    this._super(p, { 
      w: 0,
      h: 0,
      gravity: 0.00,
      z: 5,
      type: Q.SPRITE_UI,
      collisionMask: Q.SPRITE_NONE
    });

    this.p.lifetime = 0.5;
  },

  step: function (dt) {
    // Count down the lifetime until it expires and destroy it
    if (this.p.lifetime <= 0.1) {
      this.destroy();
    } else {
      this.p.lifetime = this.p.lifetime - dt;
      this.p.y = this.p.y - dt * 100;
      if (this.p.lifetime < 0.2) {
        
      }
      this.p.opacity = this.p.lifetime / 0.5;
    }
  },

  draw: function (ctx) {
    ctx.font = '20px "Carter One"';
    ctx.textAlign = 'center';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'red';
    ctx.fillText(this.p.damage, 0, 0);
  }
});
