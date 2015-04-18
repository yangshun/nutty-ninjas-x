Q.Actor.extend("Player",{
	init: function (p) {
		this._super(p, {
			direction: "left"
		});

		this.p.points = this.p.standingPoints;

		this.add('2d, platformerControls, ');
		
		this.on("sensor.tile","checkLadder");
		this.on('jump');
		this.on('jumped');
		this.add('platformerControls');

		Q.input.on('e', this, 'toggleWeapon');

		Q.el.addEventListener('mousemove',function(e) {
			var x = e.offsetX || e.layerX,
			y = e.offsetY || e.layerY,
			stage = Q.stage();

			var stageX = Q.canvasToStageX(x, stage),
			stageY = Q.canvasToStageY(y, stage);
		});

		var self = this;

		//this.touchstart = fucntion(e) {self.touchstart(e);};

		Q.el.addEventListener('touchend', this.touchEnd);
		Q.el.addEventListener('mouseup', this.touchEnd);
	},

	touchEnd: function(e)   {
		var x = e.offsetX || e.layerX,
		y = e.offsetY || e.layerY,
		stage = Q.stage();

		var stageX = Q.canvasToStageX(x, stage),
		stageY = Q.canvasToStageY(y, stage);

		// build the data package to be sent to the shoot function
		var shootingData = {
			playerId: GameState.player.p.playerId,
			startX: GameState.player.p.x,
			startY: GameState.player.p.y,
			targetX: stageX,
			targetY: stageY,
			weaponType: GameState.player.p.weaponType
		};

		GameState.player.p.socket.emit('player.shoot', shootingData);
		GameState.player.shootWithData(shootingData);
	},

	toggleWeapon: function () {
		this.p.weaponType = (this.p.weaponType + 1) % Object.keys(Constants.WeaponType).length;
	},

	shootWithData: function(data)   {
		this._super(data);
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

	checkLadder: function(collider) {
		if(collider.p.ladder) { 
			this.p.onLadder = true;
			this.p.ladderX = collider.p.x;
		}
	},

	resetLevel: function() {
		Q.stageScene("level3");
		this.p.strength = 100;
		this.animate({opacity: 1});
		Q.stageScene('hud', 3, this.p);
	},

	enemyHit: function(data) {
		var col = data.col;
		var enemy = data.enemy;
		this.p.vy = -150;
		if (col.normalX == 1) {
			// Hit from left.
			this.p.x -=15;
			this.p.y -=15;
		} else {
			// Hit from right;
			this.p.x +=15;
			this.p.y -=15;
		}
		this.p.immune = true;
		this.p.immuneTimer = 0;
		this.p.immuneOpacity = 1;
		this.p.strength -= 25;
		Q.stageScene('hud', 3, this.p);
		if (this.p.strength == 0) {
			this.resetLevel();
		}
	},
	step: function(dt) {
		// Initial animation state
		var animationState = 'walk_left';

		// Is on ladder
		if (this.p.onLadder) {
			// Disable gravity
			this.p.gravity = 0;

			if (Q.inputs['up']) {
				this.p.vy = -this.p.speed;
				this.p.x = this.p.ladderX;
				animationState = 'climb';
			} else if (Q.inputs['down']) {
				this.p.vy = this.p.speed;
				this.p.x = this.p.ladderX;
				animationState = 'climb';
			} else {
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
			// No ladder?

			// Apply gravity
			this.p.gravity = 1;

			if(Q.inputs['down']) {
				this.p.ignoreControls = true;
				animationState = "duck_" + this.p.direction;
				if(this.p.landed > 0) {
					this.p.vx = this.p.vx * (1 - dt*2);
				}
				this.p.points = this.p.duckingPoints;
			} else {
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

		this.play(animationState);

		// Warp player around
		if(this.p.y > 2000) {
			this.p.y = 10;
		}
		if(this.p.x < 0) {
			this.p.x = 10;
		}
		if(this.p.x > 7000) {
			this.p.x = 6900;
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
			// direction: this.p.direction,
			name: this.p.name,
			hp: this.p.hp,
			// animationState: animationState,
			currentPortalIsA: this.p.currentPortalIsA,
			color: this.p.color
			// Situational information
			/*name: this.p.name_dirty ? this.p.name : undefined,
			hp: this.p.hp_dirty ? this.p.hp : undefined,*/
		};

		if (this.p.name_dirty) { data.name = this.p.name; }
		if (this.p.hp_dirty) { data.hp = this.p.hp; }

		this.p.socket.emit('player.update', data);
		PubSub.publish('updateSelf', data);

		// Reset the onLadder flag!
		this.p.onLadder = false;
		this.p.ladderX = undefined;
	}
});
