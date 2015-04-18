Q.Sprite.extend('Tombstone', {
	init: function (p) {
		this._super(p, { 
			w: 0,
			h: 0,
			opacity: 0.5,
			scale: 0.07,
			asset: 'ninja-ghost.png',
			gravity: 0.00,
			lifetime: 3,
			type: Q.SPRITE_UI,
			collisionMask: Q.SPRITE_NONE
		});
		
		this.add('2d');
	},

	step: function (dt) {
		// Count down the lifetime until it expires and destroy it
		if (this.p.lifetime <= 0.0) {
			this.hide();
		} else {
			this.p.lifetime = this.p.lifetime - dt;
			this.p.y = this.p.y - dt * 100;
			this.p.opacity = this.p.lifetime / 3 * 0.4 + 0.1;
			this.show();
		}
	}
});
