Q.Sprite.extend('Actor', {
	init: function (p) {
		this._super(p, {
			sheet: "player",  // Setting a sprite sheet sets sprite width and height
			sprite: "player",
			scale: 0.70, 
			jumpSpeed: Config.player.jumpSpeed,
			speed: 400,
			bulletSpeed: 1000,
			type: Q.SPRITE_PLAYER,
			collisionMask: Q.SPRITE_DEFAULT | Q.SPRITE_DOOR | Q.SPRITE_COLLECTABLE,
			standingPoints: [ [ -16, 44], [ -23, 35 ], [-23,-48], [23,-48], [23, 35 ], [ 16, 44 ]],
			duckingPoints : [ [ -16, 44], [ -23, 35 ], [-23,-10], [23,-10], [23, 35 ], [ 16, 44 ]],
			animationState: 'walk_right',
			weaponType: Constants.WeaponType.Shuriken,
			portalA: null,
			portalB: null
		});

		var healthBar = new Q.HealthBar({
			x: this.p.x,
			y: this.p.y,
			actor: this.p
		});

		this.p.healthBar = healthBar;
		GameState.gameStage.insert(healthBar);

    var weaponIndicator = new Q.WeaponIndicator({
      x: this.p.x,
      y: this.p.y,
      actor: this.p,
      type: Constants.WeaponType.Shuriken
    });

		this.p.weaponIndicator = weaponIndicator;
		GameState.gameStage.insert(weaponIndicator);

		this.p.currentPortalIsA = true;
		this.add(['2d', 'animation', 'tween']);
	},

	updateState: function (data) {
		// Update trivial information, these information will always be available
		// in the data payload
		this.p.x = data.x;
		this.p.y = data.y;
		this.p.currentPortalIsA = data.currentPortalIsA;

		// Update other information if existed
		if (data.hp != undefined) { this.p.hp = data.hp; }
		if (data.name != undefined) {  this.p.name = data.name; }
		if (data.x != undefined) { this.p.x = data.x; }
		if (data.y != undefined) { this.p.y = data.y; }
		if (data.vx != undefined) { this.p.vx = data.vx; }
		if (data.vy != undefined) { this.p.vy = data.vy; }
		if (data.landed != undefined) { this.p.landed = data.landed; }
		if (data.onLadder != undefined) { this.p.onLadder = data.onLadder; }
		if (data.ducked != undefined) { this.p.ducked = data.ducked; }		
		
		// Determine other information based on information given
		this.p.direction = data.vx < 0 ? 'left' : 'right';
		if (data.ducked) {
			this.p.animationState = "duck_" + this.p.direction;
		} else if (data.onLadder && data.vy != 0) {
			this.p.animationState = "climb";
		} else if (data.vx == 0) {
			this.p.animationState = "stand_" + this.p.direction;
		} else if (data.landed) {
			this.p.animationState = 'walk_' + this.p.direction;
		} else {
			this.p.animationState = 'jump_' + this.p.direction;
		}

		this.p.weaponType = data.weaponType;

		// No gravity and velocity
		this.p.gravity = 0;
		this.p.vx = 0;
		this.p.vy = 0;
	},

	shootWithData: function (data) {
		//simulate latency
		data.latency = 500;

		//find out which x-direction the bullet is traveling towards
		var bulletXDirection = data.targetX - data.startX;
		bulletXDirection = bulletXDirection / Math.abs(bulletXDirection);
		var bulletYDirection = data.targetY - data.startY;
		bulletYDirection = bulletYDirection / Math.abs(bulletYDirection);

		//find out if the bullet is traveling towards the local player
		var travelingToLocalPlayer = false;
		if (parseInt(data.playerId) != parseInt(GameState.player.p.playerId)) {
			if ((GameState.player.p.x > data.startX ) && (bulletXDirection > 0)) {
				travelingToLocalPlayer = true;
			} else if ((GameState.player.p.x < data.startX ) && (bulletXDirection < 0)) {
				travelingToLocalPlayer = true;
			} 
		}

		// get the x and y speed for the case if there is no modification needed
		// now we must find the x-y ratio of the triangle 
		// formed by the starting point, ending point, and 
		// the x-axis, y-axis. Using this ratio, and the speed 
		// as the hypotenus, we can then figure out how much 
		// to modify the bullet speed by
		var distanceX = Math.abs(data.targetX - data.startX);
		var distanceY = Math.abs(data.targetY - data.startY);
		var diagonalDistance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
		var speedToDistanceRatio = Config.bullet.speed / diagonalDistance;
		var finalSpeedX = speedToDistanceRatio * (data.targetX - data.startX);
		var finalSpeedY = speedToDistanceRatio * (data.targetY - data.startY);

		//modify the speed if the shuriken is traveling towards 
		//the local player
		if (travelingToLocalPlayer && (data.playerId != GameState.player.p.playerId)) {
			
			// here we modify the x distance by the distance to speed ratio.
			// the logic here is that first we assume the distance from the 
			// starting xy coordinate to the target xy coordinate is covered 
			// in one unit time. But we know that is unlikely, so by using 
			// the ratio of the actual speed and the hypotenus, we can tell 
			// what is the ratio we must modify the (end-start) distance to 
			// get the respective x-speed and y-speed, then we can use this 
			// adjusted speed to find out how much to modify the bullet speed 
			// by
			var adjustedSpeedX = speedToDistanceRatio * distanceX;

			// we will only use the x-speed to find the time it would take 
			// to reach the player's x coordinate
			var timeToReach = Math.abs(GameState.player.p.x - data.startX) / adjustedSpeedX;

			// now we will adjust the expected time to reach by minusing 
			// the RTT
			var timeToReachModified = Math.max((timeToReach - (data.latency/1000)), 0.1);

			//find the modification ratio Note: modified is denominator.
			//imagine modified time is half of original, then the speed must 
			//double, so as denominator, the final value will double, but as 
			//numerator, it will half
			var modificationRatio = timeToReach/timeToReachModified;

			// now find the final speed x
			finalSpeedX = finalSpeedX * modificationRatio;

			// get the final speed for the y axis
			finalSpeedY = finalSpeedY * modificationRatio;
		}

		// generate a shuriken based on the data
		var p = this.p;
		var finalSpeed = Math.sqrt((finalSpeedX * finalSpeedX) + (finalSpeedY * finalSpeedY));
		var offsetRatio = p.w * 1.10 / finalSpeed;

		switch (data.weaponType) {
			case Constants.WeaponType.Shuriken:
				var shuriken = new Q.Shuriken({ 
					x: data.startX + finalSpeedX * offsetRatio,
					y: data.startY + finalSpeedY * offsetRatio,
					vx: finalSpeedX,
					vy: finalSpeedY,
					origVx: finalSpeedX,
					origVy: finalSpeedY,
					playerId: data.playerId
				});

				this.stage.insert(shuriken);
				break;
			case Constants.WeaponType.Portal:
				var portalBullet = new Q.PortalBullet({ 
					x: data.startX + finalSpeedX * offsetRatio * 1.3,
					y: data.startY + finalSpeedY * offsetRatio * 1.3,
					vx: finalSpeedX,
					vy: finalSpeedY,
					playerId: data.playerId,
					targetX: data.targetX,
					targetY: data.targetY,
					portalType: (this.p.currentPortalIsA ? 'pink' : 'blue')
				});

				this.p.currentPortalIsA = !this.p.currentPortalIsA;
				this.stage.insert(portalBullet);
				break;
		}

		// Play random shooting sound
		if (Math.random() > 0.5) {
			Q.audio.play('shooting-sound-1.mp3');
		} else {
			Q.audio.play('shooting-sound-2.mp3');
		}
	},

	step: function (dt) {
		this.play(this.p.animationState);
	},

	destroy: function () {
		// Destroy UI elements attached to actor
		this.p.healthBar.destroy();
		this.p.weaponIndicator.destroy();
	}
});
