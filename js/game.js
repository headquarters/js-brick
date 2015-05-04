function Game(){
	var canvas = document.getElementById("screen").getContext("2d");
	this.size = { x: canvas.canvas.width, y: canvas.canvas.height };
	this.center = { x: this.size.x / 2, y: this.size.y / 2 };
	this.bricks = createBricks(this);
	this.paddle = new Paddle(this);
	this.ball = new Ball(this, this.center, { x: 0, y: -6 });

	//this.bodies = this.bricks.concat(this.paddle).concat(this.ball);

	var self = this;

	this.keyboarder = new Keyboarder();

	function tick(){
		self.update();
		self.draw(canvas);

		requestAnimationFrame(tick);
	}

	tick();
};

Game.prototype = { 
	update: function(){
		/*if(this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)){
			
		}*/
		this.ball.update();
		this.paddle.update();
	},

	draw: function(canvas){
//console.log("Drawing canvas...");
		canvas.clearRect(0, 0, this.size.x, this.size.y);
		this.bricks.map(function(brick){ brick.draw(canvas); });
		this.ball.draw(canvas);
		this.paddle.draw(canvas);		
	}
};

function Paddle(game){
	this.game = game;
	this.size = { x: 50, y: 10 };
	this.center = { x: game.center.x, y: game.size.y - 15 };
	//this.moveX = 0;
	this.speedX = 0.3;
	this.keyboarder = new Keyboarder();
}

Paddle.prototype = {
	update: function(){
		if(this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)){
			this.center.x -= 6;
		} else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)){
			this.center.x += 6;
		} 
	}, 

	draw: function(canvas){
		canvas.fillStyle = "black";
		canvas.fillRect(this.center.x - this.size.x / 2,
				this.center.y - this.size.y / 2,
				this.size.x,
				this.size.y);
	}
};

function Brick(game, position, fillColor){
	this.game = game;
	this.size = { x: 40, y: 20};
	this.position = position;
	this.center = { x: (this.position.x + this.size.x) / 2, y: (this.position.y + this.size.y) / 2};
	this.fillColor = fillColor;
}

Brick.prototype = {
	update: function(){}, 

	draw: function(canvas){
		canvas.fillStyle = this.fillColor;
		canvas.fillRect(this.position.x,
				this.position.y,
				this.size.x,
				this.size.y);
		canvas.strokeRect(this.position.x,
				this.position.y,
				this.size.x,
				this.size.y);
	}
};

function Ball(game, center, velocity){
	this.game = game;
	this.radius = 10;
	//TODO: don't just treat ball like a square for hit detection
	this.size = { x: 10, y: 10 };
	this.center = center;
	this.fillColor = "#333";
	this.velocity = velocity;
}

Ball.prototype = {
	update: function(){

		if(isColliding(this, this.game.paddle)){
			console.log("hit the paddle");
			this.velocity.y = -this.velocity.y;
		} else {
			for(var i = this.game.bricks.length - 1; i >= 0; i--){
				if(isColliding(this, this.game.bricks[i])){
					console.log("hit a brick at", i);
					//remove from bricks array
					this.game.bricks.splice(i, 1);
					this.velocity.y = -this.velocity.y;
					//break;
				}
			}
		}

		this.center.x += this.velocity.x;
		this.center.y += this.velocity.y;
	},

	draw: function(canvas){
		canvas.fillStyle = this.fillColor;
		canvas.beginPath();
		canvas.arc(this.center.x, this.center.y, this.radius, 0, (Math.PI * 2), true);
		canvas.closePath();
		canvas.fill();		
	}
}

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

function createBricks(game){
	var backgroundColors = ['#82beda', '#6ee699', '#fff700', '#ffb757', '#e67f97'];
	var rand;
	var bricks = [];
	var x = 0;
	var y = 0;
	var row = 1;
	var column = 1;

	for(var i = 1; i <= 60; i++){
		rand = Math.floor(Math.random() * backgroundColors.length);

		//first brick is at 0, 0; later positions calculated after this line
		brick = new Brick(game, { x: x, y: y }, backgroundColors[rand]);
		
		//calculate next x position	
		x = (column * 40);
		column++;
		
		if(x >= 800){
			//move bricks down
			y = row * 20;
			row++;
			
			//reset x for new layer
			x = 0;
			column = 1;
		}	
		
		bricks.push(brick);
	}

	return bricks;
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

new Game();