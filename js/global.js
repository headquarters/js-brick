/**
 * TODO:
 * -mouse movement, keyboard control, and touch control on the paddle the paddle
 * -pause (wow, that sounds difficult)
 * -opening screen
 * -keeping score
 * -if doing touch controls, make the whole canvas responsive to the screen size
 * -lives/chances...maybe infinite lives, every time you die the ball gets slower, as you go from level to level it increases in speed
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
	
	
	module.run = function(){
		Game.Canvas.create();
		
		ball = Game.Canvas.paper.circle(Game.Canvas.width / 2, Game.Canvas.height - 45, 12);
		ball.attr({fill: 'red', stroke: '#666', "fill-opacity": 1, "stroke-width": 2});
		
		paddle = Game.Canvas.paper.rect((Game.Canvas.width/2 - 80), (Game.Canvas.height - (10 * 3)), 100, 20);
		paddle.attr({ fill: "#CCCCCC" });
		
		bricks = Game.Canvas.placeBricks();
		
		module.startBall();
	};
	
	module.startBall = function(){
		ball.animate({cx: 400, cy: 0}, ballAnimationTime);
		
		var angle = Raphael.angle(ball.attr("cx"), ball.attr("cy"), 400, 20);
		
		var flag;
		
		//crude hit detection
		ball.onAnimation(
			function(){
				//getElementsByPoint() slows the animation down a LOT
				//var elementsAtCurrentPoint = Game.Canvas.paper.getElementsByPoint(this.attr("cx"), this.attr("cy"));
				
				//cx and cy are point in center of circle...needs to be checking edge of circle
				var cx = this.attr("cx");
				var cy = this.attr("cy");
				
			
				//looping over every brick also slows the animation down a LOT,
				//but manual calculation is perceptually faster than calling isPointInside()
				for(var brick in bricks){
					flag = isCircleCenterInsideRectangle(this, bricks[brick]);
					
					if (flag) {
						//circle has hit a brick
						bricks[brick].animate({ "fill-opacity":0, "stroke-opacity":0, width:80, height:40 }, 500, 
							function(){ 
								this.remove(); 
							}
						);
						
						angle += 45;
						
						//shouldn't animation time frame depend on length of distance to cover?
						//i.e. increase timespan for animate as length increases so speed remains constant
						ball.animate({cx: 400, cy: Game.Canvas.height}, ballAnimationTime);
						//ball.stop();
					} 
				}
				
				//if ball hits paddle, return in opposite direction...
				
				//if bricks are empty, game is won...
				
				//if ball hits bottom of canvas, user loses a life...or something happens...
			}
		);
	};
	
	return module;	
})();

Game.Canvas = (function(){
	var module = {};
	
	var backgroundColors = ['#E54661', '#FFA644', '#998A2F', '#2C594F', '#002D40'];
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