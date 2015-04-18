Q.Sprite.extend('HealthIndicator', {
  init: function (p) {
    this._super(p, { 
      w: 50,
      h: 10,
      z: 1,
      type: Q.SPRITE_UI,
      collisionMask: Q.SPRITE_NONE
    });
  },

  step: function (dt) {
    this.p.x = this.p.actor.x;
    this.p.y = this.p.actor.y - 50;
  },

  draw: function (ctx) {

    ctx.fillStyle = 'black';
    ctx.fillRect(-this.p.cx, 0, this.p.w, this.p.h);

    ctx.fillStyle = 'red';
    var barWidth = parseInt(this.p.actor.hp / 200 * this.p.w);
    ctx.fillRect(-this.p.cx, 0, barWidth, this.p.h);
  }
});
