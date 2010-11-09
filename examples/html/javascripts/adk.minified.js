var ColorManager=function(a,b){this.hue=Math.random();this.saturation=a;this.value=b};ColorManager.prototype.getColor=function(){this.hue+=0.618033988749895;this.hue%=1;return this.convertHSVToRGB(Math.floor(this.hue*360),this.saturation,this.value)};ColorManager.prototype.reset=function(){this.hue=Math.random()};ColorManager.prototype.convertRGBToHex=function(a){var b,c;b=a[0].toString(16);c=a[1].toString(16);a=a[2].toString(16);if(b.length<2)b="0"+b;if(c.length<2)c="0"+c;if(a.length<2)a="0"+a;return"#"+b+c+a};ColorManager.prototype.convertHSVToRGB=function(a,b,c){var e,g,f,d=[];if(b===0){d[0]=c;d[1]=c;d[2]=c}e=a/60;a=Math.floor(e);g=e-a;e=c*(1-b);f=c*(1-b*g);b=c*(1-b*(1-g));if(a===0)d=[c,b,e];else if(a==1)d=[f,c,e];else if(a==2)d=[e,c,b];else if(a==3)d=[e,f,c];else if(a==4)d=[b,e,c];else if(a==5)d=[c,e,f];return[Math.floor(d[0]*255),Math.floor(d[1]*255),Math.floor(d[2]*255)]};var Config={canvasWidth:0,canvasHeight:0,lineWidth:3,frameRate:100,pixelsPerSecond:100,holeSize:10,threshold:100,colorSaturation:0.99,colorValue:0.99},Engine=function(a,b){this.intervalID=0;this.drawingContext=a;this.players=b;this.lastHit=this.onRoundOver=this.onCollision=null;this.countWins=false};Engine.prototype.start=function(){var a=this;this.playerRank=[];if(this.intervalID===0)this.intervalID=setInterval(function(){a.draw()},1E3/Config.frameRate)};Engine.prototype.stop=function(){clearInterval(this.intervalID);this.intervalID=0};Engine.prototype.draw=function(){for(var a,b,c,e=false,g=0;g<this.players.length;g++){a=this.players[g];if(!(!a.isPlaying||!a.isAlive||a.canceled)){c=Config.pixelsPerSecond*(1E3/Config.frameRate/1E3);b=Math.cos(a.angle*Math.PI/180)*c;c=Math.sin(a.angle*Math.PI/180)*c;if(a.hole===0){if(this.hitTest({x:a.x+b,y:a.y+c})){this.playerRank.unshift(a.ID);a.isAlive=false;e=true;for(var f=0,d=0;d<this.players.length;d++)if(this.players[d].isAlive){f++;this.countWins&&this.players[d].wins++}f<2&&this.stop();this.checkForCallback(a.ID);if(f<2){this.onRoundOver&&this.onRoundOver();return}}this.drawingContext.strokeStyle=a.color;this.drawingContext.fillStyle=a.color;this.drawingContext.beginPath();this.drawingContext.lineWidth=Config.lineWidth;this.drawingContext.moveTo(a.x,a.y);this.drawingContext.lineTo(a.x+b,a.y+c);this.drawingContext.stroke()}else{a.hole--;a.hole===0&&a.calculateNextHole()}a.x+=b;a.y+=c;a.distance+=Math.sqrt(Math.pow(b,2)+Math.pow(c,2))}}if(!e)this.lastHit=null};Engine.prototype.hitTest=function(a){if(this.drawingContext.getImageData(a.x,a.y,1,1).data[3]>Config.threshold)return true;return false};Engine.prototype.checkForCallback=function(a){if(this.onCollision){if(this.lastHit===null||this.lastHit!=a)this.onCollision(a);this.lastHit=a}};Engine.prototype.setCollisionCallback=function(a){this.onCollision=a};Engine.prototype.setRoundCallback=function(a){this.onRoundOver=a};var Game=function(a,b,c,e){if(e)this.useFullscreen=e;Config.width=b;Config.height=c;this.canvasElement=document.getElementById(a);if(this.useFullscreen){Config.width=window.innerWidth;Config.height=window.innerHeight}this.canvasElement.width=Config.width;this.canvasElement.height=Config.height;if(this.canvasElement.getContext)this.drawingContext=this.canvasElement.getContext("2d");else throw"No canvas support";this.playerManager=new PlayerManager;this.engine=new Engine(this.drawingContext,this.playerManager.players);this.engineOnHalt=false};Game.prototype.getDrawingContext=function(){return this.drawingContext};Game.prototype.start=function(){if(this.playerManager.numberOfPlayers()===0){this.engineOnHalt=true;this.drawFrame()}else{this.drawFrame();this.playerManager.initializePlayers();this.engine.start();this.engineOnHalt=false}};Game.prototype.restart=function(){this.engine.stop();this.drawingContext.clearRect(0,0,Config.width,Config.height);this.start()};Game.prototype.stop=function(){this.engine.stop()};Game.prototype.addPlayer=function(a){a=this.playerManager.addPlayer(a);this.engineOnHalt&&this.start();return a};Game.prototype.removePlayer=function(a){this.playerManager.removePlayer(a);game.playerManager.numberOfPlayersAlive()<1&&game.stop()};Game.prototype.handleControl=function(a,b){this.playerManager.navigatePlayer(a,b)};Game.prototype.setCollisionCallback=function(a){this.engine.setCollisionCallback(a)};Game.prototype.setRoundCallback=function(a){that=this;this.engine.setRoundCallback(function(){that.engine.playerRank.unshift(that.playerManager.getAlivePlayers()[0]);var b={winnerID:that.playerManager.getAlivePlayers()[0],rank:that.engine.playerRank};a(b)})};Game.prototype.startSession=function(){this.playerManager.resetScores();this.engine.countWins=true};Game.prototype.stopSession=function(){this.engine.countWins=false};Game.prototype.drawFrame=function(){this.drawingContext.lineWidth=10;this.drawingContext.strokeStyle="#E3D42E";this.drawingContext.strokeRect(0,0,Config.width-0,Config.height-0)};var Player=function(){this.y=this.x=200;this.speed=1;this.angle=0;this.color=this.name="";this.ID=null;this.distance=0;this.canceled=this.isAlive=this.isPlaying=false;this.wins=this.hole=0;this.calculateNextHole()};Player.prototype.navigate=function(a){a=Math.min(Math.max(a,-1),1);this.angle+=2*a;this.angle%=360;if(this.angle<0)this.angle+=360};Player.prototype.resetTimeout=function(){clearTimeout(this.holeTimeoutID)};Player.prototype.calculateNextHole=function(){var a=this;this.holeTimoutID=setTimeout(function(){a.hole=parseInt(Config.holeSize/(1E3/Config.frameRate/1E3*Config.pixelsPerSecond))},(5+Math.random()*5)*1E3)};var PlayerManager=function(){this.players=[];this.colorManager=new ColorManager(Config.colorSaturation,Config.colorValue)};PlayerManager.prototype.addPlayer=function(a){var b=new Player;b.name=a;b.color=this.getColor();return b.ID=this.playerPush(b)};PlayerManager.prototype.playerPush=function(a){for(var b=0;b<this.players.length;b++)if(this.players[b].canceled){this.players[b]=a;return b}this.players.push(a);return this.players.length-1};PlayerManager.prototype.removePlayer=function(a){this.getPlayerByID(a).canceled=true};PlayerManager.prototype.initializePlayers=function(){for(var a=0;a<this.players.length;a++){var b=this.players[a];b.x=Utilities.random(Config.width/4,3*Config.width/4);b.y=Utilities.random(Config.height/4,3*Config.height/4);b.angle=Math.random()*360;b.isPlaying=true;b.isAlive=true;b.resetTimeout()}};PlayerManager.prototype.getColor=function(){return this.colorManager.convertRGBToHex(this.colorManager.getColor())};PlayerManager.prototype.navigatePlayer=function(a,b){this.getPlayerByID(a).navigate(b)};PlayerManager.prototype.numberOfPlayersAlive=function(){for(var a=0,b=0;b<this.players.length;b++)this.players[b].isAlive&&!this.players[b].canceled&&a++;return a};PlayerManager.prototype.numberOfPlayers=function(){for(var a=0,b=0;b<this.players.length;b++)this.players[b].canceled||a++;return a};PlayerManager.prototype.resetScores=function(){for(var a=0;a<this.players.length;a++){this.players[a].wins=0;this.players[a].distane=0}};PlayerManager.prototype.getPlayerByID=function(a){return this.players[a]};PlayerManager.prototype.getPlayerName=function(a){return this.players[a].name};PlayerManager.prototype.getPlayerDistance=function(a){return this.players[a].distance};PlayerManager.prototype.getPlayerColor=function(a){return this.players[a].color};PlayerManager.prototype.getPlayerWins=function(a){return this.players[a].wins};PlayerManager.prototype.getAlivePlayers=function(){for(var a=[],b=0;b<this.players.length;b++)this.players[b].isAlive&&!this.players[b].canceled&&a.push(this.players[b].ID);return a};var Utilities={random:function(a,b){return Math.floor(Math.random()*(b-a+1))+a}};