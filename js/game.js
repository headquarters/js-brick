var requestAnimationId = 0;

function Game(){
	var canvas = document.getElementById("screen").getContext("2d");
	this.size = { x: canvas.canvas.width, y: canvas.canvas.height };
	this.center = { x: this.size.x / 2, y: this.size.y / 2 };
	this.bricks = createBricks(this);
	this.paddle = new Paddle(this);
	this.ball = new Ball(this, this.center, { x: 0, y: -6 });
	this.running = true;

	var self = this;

	this.keyboarder = new Keyboarder();

	function tick(){
		self.update();
		self.draw(canvas);

		if(self.running){
			requestAnimationId = requestAnimationFrame(tick);
		}
	}


	tick();
};

Game.prototype = { 
	update: function(){
		if(this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)){
			this.stop();
		}
		this.ball.update();
		this.paddle.update();
	},

	start: function(){
		this.running = true;
		requestAnimationFrame(this.tick);
	},

	stop: function(){
		//not sure why cancel doesn't work here...
		//cancelAnimationFrame(requestAnimationId);
		//requestAnimationId = 0;
		this.running = false;
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

function Brick(game, position, fillColor, index){
	this.game = game;
	this.size = { x: 40, y: 25};
	this.position = position;
	this.center = { x: this.position.x + (this.size.x / 2), y: this.position.y + (this.size.y / 2) };
	this.fillColor = fillColor;
	this.index = index;
}

Brick.prototype = {
	update: function(){}, 

	draw: function(canvas){
		if(!this.destroyed){
			canvas.fillStyle = this.fillColor;
			canvas.fillRect(this.position.x,
					this.position.y,
					this.size.x,
					this.size.y);
			//canvas.font = "12px arial";
			//canvas.textBaseline = "top";
			//canvas.fillStyle = "black";
			//canvas.fillText(this.position.x + "," + this.position.y, this.position.x + 3, this.position.y + 3);
			canvas.strokeRect(this.position.x,
					this.position.y,
					this.size.x,
					this.size.y);
		}
	}
};

function Ball(game, center, velocity){
	this.game = game;
	this.radius = 10;
	//TODO: don't just treat ball like a square for hit detection
	this.size = { x: 20, y: 20 };
	this.center = center;
	this.fillColor = "#333";
	this.velocity = velocity;
	this.destroyed = false;
}

Ball.prototype = {
	update: function(){
		var boundary = hitBoundary(this);

		if(isColliding(this, this.game.paddle)){
			console.log("Hit the paddle");
			//this.velocity.y = -this.velocity.y;
			setNewVelocity(this, "up");
		} else if(boundary !== "none"){
			console.log("Hit boundary", boundary);

			if(boundary === "top"){
				this.velocity.y = -this.velocity.y
			} else if(boundary === "right" || boundary === "left"){
				this.velocity.x = -this.velocity.x;
			} else {
				//bottom
				this.game.stop();
				console.log("Lost the game.");
			}
		} else {
			//for(var i = this.game.bricks.length - 1; i >= 0; i--){
			for(var i = 0; i < this.game.bricks.length; i++){
				if(!this.game.bricks[i].destroyed && isColliding(this, this.game.bricks[i])){
					//remove from bricks array
					this.game.bricks[i].destroyed = true;
					this.velocity.y = -this.velocity.y;
					break;
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

	for(var i = 0; i < 20; i++){
		rand = Math.floor(Math.random() * backgroundColors.length);

		//first brick is at 0, 0; later positions calculated after this line
		brick = new Brick(game, { x: x, y: y }, backgroundColors[rand], i);
		
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
	var result = !(
		body1 === body2 ||
			body1.center.x + body1.size.x / 2 <= body2.center.x - body2.size.x / 2 ||
			body1.center.y + body1.size.y / 2 <= body2.center.y - body2.size.y / 2 ||
			body1.center.x - body1.size.x / 2 >= body2.center.x + body2.size.x / 2 ||
			body1.center.y - body1.size.y / 2 >= body2.center.y + body2.size.y / 2 
	);

	return result;
}

function setNewVelocity(body, direction){
	var _x = body.velocity.x;
	var _y = body.velocity.y;

	var rand = Math.floor(Math.random() * 3);

	if(direction === "right"){
		body.velocity.x = Math.floor(Math.random() * 6);
		body.velocity.y = Math.floor(Math.random() * 4);
	} else if(direction === "left") {
		body.velocity.x = -Math.floor(Math.random() * 6);
		body.velocity.y = Math.floor(Math.random() * 4);
	} else if(direction === "down"){
		body.velocity.x = Math.floor(Math.random() * 4);
		body.velocity.y = Math.floor(Math.random() * 6);

	} else {
		//up
		body.velocity.x = Math.floor(Math.random() * 4);
		body.velocity.y = -Math.floor(Math.random() * 6);
	}
}

function hitBoundary(body){
	var boundary = "none";
	if(body.center.x + (body.size.x / 2) >= body.game.size.x){
		boundary = "right";
	} 
	if(body.center.x - (body.size.x / 2) <= 0){
		boundary = "left";
	}
	if(body.center.y + (body.size.y / 2) >= body.game.size.y){
		boundary = "bottom";
	}
	if(body.center.y - (body.size.y / 2) <= 0){
		boundary = "top";
	}

	return boundary;	
}

new Game();