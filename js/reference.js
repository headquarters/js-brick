function Game(){
	var screen = document.getElementById("screen").getContext("2d");
	this.size = { x: screen.canvas.width, y: screen.canvas.height };
	this.center = { x: this.size.x / 2, y: this.size.y / 2 };


	this.bodies = createInvaders(this).concat(new Player(this));

	var self = this;

	function tick(){
		self.update();
		self.draw(screen);

		requestAnimationFrame(tick);
	}

	tick();

};

Game.prototype = { 
	update: function(){
		var self = this;

		function notCollidingWithAnything(body1){
			return self.bodies.filter(function(body2){
				return isColliding(body1, body2);
			}).length === 0;
		}
		this.bodies = this.bodies.filter(notCollidingWithAnything);

		for(var i = 0; i < this.bodies.length; i++){
			this.bodies[i].update();
		}
	},

	draw: function(screen){
		screen.clearRect(0, 0, this.size.x, this.size.y);
		for(var i = 0; i < this.bodies.length; i++){
			this.bodies[i].draw(screen);
		}
	},

	addBody: function(body){
		this.bodies.push(body);
	},

	invadersBelow: function(invader){
		return this.bodies.filter(function(b){
			return b instanceof Invader &&
				b.center.y > invader.center.y &&
				Math.abs(b.center.x - invader.center.x) < invader.size.x
		}).length > 0;
	}
};

function Player(game){
	this.game = game;
	this.size = { x: 15, y: 15};
	this.center = { x: game.center.x, y: game.size.y - 15 };

	this.keyboarder = new Keyboarder();
}

Player.prototype = {
	update: function(){
		if(this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)){
			this.center.x -= 2;
		} else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)){
			this.center.x += 2;
		} 

		if(this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)){
			var bullet = new Bullet(this.game, 
					{ x: this.center.x, y: this.center.y - this.size.x },
					{ x: 0, y: -6 });

			this.game.addBody(bullet);
		}
	}, 

	draw: function(screen){
		drawBody(screen, this);
	}
};

function Invader(game, center){
	this.game = game;
	this.size = { x: 15, y: 15};
	this.center = center;
	this.patrolX = 0;
	this.speedX = 0.3;
}

Invader.prototype = {
	update: function(){
		if(this.patrolX < 0 || this.patrolX > 40){
			this.speedX = -this.speedX;
		}

		this.center.x += this.speedX;
		this.patrolX += this.speedX;

		if(Math.random() > 0.995 && !this.game.invadersBelow(this)){
			var bullet = new Bullet(this.game, 
			{ x: this.center.x, y: this.center.y + this.size.x },
			{ x: 0, y: 2 });

			this.game.addBody(bullet);
		}
	}, 

	draw: function(screen){
		drawBody(screen, this);
	}
};

function createInvaders(game){
	var invaders = [];

	for (var i = 0; i < 24; i++){
		var x = 30 + i % 8 * 30;
		var y = 30 + i % 3 * 30;
		invaders.push(new Invader(game, { x: x, y: y }));
	}

	return invaders;
}

function Bullet(game, center, velocity){
	this.game = game;
	this.size = { x: 3, y: 3};
	this.center = center;
	this.velocity = velocity;
}

Bullet.prototype = {
	update: function(){
		this.center.x += this.velocity.x;
		this.center.y += this.velocity.y;
	}, 

	draw: function(screen){
		drawBody(screen, this);
	}
};

function Keyboarder(){
	var keyState = {};

	window.addEventListener("keydown", function(e){
		keyState[e.keyCode] = true;
	});

	window.addEventListener("keyup", function(e){
		keyState[e.keyCode] = false;
	});

	this.isDown = function(keyCode){
		return keyState[keyCode] === true;
	}

	this.KEYS = { 
		LEFT: 37,
		RIGHT: 39,
		SPACE: 32
	};
}

function isColliding(body1, body2){
	return !(
		body1 === body2 ||
			body1.center.x + body1.size.x / 2 <= body2.center.x - body2.size.x / 2 ||
			body1.center.y + body1.size.y / 2 <= body2.center.y - body2.size.y / 2 ||
			body1.center.x - body1.size.x / 2 >= body2.center.x + body2.size.x / 2 ||
			body1.center.y - body1.size.y / 2 >= body2.center.y + body2.size.y / 2 
	);
}

function drawBody(screen, body){
	screen.fillRect(body.center.x - body.size.x / 2,
					body.center.y - body.size.y / 2,
					body.size.x,
					body.size.y);
}

new Game();