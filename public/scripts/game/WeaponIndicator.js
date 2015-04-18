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

	step: function (dt) {
		var rotationRatio = 1;
		// Spawn the Weapon Indicator and attach to the belt of the ninja
		var myAsset;
		if (this.p.actor.weaponType === Constants.WeaponType.Shuriken) {
			myAsset = 'shuriken.png';
		} else if (this.p.actor.weaponType === Constants.WeaponType.Portal) {
			myAsset = 'whirlpool-' + (this.p.actor.currentPortalIsA ? 'pink' : 'blue') + '.png';
		}
		this.p.asset = myAsset;
		this.p.x = this.p.actor.x + this.p.actor.w/4; 
		this.p.y = this.p.actor.y + 17.5;

		if (this.p.weaponType === Constants.WeaponType.Shuriken) {
			rotationRatio = 4;
		}
		this.p.angle += dt * rotationRatio * 360;
	}
});
