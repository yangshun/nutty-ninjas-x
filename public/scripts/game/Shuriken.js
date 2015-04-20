Q.Sprite.extend('Shuriken', {
	init: function (p) {
		this._super(p, { 
			w: 0,
			h: 0,
			asset: "shuriken.png",
			scale: 0.075,
			gravity: 0.30,
			lifetime: 5,
			playerId: p.playerId,
			collisionCount: 3
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
		if (col.obj.isA('Player')) {
			col.obj.p.vy = -100;
			col.obj.p.hp = Math.max(col.obj.p.hp - this.p.damage, 0);
			col.obj.p.hp_dirty = true;	// Turn on flag to send broadcast update in next update step
			Q.audio.play('hit.mp3');
			if ('vibrate' in window.navigator) {
	      window.navigator.vibrate(200); 
	    }
			this.destroy();
		} else if (col.obj.isA('Actor')) {
			Q.audio.play('hit.mp3');
			this.destroy();
		} else if (!col.obj.isA('Portal'))  {
			this.p.collisionCount -= 1;
			Q.audio.play('metal-clash.mp3');
			if (this.p.collisionCount <= 0) {
				this.destroy();
				return;
			}
			switch (dir) {
				case 'left':
				case 'right':
					this.p.vx = -this.p.origVx;
					break;
				case 'top':
				case 'bottom':
					this.p.vy = -this.p.origVy;
					break;
				default:
					this.destroy();
			}      
		}
	},

	step: function (dt) {
		this.p.angle += dt * 4 * 360;
		this.p.lifetime -= dt;
		this.p.previousVx = this.p.vx;
		this.p.previousVy = this.p.vy;

		if (this.p.lifetime <= 0) {
			this.destroy();
		}
	}
});
