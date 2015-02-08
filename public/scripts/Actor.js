define(['Q', 'Config', 'Bullet'], function (Q, Config, Bullet) {
  
  var PROJECTILE_SPAWN_OFFSET = 10;

  Q.Sprite.extend('Actor', {
    init: function (p) {
      this._super(p, {
        asset: Config.player.asset,
        jumpSpeed: Config.player.jumpSpeed,
        bulletSpeed: 1000,
        update: true
      });
      this.add('2d');
    },
    updateState: function (data) {
      this.p.x = data.x;
      this.p.y = data.y;
      this.p.direction = data.direction;
      this.p.flip = this.p.direction === 'left' ? 'x' : false;
      this.p.update = true;
    },
    shoot: function () {
      var p = this.p;
      var dx = p.direction === 'right' ? 1 : -1;
      var bullet = new Q.Bullet({ 
                      x: p.x + (dx * (p.w/2 + PROJECTILE_SPAWN_OFFSET)),
                      y: p.y,
                      vx: dx * Config.bullet.speed,
                      vy: 0
                    });
      this.stage.insert(bullet);
    }
  });

});
