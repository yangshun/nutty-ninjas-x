Q.Sprite.extend('WeaponIndicator', {
	init: function (p) {
		this._super(p, { 
			w: 0,
			h: 0,
			asset: "whirlpool-pink.png",
			scale: 0.025,
			gravity: 0.00,
			damage: 20,
			z: 1,
			type: Q.SPRITE_UI,
			collisionMask: Q.SPRITE_NONE
		});
		
		this.add('2d');
	},

	updateStuff: function(data)  {
		//console.log("update stuff!");
		this.p.x = data.x;
		this.p.y = data.y;
		this.p.asset = data.asset;
	},

	step: function (dt) {
		var rotationRatio = 1;
		if (this.p.asset === "shuriken.png") {
			rotationRatio = 4;
		}
		this.p.angle += dt * rotationRatio * 360;
	}
});