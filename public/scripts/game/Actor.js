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
			weaponType: Config.bullet.typeShuriken,
			portalA: null,
			portalB: null
		});

		this.p.currentPortalIsA = true;
		this.add(['2d', 'animation', 'tween']);
	},

	updateState: function (data) {
		// Update trivial information
		this.p.targetX = data.x;
		this.p.targetY = data.y;
		this.p.direction = data.vx > 0 ? 'left' : 'right';
		
		// Determine the animation state based on information given
		if (data.ducked) {
			this.p.animationState = "duck_" + data.direction;
		} else if (data.onLadder && data.vy != 0) {
			this.p.animationState = "climb";
		} else if (data.vx != 0) {
			this.p.animationState = "stand_" + this.p.direction;
		} else if (data.landed) {
			this.p.animationState = 'walk_' + this.p.direction;
		} else {
			this.p.animationState = 'jump_' + this.p.direction;
		}
	},

	shootWithData: function (data) {
		//simulate latency
		//data.latency = 500;

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

		if (data.weaponType === Config.bullet.typeShuriken) {
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
		} else if (data.weaponType === Config.bullet.typePortal) {
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
		}
	},

	step: function (dt) {
		this.play(this.p.animationState);

		if (Math.abs(this.p.targetX - this.p.x) > 5.0 || Math.abs(this.p.targetY - this.p.y) > 5.0) {
			//slide the actor towards the target position 
			//if it is not too far away
			if (Math.abs(this.p.targetX - this.p.x) < 100.0 && Math.abs(this.p.targetY - this.p.y) < 100.0) {
				//actor is within threshold distance of target 
				//position. we will slide towards that position 
				// at high speed
				var slidingSpeed = 1000.0; //this means it will cover the threshold in 0.1 sec.
				var slidingDistance = slidingSpeed * dt;
				var displacementX = (this.p.targetX - this.p.x);
				var displacementY = (this.p.targetY - this.p.y);

				var directionX = Math.abs(displacementX) / displacementX;
				var directionY = Math.abs(displacementY) / displacementY;

				var slideX = Math.min(Math.abs(displacementX), slidingSpeed);
				var slideY = Math.min(Math.abs(displacementY), slidingSpeed);
				
				this.p.x = this.p.x + (directionX * slideX);
				this.p.y = this.p.y + (directionY * slideY);
			} else {
				//actor is too far away from the target
				//we will snap directly
				this.p.x = this.p.targetX;
				this.p.y = this.p.targetY;
			}
		}
	}
});
