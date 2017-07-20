
var FIREBALL_INTERVAL;
var FIREBALL_INTERVAL_MIN;
var FIREBALL_INTERVAL_REDUCE;


//Game setting
if(window.innerWidth <1000){
	FIREBALL_INTERVAL = 700;
	FIREBALL_INTERVAL_MIN = 200;
	FIREBALL_INTERVAL_REDUCE = 100;
} else {
	FIREBALL_INTERVAL = 400;
	FIREBALL_INTERVAL_MIN = 50;
	FIREBALL_INTERVAL_REDUCE = 50;
}

//Game state object
function Game(current, counter, fireballspeed, fireballsInterval, fireballs, playerx, playery, lives, level){
	this.current = current;
	this.counter = counter;
	this.fireballspeed = fireballspeed;
	this.fireballsInterval = fireballsInterval;
	this.fireballs = fireballs;
	this.playerx = playerx;
	this.playery = playery;
	this.lives = lives;
	this.level = level;
}
//Initial declarations
var bg = new Image();
bg.src = './images/background.png';
var fb = new Image();
fb.src = './images/fireball.png';
var p1 = new Image();
p1.src = './images/slime.png';
var mygame;
var playing=false;

// ***************MAIN GAME*****************




$(document).bind('pageshow','#home', function(ev){
	p1.onload = function(){
		var swing = document.createElement('audio');
	        swing.setAttribute('src', 'sounds/swing.mp3');

			
		var mCanvas = document.getElementById('mCanvas');
		var ctx = mCanvas.getContext('2d');
	    function setCanvas() {
	        mCanvas.width = window.innerWidth;
	        mCanvas.height = window.innerHeight;
	    }
	    var p1h = p1.height;
	    var p1w = p1.width;
		//current, counter, fireballspeed, fireballsInterval, fireballs, playerx, playery, lives
		var previousGame = localStorage.getItem('game');
		if(previousGame == null){
			var mygame = new Game(0, 0, 5, FIREBALL_INTERVAL, [], (window.innerWidth - p1w)/2, 0, 5, 1);
		} else {
			var g = JSON.parse(previousGame);
			if(g.lives != 0){
				var mygame = new Game(g.current, g.counter, g.fireballspeed, g.fireballsInterval, g. fireballs, g.playerx,g.playery, g.lives, g.level);
			} else {
				var mygame = new Game(0, 0, 5, FIREBALL_INTERVAL, [], (window.innerWidth - p1w)/2, 0, 5, 1);
			}
		}

		var xDir; //current direction, to increase speed without reset it's value to 0;
		var tapped = false; //tap = true -> set velocity Y
		var velX = 0;
		var accelX = 0.2;
		var tiltX = 0;
		var accel = 1;
		var current = mygame.current;
		var counter = mygame.counter;
		var lives = mygame.lives;
		var fireballsInterval = mygame.fireballsInterval;
		var fireballspeed = mygame.fireballspeed;
		var animateInterval;
		var addFireballInterval;
		var level = mygame.level ;



	    setCanvas();
	    
	    if(window.DeviceMotionEvent){
			window.addEventListener('deviceorientation', function(eventData){
				tiltX=eventData.gamma;
			})
		} else {
			//Does't support, wat i do now :v
		}
		//FALLING THINGS
		var fireballs = mygame.fireballs;

		var player = new Player(mygame.playerx, mygame.playery);

		function addFireball(){
			var x = Math.floor(Math.random() * 300) + (player.x - 150);
			var y = -fb.width;
			fireballs.push({"x":x,"y":y});
			counter +=1;
			if(counter-current==25){
				current = counter;
				if (fireballsInterval>FIREBALL_INTERVAL_MIN){
					fireballsInterval -=FIREBALL_INTERVAL_REDUCE;
				}
				level++;
				fireballspeed +=1;
			}
		}
	//	var addFireballInterval = setInterval(addFireball,fireballsInterval);

		function renderFireball(){
			for(var i = 0; i < fireballs.length; i++){
				ctx.drawImage(fb,fireballs[i].x,fireballs[i].y+=fireballspeed);
				if(fireballs[i].y > mCanvas.height){
					fireballs.splice(i,1);
				}
			}
		}
		//PLAYER OBJECT
		function Player(x, y){
			this.x =x;
			this.y =y;
			this.vel = 0;
			this.render = function(){
				ctx.drawImage(p1, this.x, this.y);
			}
			//update position
			this.newPos = function(){
				if(this.y + this.vel + p1h > window.innerHeight){
					this.vel = 0;
					this.y = mCanvas.height - p1h;
				} else if ( this.y < 0 ){
					this.vel = 10;
					this.y += this.vel;
				} else {
					this.vel += accel;
					this.y += this.vel;
				}
				this.x += tiltX + velX ;
				//if moving left to right, velX set to positive value -> decrease velX
				if(xDir){
					if( velX > 0){
						velX-=accelX;
					}
				} else if(!xDir) { //if moving right to left, velX set to negative value -> increase velX
					if( velX < 0){
						velX+=accelX;
					}
				}
				if(this.x > window.innerWidth - p1w){ //if moving outbound left
					this.x = window.innerWidth - p1w;
					velX = -12;
					xDir = false;
				} else if (this.x <= 0){ //if moving outbound right
					this.x = 0;
					velX = 12;
					xDir = true;
				}
			}
		}

		
		//COLLISION HERE
		function collision(){
			for(var i = 0; i < fireballs.length; i++){
				if(player.x + p1w*0.8 > fireballs[i].x && player.x < fireballs[i].x + fb.width*0.8){
					if(player.y + p1h > fireballs[i].y+fb.height*0.3 && player.y < fireballs[i].y + fb.height ){
						fireballs.splice(i,1);
						lives--;
					}
				}
			}
		}

		//ANIMATE HERE


		function animate(){
			//ctx.save();
	    	ctx.clearRect(0,0,mCanvas.width, mCanvas.height);
	    	player.render();
	    	player.newPos();
	    	ctx.drawImage(bg,0,mCanvas.height-bg.height, mCanvas.width, bg.height);
	    	renderFireball();
	    	if (tapped){
	    		player.vel = -16;
	    		tapped = false;
	    	}
	    	collision();
	    	ctx.font = "20px serif";
	    	ctx.fillStyle = 'black';
	    	ctx.fillText("SCORE: "+counter, 10, 20);
	    	ctx.fillStyle = 'purple';
	    	ctx.fillText("LEVEL: "+ level, 10, 50);
	    	ctx.fillStyle = 'red';
	    	ctx.fillText("LIVES <3: "+ lives, 10, 80);
	    	if(lives == 0){	
	    		endGame();
	    		changePlayButton();
			}
			if(player.y >= (window.innerHeight-p1h)){
				lives = 0;
			}
	    	
	    	//ctx.restore();
	    }
	   //PRE-DRAW
	    player.render();
	    ctx.drawImage(bg,0,mCanvas.height-bg.height, mCanvas.width, bg.height);
	    ctx.font = "20px serif";
    	ctx.fillStyle = 'black';
    	ctx.fillText("SCORE: "+counter, 10, 20);
		ctx.fillStyle = 'black';
		var howTo = "Control this Bird";
    	ctx.fillText(howTo, player.x+p1w/2 - ctx.measureText(howTo).width/2, player.y+p1h+20);
    	var control = " Use arrow buttons";
    	ctx.fillText(control, player.x+p1w/2 - ctx.measureText(howTo).width/2, player.y+p1h+45);
    	var cmobile = "or Tilt and tap (mobile)";
    	ctx.fillText(cmobile, player.x+p1w/2 - ctx.measureText(howTo).width/2, player.y+p1h+70);
    	ctx.fillStyle = 'purple';
    	ctx.fillText("LEVEL: "+ level, 10, 50);
    	ctx.fillStyle = 'red';
    	ctx.fillText("<3: "+ lives, 10, 80);
	    renderFireball();
	  //  var animateInterval = setInterval(animate,1000/35);
		function endGame(){
			clearInterval(animateInterval);
			clearInterval(addFireballInterval);
			ctx.font = "25px serif";
			var endMessage = "YOU ARE TOASTED";
			ctx.fillText(endMessage, (window.innerWidth-ctx.measureText(endMessage).width)/2, window.innerHeight*0.3);
			console.log(ctx.measureText(endMessage).width);
			saveGame();
		}
		function saveGame(){
			clearInterval(animateInterval);
			clearInterval(addFireballInterval);
			mygame.current = current;
			mygame.counter = counter;
			mygame.fireballspeed = fireballspeed;
			mygame.fireballsInterval = fireballsInterval;
			mygame.fireballs = fireballs;
			mygame.playerx = player.x;
			mygame.playery = player.y;
			mygame.lives = lives;
			mygame.level = level;

			var gameJSON = JSON.stringify(mygame);

			localStorage.setItem('game', gameJSON);
		}
		function changePlayButton(){
			$('#replay').attr('src', 'images/replay.png');
		}
		function playSwing(){
			if(lives != 0 && counter != 0){
				swing.play();
			}
		}
		
		$('#stop').on('click', function(){
			saveGame();
			playing = false;
		})
		$('#replay').on('click', function(){
			if($('#replay').attr('src')=='images/replay.png'){
				
			//current, counter, fireballspeed, fireballsInterval, fireballs, playerx, playery, lives
				current = 0;
				counter = 0;
				lives = 5;
				fireballspeed = 5;
				fireballsInterval = FIREBALL_INTERVAL;
				
				fireballs = [];
				player.x = (window.innerWidth - p1w)/2;
				player.y = 5;
				lives = 5;
				level = 1;
				$('#replay').attr('src', 'images/play.png');
				playing = false;
			//Re-draw after replay clicked
				ctx.clearRect(0,0,mCanvas.width, mCanvas.height);
				player.render();
			    ctx.drawImage(bg,0,mCanvas.height-bg.height, mCanvas.width, bg.height);
			    ctx.font = "20px serif";
		    	ctx.fillStyle = 'black';
		    	ctx.fillText("SCORE: "+counter, 10, 20);
		    	ctx.fillStyle = 'purple';
	    		ctx.fillText("LEVEL: "+ level, 10, 50);
		    	ctx.fillStyle = 'red';
		    	ctx.fillText("<3: "+ lives, 10, 80);
			    renderFireball();


			} else if(playing == false) {
				animateInterval = setInterval(animate,1000/40);
				addFireballInterval = setInterval(addFireball,fireballsInterval);
				playing = true;
			}
		})
		console.log(window.DeviceMotionEvent);
		if(window.DeviceMotionEvent){
			console.log('window.DeviceMotionEvent');
			$('#mCanvas').on('tap', function(){
				tapped = true;
				playSwing();
			})
		} else {
			//Same as above ==
		}

		$(document).keydown(function(keyDwn) {
    		if(keyDwn.which == 38){
    			tapped=true;
    			playSwing();
    		}
    		if(keyDwn.which == 37){
    			xDir = false;
				if (velX>0){
						velX = 0;
				}
				if (velX>=-24){
					velX -=8;
				}
    		}
    		if(keyDwn.which == 39){
    			xDir = true;
				if (velX<0){
						velX = 0;
				}
    			if (velX<=24){
					velX +=8;
				}
    		}
     	}); 
		//WINDOW TABS NAVIGATED AWWAYYYYYY
		$(window).blur(function(ev){
			playing = false;
			saveGame();
		})
		$(window).on('beforeunload',function (){
			playing = false;
			saveGame();
		})
		$('#a2').on('click',function(){
	     FB.ui({
	        method: 'feed',
	        app_id: '1755374691360566',
	        link: 'http://puncel.com/birdodge',
	        name: 'LOOK! I just got '+counter+' points in Birdodge, try the game now!',
	        caption: 'Play the cool game \\m/',
	        picture: 'http://puncel.com/birdodge/shareimage.png',
	      }, function(response){});
	   });
	}

});

$(document).bind('touchmove.heightmove', function(ev) {
	ev.preventDefault();
});