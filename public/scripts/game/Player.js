Q.Actor.extend("Player",{
	init: function (p) {
		this._super(p, {
			direction: "left"
		});

		this.p.points = this.p.standingPoints;

		this.add('2d, platformerControls, ');
		
		this.on("sensor.tile","checkLadder");
		this.add('platformerControls');

		Q.input.on('fire', this, 'shoot');
		Q.input.on("down",this, "checkDoor");
		Q.input.on('e', this, 'toggleWeapon');

		Q.el.addEventListener('mousemove',function(e) {
			var x = e.offsetX || e.layerX,
			y = e.offsetY || e.layerY,
			stage = Q.stage();

			var stageX = Q.canvasToStageX(x, stage),
			stageY = Q.canvasToStageY(y, stage);

			//console.log("stageX: " + stageX);
			//console.log("stageY: " + stageY);
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
		this.p.weaponType = (this.p.weaponType + 1) % Config.bullet.typeLast;
	},

	shoot: function () {
		console.log('player.shoot is deprecated!');
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

	checkLadder: function(colObj) {
		if(colObj.p.ladder) { 
			this.p.onLadder = true;
			this.p.ladderX = colObj.p.x;
		}
	},

	checkDoor: function() {
		this.p.checkDoor = true;
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

	continueOverSensor: function() {
		this.p.vy = 0;
		if(this.p.vx != 0) {
			this.play("walk_" + this.p.direction);
		} else {
			this.play("stand_" + this.p.direction);
		}
	},

	step: function(dt) {
		var processed = false;
		if (this.p.immune) {
			// Swing the sprite opacity between 50 and 100% percent when immune.
			if ((this.p.immuneTimer % 12) == 0) {
				var opacity = (this.p.immuneOpacity == 1 ? 0 : 1);
				this.animate({"opacity":opacity}, 0);
				this.p.immuneOpacity = opacity;
			}
			this.p.immuneTimer++;
			if (this.p.immuneTimer > 144) {
				// 3 seconds expired, remove immunity.
				this.p.immune = false;
				this.animate({"opacity": 1}, 1);
			}
		}

		var animationState = 'walk_left';

		if(this.p.onLadder) {
			this.p.gravity = 0;

			if(Q.inputs['up']) {
				this.p.vy = -this.p.speed;
				this.p.x = this.p.ladderX;
				animationState = 'climb';
			} else if(Q.inputs['down']) {
				this.p.vy = this.p.speed;
				this.p.x = this.p.ladderX;
				animationState = 'climb';
			} else {
				this.continueOverSensor();
			}
			processed = true;
		} 

		if(!processed && this.p.door) {
			this.p.gravity = 1;
			if(this.p.checkDoor && this.p.landed > 0) {
				// Enter door.
				this.p.y = this.p.door.p.y;
				this.p.x = this.p.door.p.x;
				animationState = 'climb';
				this.p.toDoor = this.p.door.findLinkedDoor();
				processed = true;
			}
			else if (this.p.toDoor) {
				// Transport to matching door.
				this.p.y = this.p.toDoor.p.y;
				this.p.x = this.p.toDoor.p.x;
				this.stage.centerOn(this.p.x, this.p.y);
				this.p.toDoor = false;
				this.stage.follow(this);
				processed = true;
			}
		} 

		if(!processed) { 
			this.p.gravity = 1;

			if(Q.inputs['down'] && !this.p.door) {
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
				} else if(this.p.vx < 0) {
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

		this.p.onLadder = false;
		this.p.door = false;
		this.p.checkDoor = false;

		//if (this.p.y > 2000 || this.p.x < 0 || this.p.x > 5000) {
		//  this.p.x = 1000;
		//  this.p.y = 10;
		//}
		if(this.p.y > 2000) {
			this.p.y = 10;
		}
		if(this.p.x < 0) {
			this.p.x = 10;
		}
		if(this.p.x > 7000) {
			this.p.x = 6900;
		}

		this.play(animationState);

		var data = { 
			playerId: this.p.playerId,
			name: this.p.name,
			x: this.p.x, 
			y: this.p.y,
			direction: this.p.direction,
			landed: this.p.landed,
			hp: this.p.hp,
			animationState: animationState,
			currentPortalIsA: this.p.currentPortalIsA
		};
		this.p.socket.emit('player.update', data);
		PubSub.publish('updateSelf', data);

		// Move the ui elements
		var myAsset = "shuriken.png";
		if (this.p.weaponType == Config.bullet.typeShuriken) {
			myAsset = "shuriken.png";
		} else if (this.p.weaponType == Config.bullet.typePortal) {
			myAsset = 'whirlpool-' + (this.p.currentPortalIsA ? 'pink' : 'blue') + '.png';
		}

		this.p.weaponIndicator.updateStuff({
			x: this.p.x + this.p.w/4, 
			y: this.p.y + 17.5,
			asset: myAsset
		});

	}
});