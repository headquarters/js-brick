var CANVASWIDTH = 800,
	CANVASHEIGHT = 600,
	BRICKWIDTH = 40,
	BRICKHEIGHT = 20,
	PADDLEWIDTH = 80,
	PADDLEHEIGHT = 10;
	
var backgroundColors = ['#E54661', '#FFA644', '#998A2F', '#2C594F', '#002D40'],
	colors = ['#61571E', '#A86E2D', '#19332D', '#872939', '#003045'],
	bricks = {},
	x = 0,
	y = 0,
	row = 1,
	column = 1,
	brick,
	rand,
	path,
	paper = Raphael(document.getElementById('container'), CANVASWIDTH, CANVASHEIGHT),
	ball = paper.circle(CANVASWIDTH / 2, CANVASHEIGHT - 100, 12);

	ball.attr({fill: 'red', stroke: '#aaa', "fill-opacity": 1, "stroke-width": 1});

var paddle = paper.rect((CANVASWIDTH/2 - PADDLEWIDTH), (CANVASHEIGHT - (PADDLEHEIGHT * 3)), 100, 20);
paddle.attr({ fill: "#CCCCCC" });

//build the brick layers
for(var i = 1; i <= 60; i++){
	rand = Math.floor(Math.random() * backgroundColors.length);
		
	brick = paper.rect(x, y, BRICKWIDTH, BRICKHEIGHT);
	brick.attr({fill: backgroundColors[rand], stroke: colors[rand], "fill-opacity": 1, "stroke-width": 1});
	
	var brickID = "brickId"+i;
	brick.node.id = brickID;
	bricks[brickID] = brick;
	
	//calculate next x position	
	x = (column * BRICKWIDTH);
	column++;
	
	if(x >= CANVASWIDTH){
		//move bricks down
		y = row * BRICKHEIGHT;
		row++;
		
		//reset x for new layer
		x = 0;
		column = 1;
	}	
}

//kick off ball animation towards bricks
ball.animate({cx: 400, cy: 0}, 1500);

var angle = Raphael.angle(ball.attr("cx"), ball.attr("cy"), 400, 20);

//console.log("angle: " + angle);

ball.onAnimation(
	function(){
		//spotty "collision detection" only supported in some newer browsers
		//var elementOnTop = document.elementFromPoint(this.attr("cx"), this.attr("cy"));
		var elementsAtCurrentPoint = paper.getElementsByPoint(this.attr("cx"), this.attr("cy"));

		if(elementsAtCurrentPoint.length  === 0 || (elementsAtCurrentPoint.length === 1 && elementsAtCurrentPoint[0].node === this.node)){
			return;
		} else {
			this.stop();
			//elementsAtCurrentPoint.length != 1 || [0].node != this.node
			for(var i = 0; i < elementsAtCurrentPoint.length; i++){
				elementsAtCurrentPoint[0].animate({ "fill-opacity":0, "stroke-opacity":0, width:BRICKWIDTH*2, height:BRICKHEIGHT*2 }, 500, 
					function(){ 
						this.remove(); 
					}
				);
			}
			console.log(elementsAtCurrentPoint);
			
			//send ball back in opposite direction
			angle += 45; 

			ball.animate({cx: 400, cy: 400}, 1000);
		}
		

/*
		if(elementOnTop !== null && elementOnTop != this.node){
			this.stop();
			
			console.log(elementOnTop.id);
			
			bricks[elementOnTop.id].remove();
										
			bricks[elementOnTop.id].animate({ "fill-opacity":0, "stroke-opacity":0, width:BRICKWIDTH*2, height:BRICKHEIGHT*2 }, 500, 
				function(){ 
					this.remove(); 
				}
			);
			//send ball back in opposite direction
			angle += 45; 
					
			ball.animate({cx: 400, cy: 400}, 1000);
			
		}*/
	}
);
