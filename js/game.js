/**
 * TODO:
 * -mouse movement, keyboard control, and touch control on the paddle the paddle
 * -pause (wow, that sounds difficult)
 * -keeping score
 * -if doing touch controls, make the whole canvas responsive to the screen size
 * -lives/chances...maybe infinite lives, every time you die the ball gets slower, as you go from level to level it increases in speed?
 * -less garish colors for bricks
 */
var Game = (function(){
	var module = {};
	var canvas;
	var ball;
	var bricks;
	var paddle;
	var ballAnimationTime = 1500;
	
	function isCircleCenterInsideRectangle(circle, rectangle) {
		return (circle.attr('cx') >= rectangle.attr('x')
				&& circle.attr('cx') < (rectangle.attr('x') + rectangle.attr('width'))
				&& circle.attr('cy') >= rectangle.attr('y')
				&& circle.attr('cy') < (rectangle.attr('y') + rectangle.attr('height')));
	}
	
	function keyboardHandler(e){
		var keycode = e.which;
		
		if (keycode == 27) {
			module.pause();
		}
	}
	
	
	module.run = function(){
		Game.Canvas.create();
		
		ball = Game.Canvas.paper.circle(Game.Canvas.width / 2, Game.Canvas.height - 45, 12);
		ball.attr({fill: '#666666', stroke: '#666', "fill-opacity": 1, "stroke-width": 2});
		
		paddle = Game.Canvas.paper.rect((Game.Canvas.width/2 - 50), (Game.Canvas.height - (10 * 3)), 100, 20);
		paddle.attr({ fill: "#7471BD" });
		
		bricks = Game.Canvas.placeBricks();
		
		$(document).keyup(keyboardHandler);
		
		$('#start').on('click', module.startGame);
		
		//module.startBall();
	};
	
	module.startGame = function(){
		$('.overlay').hide();
		
		module.startBall();		
	};
	
	module.startBall = function(){
		//TODO: how to resume ball moving after Pause? need to save its current target somewhere
		ball.animate({cx: 400, cy: 0}, ballAnimationTime);
		
		//returns angle between ball center and second point
		var angle = Raphael.angle(ball.attr("cx"), ball.attr("cy"), 400, 20);
		console.log(angle);
		var flag;
				
		//crude hit detection
		ball.onAnimation(
			function(){
				//cx and cy are point in center of circle...needs to be checking edge of circle
				var cx = this.attr("cx");
				var cy = this.attr("cy");
				
				//ball hits edge of canvas
				if (cx == 0 ||	cy == 0) {
					angle += 45;
					ball.stop().animate({cx: 400, cy: 0}, ballAnimationTime);
				}
				
				//Tried getElementsByPoint(), but it slows the animation down a LOT;
				//looping over every brick also slows the animation down a LOT,
				//but manual calculation is perceptually faster than calling isPointInside()
				//inspired by Raphael Platformer from >>>>URL<<<<<<
				for(var index = 0; index < bricks.length; index++){
					flag = isCircleCenterInsideRectangle(this, bricks[index]);
					
					if (flag) {
						//ball has hit a brick
						bricks[index].animate({ "fill-opacity":0, "stroke-opacity":0, width:80, height:40 }, 500, 
							function(){
								//remove element from array
								bricks.splice(index, 1);
								
								//remove element from canvas
								this.remove();								
							}
						);
						
						angle += 45;
						
						//shouldn't animation time frame depend on length of distance to cover?
						//i.e. increase timespan for animate as length increases so speed remains constant
						ball.stop().animate({cx: 400, cy: Game.Canvas.height}, ballAnimationTime);
						//ball.stop();
					} 
				}
				//if ball hits paddle, return in opposite direction...
				flag = isCircleCenterInsideRectangle(this, paddle);
				
				if (flag) {
					//ball has hit the paddle
					console.log("hit the paddle");
					angle += 45;
					ball.stop().animate({cx: 400, cy: 0}, ballAnimationTime);
				}
				
				//if bricks are empty, game is won...
				if (bricks.length == 0) {
					alert('You won!');
					ball.stop();
				}
				
				//if ball hits bottom of canvas, user loses a life...or something happens...
				if (cx == Game.Canvas.width || cy == Game.Canvas.height) {
					alert('You lost. :(');
					ball.stop();
				}
			}
		);
	};
	
	module.pause = function(){
		$('#start').text("Resume");
		
		//show pause screen
		$('.overlay').show();
		
		ball.stop();
	};
	
	return module;	
})();

Game.Canvas = (function(){
	var module = {};
	
	var backgroundColors = ['#82beda', '#6ee699', '#fff700', '#ffb757', '#e67f97'];
	//var colors = ['#61571E', '#A86E2D', '#19332D', '#872939', '#003045'];
	
	var brickWidth = 40;
	var brickHeight = 20;
	
	//initial brick position
	var x = 0;
	var y = 0;
	var row = 1;
	var column = 1;
	
	var rand;
	
	module.width = 800;
	module.height = 600;
	
	module.create = function(){
		module.paper = Raphael(document.getElementById('container'), module.width, module.height);		
	};
	
	module.placeBricks = function(){
		var bricks = [];
		
		for(var i = 1; i <= 60; i++){
			rand = Math.floor(Math.random() * backgroundColors.length);
		
			brick = new Game.Brick(x, y, brickWidth, brickHeight, backgroundColors[rand], '#333333'); //colors[rand]);
			
			bricks.push(brick);
			
			//calculate next x position	
			x = (column * brickWidth);
			column++;
			
			if(x >= Game.Canvas.width){
				//move bricks down
				y = row * brickHeight;
				row++;
				
				//reset x for new layer
				x = 0;
				column = 1;
			}	
		}
		
		return bricks;
	};
	
	return module;
})();

//should probably be a factory since it generates so many objects
Game.Brick = function(x, y, width, height, backgroundColor, strokeColor){
	var brick = Game.Canvas.paper.rect(x, y, width, height);
	brick.attr({fill: backgroundColor, stroke: strokeColor, "fill-opacity": 1, "stroke-width": 1}).toFront();
	
	return brick;
};

Game.run();