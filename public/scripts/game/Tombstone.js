Q.Sprite.extend('Tombstone', {
	init: function (p) {
		this._super(p, { 
			w: 0,
			h: 0,
			opacity: 0.5,
			scale: 0.25,
			asset: "ghostsurprised.png", 
			gravity: 0.00,
			z: 5,
			lifetime: 0,
			type: Q.SPRITE_UI,
			collisionMask: Q.SPRITE_NONE
		});
		
		this.add('2d');
	},

	step: function (dt) {

		//count down the lifetime until it expires and destroy it

		if(this.p.lifetime <= 0.0)
		{
			this.hide();
		}
		else
		{
			this.p.lifetime = this.p.lifetime - dt;
			this.p.y = this.p.y - dt * 100;
			this.show();
		}
	}
});
