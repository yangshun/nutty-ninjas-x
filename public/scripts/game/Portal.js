Q.Sprite.extend('Portal', {
  init: function (p) {
    var asset = 'whirlpool-' + p.portalType + '.png';

    this._super(p, { 
      w: 0,
      h: 0,
      asset: asset,
      scale: 0.10,
      gravity: 0.00,
      damage: 20,
      lifetime: 10
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
    if (col.obj.isA('Player') || col.obj.isA('Shuriken')) {
      var actor = this.p.belongsToPlayer;
      var otherPortal = this.p.portalType === 'pink' ? actor.portalB : actor.portalA;
      if (otherPortal) {
        if (col.obj.isA('Shuriken')) {
          var delta = 0.2;
          col.obj.p.vx = col.obj.p.previousVx;
          col.obj.p.vy = col.obj.p.previousVy;
          col.obj.p.x = otherPortal.p.x + delta * col.obj.p.vx;
          col.obj.p.y = otherPortal.p.y + delta * col.obj.p.vy;
        } else {
          var offset = 100;
          switch (dir) {
            case 'left':
              col.obj.p.x = otherPortal.p.x + offset;
              col.obj.p.y = otherPortal.p.y;
              break;
            case 'right':
              col.obj.p.x = otherPortal.p.x - offset;
              col.obj.p.y = otherPortal.p.y;
              break;
            case 'top':
              col.obj.p.x = otherPortal.p.x;
              col.obj.p.y = otherPortal.p.y + offset;
              break;
            case 'bottom':
              col.obj.p.x = otherPortal.p.x + offset;
              col.obj.p.y = otherPortal.p.y - offset;
              break;
            default:
              break;
          }
        }
      } else {
        if (col.obj.isA('Shuriken')) {
          col.obj.destroy();
        }
      }
    }
  },

  step: function (dt) {
    this.p.angle += dt * 1 * 360;
    this.p.lifetime -= dt;

    if (this.p.lifetime <= 0) {
      this.destroy();
      var actor = this.p.belongsToPlayer;
      // Kill a player's portal references if it expires.
      if (this.p.portalType === 'pink') {
        actor.portalA = null;
      } else {
        actor.portalB = null;
      }
    }
  }
});