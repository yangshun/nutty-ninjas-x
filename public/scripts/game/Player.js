/*
 * Player class: extends from Actor
 * The ninja the player controlling throughout the game.
 */
Q.Actor.extend("Player", {

	/* Constructor - Initialize properties of the player */
	init: function (p) {
		this._super(p, {
			direction: "left"
		});

		var that = this;

		// This player latency from server, and max latency among all clients
		// These varible will be updated everytime server send 'player.updated'
		// Note that if there is only this player in the room, no updated will
		// be sent, hence latency is 0 (no point delaying anyway)
		this.p.latency = 0;
		this.p.maxLatency = 0;

		// Player status whether he is on ladder
		// Will be set to true by the checkLadder method
		// and manually set back to false at the end of every 'step'
		this.p.onLadder = false;

		// Ammunition properties
		this.p.ammoLeft = Constants.Ammo.Max;
		this.p.refreshAmmoCooldown = 0;
		PubSub.publish('updateAmmo', {
			ammoLeft: this.p.ammoLeft
		});

		// Standing points
		this.p.points = this.p.standingPoints;

		// Add in pre-made components to get up and running quickly
		// The `2d` component adds in default 2d collision detection
		// and kinetics (velocity, gravity)
		// The `platformerControls` makes the player controllable by the
		// default input actions (left, right to move,  up or action to jump)
		// It also checks to make sure the player is on a horizontal surface before
		// letting them jump.
		this.add('2d, platformerControls, ');
		
		// Set up callback functions
		this.on('sensor.tile', 'checkLadder');
		this.on('jump');
		this.on('jumped');
		Q.input.on('e', this, 'toggleWeapon');

		Q.el.addEventListener('touchend', this.touchEnd);
		Q.el.addEventListener('mouseup', this.touchEnd);
		Q.el.addEventListener('mousemove',function(e) {
			var x = e.offsetX || e.layerX,
			y = e.offsetY || e.layerY,
			stage = Q.stage();

			var stageX = Q.canvasToStageX(x, stage),
			stageY = Q.canvasToStageY(y, stage);
		});

		// Mobile only: Convenient way of toggling the weapon: Shake the device
  	window.addEventListener('devicemotion', function (event) {
	    var a = event.accelerationIncludingGravity;
	    if (Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z) > 30) {
	      that.toggleWeapon();
	    }
	  }, false);
	},

	/* Callback method: triggered by canvas end touchEnd/mouseUp
	 * Shoot whatever ammu the player is carrying
	 * This is actually a canvas method and not a Quintus Sprite method
	 */
	touchEnd: function (e) {
		// Check whether player still have ammu left
		var player = GameState.player;
		if (player.p.ammoLeft > 0) {
			// 
			player.p.ammoLeft -= 1;			
			PubSub.publish('updateAmmo', {
				ammoLeft: player.p.ammoLeft
			});
		} else {
			return;
		}
		
		// Shooting position
		var x = e.offsetX || e.layerX;
		var y = e.offsetY || e.layerY; 
		var stage = Q.stage();
		var stageX = Q.canvasToStageX(x, stage);
		var stageY = Q.canvasToStageY(y, stage);

		// Build the data package to be sent to the shoot function
		var shootingData = {
			playerId: player.p.playerId,
			startX: player.p.x,
			startY: player.p.y,
			targetX: stageX,
			targetY: stageY,
			weaponType: player.p.weaponType
		};

		// Send to server
		player.p.socket.emit('player.shoot', shootingData);

		// Local lag - delay shooting to hopefully
		// shoot only when the data reach server
		var delay = player.p.latency + player.p.maxLatency;
		setTimeout(function () {player.shootWithData(shootingData)}, delay);
	},

	/*
	 * Callback method: trigger when player press "change weapon" key
	 * Circle through the list of weapon
	 */
	toggleWeapon: function () {
		this.p.weaponType = (this.p.weaponType + 1) % Object.keys(Constants.WeaponType).length;
	},

	jump: function(obj) {
		// Only play sound once.
		if (!obj.p.playedJump) {
			Q.audio.play('jump.mp3');
			obj.p.playedJump = true;
		}
	},

	jumped: function(obj) {
		obj.p.playedJump = false;
	},

	/*
	 * Callback method: trigger by the engine on 'sensor.tile' event
	 * Set the player onLadder status to true
	 */
	checkLadder: function(collider) {
		if(collider.p.ladder) { 
			this.p.onLadder = true;
			this.p.ladderX = collider.p.x;
		}
	},

	/*
	 * 'step' method - trigger by engine at every frame
	 */
	step: function(dt) {
		// Initial animation state
		var animationState = 'walk_left';

		// Is on ladder
		if (this.p.onLadder) {
			// Disable gravity
			this.p.gravity = 0;

			// Allow free moving up and down without gravity
			if (Q.inputs['up']) {
				this.p.vy = -this.p.speed;
				this.p.x = this.p.ladderX;
				animationState = 'climb';
			} else if (Q.inputs['down']) {
				this.p.vy = this.p.speed;
				this.p.x = this.p.ladderX;
				animationState = 'climb';
			} else {
				// Move left/right
				this.p.vy = 0;
				if (this.p.vx != 0) {
					if (this.p.vx > 0) {
						this.p.direction = "right";
					} else {
						this.p.direction = "left";
					}
					animationState = "walk_" + this.p.direction;
				} else {
					animationState = "stand_" + this.p.direction;
				}
			}
		} else {

			// No ladder - Apply gravity
			this.p.gravity = 1;

			// Duck!
			if(Q.inputs['down']) {
				// Ignore control when duck
				this.p.ignoreControls = true;
				animationState = "duck_" + this.p.direction;
				if(this.p.landed > 0) {
					this.p.vx = this.p.vx * (1 - dt*2);
				}
				this.p.points = this.p.duckingPoints;
			} else {
				// Normal moving - set animation accordingly
				this.p.ignoreControls = false;
				this.p.points = this.p.standingPoints;

				if(this.p.vx > 0) {
					if(this.p.landed > 0) {
						animationState = 'walk_right';
					} else {
						animationState = 'jump_right';
					}
					this.p.direction = "right";
				} else if (this.p.vx < 0) {
					if(this.p.landed > 0) {
						animationState = 'walk_left';
					} else {
						animationState = 'jump_left';
					}
					this.p.direction = "left";
				} else {
					animationState = "stand_" + this.p.direction;
				}
			}
		}

		// Play the animation based on state
		this.play(animationState);

		// Warp player around
		if(this.p.y > 2500) {
			this.p.y = 20;
		}
		if(this.p.y < 10) {
			this.p.y = 20;
		}
		if(this.p.x < 360) {
			this.p.x = 370;
		}
		if(this.p.x > 4100) {
			this.p.x = 4000;
		}

		// Send update to other player at every frame
		// Creating payload
		var data = { 
			// Compulsory information - server will always send them
			playerId: this.p.playerId,
			currentPortalIsA: this.p.currentPortalIsA,

			// Priority information - server will send if within range
			x: this.p.x,
			y: this.p.y,
			
			// Optional information - server only send when visible
			vx: this.p.vx,
			vy: this.p.vy,
			landed: this.p.landed,
			onLadder: this.p.onLadder,
			ducked: animationState == "duck_" + this.p.direction,
			weaponType: this.p.weaponType,
			direction: this.p.direction,
			currentPortalIsA: this.p.currentPortalIsA,
		};

		// Addition information - append to data payload only dirty

		// data.important is to prevent server to attempt skip the package
		if (this.p.name_dirty) {
			data.name = this.p.name;
			data.important = true;
			name_dirty = false;
		}
		if (this.p.hp_dirty) {
			data.hp = this.p.hp;
			data.important = true;
			hp_dirty = false;
		}
		if (this.p.color_dirty) {
			data.color = this.p.color;
			data.important = true;
			color_dirty = false;	
		}

		// Send data to server
		this.p.socket.emit('player.update', data);
		PubSub.publish('updateSelf', data);

		// Apply ammu regenation - only when ammu is not max
		if (this.p.ammoLeft < Constants.Ammo.Max) {
			this.p.refreshAmmoCooldown -= dt;

			// Regen done! Reset the circle and increase ammu count by 1
			if (this.p.refreshAmmoCooldown <= 0) {
				this.p.refreshAmmoCooldown = Constants.Ammo.RegenRate;			
				this.p.ammoLeft += 1;
				PubSub.publish('updateAmmo', {
					ammoLeft: this.p.ammoLeft
				});
			}
		}

		// Reset the onLadder flag!
		this.p.onLadder = false;
		this.p.ladderX = undefined;

		// Check if the player is killed
		if (this.p.hp <= 0.0) {
			this.p.socket.emit('player.death', {
				x: this.p.x,
				y: this.p.y,
			});

			// Reset hp and move to a new spot
			this.p.hp = Constants.Ninjas[this.p.color].Hp;
			this.p.x = Math.floor(Math.random() * (3500)) + 500;
			this.p.y = 10;
		}
	}
});
