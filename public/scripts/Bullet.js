define(['Q'], function (Q) {
  
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

});
