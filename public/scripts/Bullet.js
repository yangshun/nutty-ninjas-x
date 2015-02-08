define(['Q'], function (Q) {
  
  Q.Sprite.extend('Bullet',{
    init: function (p) {
      this._super(p, { 
        w: 20,
        h: 20,
        gravity: 0
      });
          
      this.add('2d');
      this.on('bump.top', this, 'coliision');
      this.on('bump.bottom', this, 'collision');
      this.on('bump.left', this, 'collision');
      this.on('bump.right', this, 'collision');
    },
    collision: function (col) {
      this.destroy();
    },

    draw: function (ctx) {
      ctx.fillStyle = '#f00';
      ctx.fillRect(-this.p.cx, -this.p.cy, this.p.w, this.p.h);
    },

    step: function (dt) {

    }
  });

});
