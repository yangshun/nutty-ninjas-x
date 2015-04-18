Q.Sprite.extend('WeaponIndicator', {
	init: function (p) {
		this._super(p, { 
			w: 0,
			h: 0,
			scale: 0.125,
			gravity: 0.00,
			damage: 20,
			z: 5,
			type: Q.SPRITE_UI,
			collisionMask: Q.SPRITE_NONE
		});
		
		this.add('2d');
	},

	step: function (dt) {

		// Spawn the Weapon Indicator and attach to the belt of the ninja
		var myAsset;
		if (this.p.actor.weaponType === Constants.WeaponType.Shuriken) {
			myAsset = 'gun-juggernaut.png';
		} else if (this.p.actor.weaponType === Constants.WeaponType.Portal) {
			myAsset = 'gun-frost.png';
		}
		var time = (new Date()).getTime();
		this.p.asset = myAsset;
		this.p.x = this.p.actor.x;
		this.p.y = this.p.actor.y + 1 + 2 * Math.sin(time/100);
		this.p.flip = this.p.actor.direction === 'left' ? 'x' : false;
	}
});
