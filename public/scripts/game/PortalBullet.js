Q.Sprite.extend('PortalBullet', {
	init: function (p) {
		var asset = 'swirls-' + p.portalColor + '.png';
		this._super(p, { 
			w: 0,
			h: 0,
			asset: asset,
			scale: 0.05,
			gravity: 0.00,
			damage: 20,
			lifetime: 5
		});
		
		this.add('2d');
		this.on('bump.left', this, 'collisionLeft');
		this.on('bump.right', this, 'collisionRight');
		this.on('bump.bottom', this, 'collisionBottom');
		this.on('bump.top', this, 'collisionTop');
	},
	collisionLeft: function (col) {
		this.handleCollision(col, 'left');
	},
	collisionRight: function (col) {
		this.handleCollision(col, 'right');
	},
	collisionBottom: function (col)   {
		this.handleCollision(col, 'bottom');
	},
	collisionTop: function (col) {
		this.handleCollision(col, 'top');
	},
	handleCollision: function (col, dir) {
		//skip if the the object being hit is the owner
		if (col.obj.isA('Player') 
			&& (this.p.playerId == col.obj.p.playerId)) {
			return;
		}
		this.createPortal();
		this.destroy();
		if (col.obj.isA('Player')) {
			  //var knockBack = 200 * (dir === 'left' ? 1 : -1 );
			  //col.obj.p.vy = -100;
			  col.obj.p.hp -= this.p.damage;
		}
	},
	createPortal: function () {
		GameState.createPortal({
			playerId: this.p.playerId,
			targetX: this.p.targetX,
			targetY: this.p.targetY,
			portalType: this.p.portalType,
			portalColor: this.p.portalColor
		});
	},
	step: function (dt) {
		this.p.angle += dt * 1 * 360;
		this.p.lifetime -= dt;

		if (this.p.lifetime <= 0) {
			this.destroy();
		}

		//check if the portal bullet has passed by the target position
		var displacementLeftX = this.p.targetX - this.p.x;
		var displacementLeftY = this.p.targetY - this.p.y;
		var willCreatePortal = false;
		if (displacementLeftX < 2.0 && displacementLeftX > -2.0
			&& displacementLeftY < 2.0 && displacementLeftY > -2.0) {
			console.log("displacement within threshold");
		willCreatePortal = true;
	} else if (displacementLeftX != 0
		&& this.p.vx != 0 
		&& ((displacementLeftX / this.p.vx) < 0)) {
		  // this means it has overshot
		  console.log("overshoot on x");
		  willCreatePortal = true;
		} else if (displacementLeftY != 0
			&& this.p.vy != 0
			&& ((displacementLeftY / this.p.vy) < 0)) {
		  // this means it has overshot
		  console.log("overshoot on Y");
		  willCreatePortal = true;
		}

		//check if the portal should be created
		if (willCreatePortal) {
			this.createPortal();
			this.destroy();
		}
	}
});
