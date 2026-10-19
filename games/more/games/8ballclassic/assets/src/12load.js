
var loadState = new Object();



loadState.init = function () {

	this.loaderInfo = new Object();
	var loaderInfo = this.loaderInfo;

	loaderInfo.loaderProgress = 0;


	game.scale.setResizeCallback(this.onResize, this);
	//fenster.subscribeToOffsetUpdates(() => {
	//	this.onResize();
	//});

	loaderInfo.loaderCanvas = new Phaser.Group(game, game.stage, 'loaderCanvas');

	loaderInfo.loaderCanvas.alpha = 0;

	loaderInfo.loaderCanvas.x = game.width / 2;
	loaderInfo.loaderCanvas.y = game.height / 2;
	game.stage.addChild(loaderInfo.loaderCanvas);


	//loaderInfo.bgL = new Phaser.Sprite(game, 0, 0, 'bgL');
	//loaderInfo.loaderCanvas.addChild(loaderInfo.bgL);
	//loaderInfo.bgL.anchor = new Point(.5, .5);
	//loaderInfo.bgL.visible = false;

	//loaderInfo.bgP = new Phaser.Sprite(game, 0, 0, 'bgP');
	//loaderInfo.loaderCanvas.addChild(loaderInfo.bgP);
	//loaderInfo.bgP.anchor = new Point(.5, .5);
	//loaderInfo.bgP.visible = false;

	loaderInfo.title = new Phaser.Sprite(game, 0, 0, 'title');
	loaderInfo.loaderCanvas.addChild(loaderInfo.title);
	loaderInfo.title.anchor = new Point(.5, .5);

	loaderInfo.rack = new Phaser.Sprite(game, 0, 0, 'rack');
	loaderInfo.loaderCanvas.addChild(loaderInfo.rack);
	loaderInfo.rack.anchor = new Point(.5, .5);


	loaderInfo.loaderBase = new Phaser.Sprite(game, 0, 800, 'loaderBase');
	loaderInfo.loaderBase.anchor = new Point(.5, 0);
	loaderInfo.loaderCanvas.addChild(loaderInfo.loaderBase);
	loaderInfo.loaderFill = new Phaser.Sprite(game, 0, 800, 'loaderFill');
	loaderInfo.loaderFill.anchor = new Point(.5, 0);
	loaderInfo.loaderCanvas.addChild(loaderInfo.loaderFill);

	loaderInfo.graphics = game.add.graphics(0, 0);
	loaderInfo.graphics.beginFill(0xffffff);
	loaderInfo.loaderFill.mask = loaderInfo.graphics;

	loaderInfo.loaderHighlight = new Phaser.Sprite(game, 0, 80, 'loaderHighlight');
	loaderInfo.loaderHighlight.anchor = new Point(.5, 0);
	loaderInfo.loaderCanvas.addChild(loaderInfo.loaderHighlight);

	loaderInfo.progress = new Object();
	loaderInfo.progress.val = 0;


	this.resizeGame();
	var tween = game.add.tween(loaderInfo.loaderCanvas).to({ alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 500);


}

loadState.resizeGame = function (scale, bounds) {


	//console.log("resizing");
	var loaderInfo = this.loaderInfo;

	var clientWidth = Math.min(fenster.innerWidth, document.documentElement.clientWidth);
	var clientHeight = Math.min(fenster.innerHeight, document.documentElement.clientHeight);

	if (window.famobi.getOrientation() == "portrait") {

		//set to portrait mode
		//game.scale.setGameSize(690, 1024);
		game.scale.setGameSize(1080, 1920);
		loaderInfo.title.y = -(game.height / 2) * 0.5;

		//loaderInfo.bgL.visible = false;
		//loaderInfo.bgP.visible = true;


		//game.scale.maxHeight = clientHeight;
		//game.scale.maxWidth = clientHeight * 690 / 1024;




	} else {

		//set to landscape mode 
		//game.scale.setGameSize(1024, 690);
		game.scale.setGameSize(1920, 1080);
		loaderInfo.title.y = -(game.height / 2) * 0.6;
		//game.scale.maxHeight = clientHeight;
		//game.scale.maxWidth = clientHeight * 1024 / 690;

		//loaderInfo.bgL.visible = true;
		//loaderInfo.bgP.visible = false;



	}


	//objects which need moving but take the same values regardless of orientation (eg. relative to other items which have changed)


	var margin = String(Math.abs(clientHeight - document.getElementById("mygame").clientHeight) / 2) + "px";
	//document.getElementById("game").style.marginTop = margin;

	loaderInfo.loaderCanvas.x = game.width / 2;
	loaderInfo.loaderCanvas.y = game.height / 2;
	//loaderInfo.bgL.x = 0;
	//loaderInfo.bgL.y = 0;
	loaderInfo.loaderBase.y = 0.6 * game.height / 2;
	loaderInfo.loaderFill.y = 0.6 * game.height / 2;
	loaderInfo.loaderHighlight.y = 0.6 * game.height / 2;

	loaderInfo.rack.y = (game.height / 2) * 0.1;

	//loaderInfo.graphics.clear();
	//loaderInfo.graphics.beginFill(0xffffff);
	//loaderInfo.graphics.drawRect( - 375/2, loaderInfo.loaderBase.y, game.load.progress * 3.75, 30);

	loaderInfo.graphics.clear();
	loaderInfo.graphics.beginFill(0xffffff);
	//loaderInfo.graphics.drawRect(game.width / 2 - 375 / 2, game.height / 2, game.load.progress * 3.75, 30);
	//console.log("progress: " + loaderInfo.loaderProgress)
	loaderInfo.graphics.drawRect(game.width / 2 - 375 / 2, game.height / 2 + loaderInfo.loaderBase.y + 8, loaderInfo.loaderProgress * 3.75, 30);





}

loadState.onResize = function (scale, bounds) {

	this.resizeGame(scale, bounds);

}



loadState.preload = function () {



	//load all game assets
	this.load.spritesheet('muteButton', './games/more/games/8ballclassic/img/muteButton.png', 256, 256);
	this.load.spritesheet('playButton', './games/more/games/8ballclassic/img/playButton.png', 256, 256);
	this.load.spritesheet('playButton', './games/more/games/8ballclassic/img/playButton.png', 256, 256);
	this.load.spritesheet('quitButton', './games/more/games/8ballclassic/img/quitButton.png', 256, 256);
	this.load.spritesheet('replayButton', './games/more/games/8ballclassic/img/replayButton.png', 256, 256);
	this.load.spritesheet('helpButton', './games/more/games/8ballclassic/img/helpButton.png', 256, 256);
	this.load.spritesheet('statsButton', './games/more/games/8ballclassic/img/statsButton.png', 256, 256);
	this.load.spritesheet('settingsButton', './games/more/games/8ballclassic/img/settingsButton.png', 256, 256);

	//this.load.spritesheet('creditsButton', './games/more/games/8ballclassic/img/creditsButton.png', 100, 100);
	this.load.spritesheet('menuButton', './games/more/games/8ballclassic/img/menuButton.png', 256, 256);
	this.load.spritesheet('solidsSpriteSheet', './games/more/games/8ballclassic/img/solidsSpriteSheet.png', 48, 48, 9);
	this.load.spritesheet('ballSpriteSheet9', './games/more/games/8ballclassic/img/ballSpriteSheet9.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet10', './games/more/games/8ballclassic/img/ballSpriteSheet10.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet11', './games/more/games/8ballclassic/img/ballSpriteSheet11.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet12', './games/more/games/8ballclassic/img/ballSpriteSheet12.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet13', './games/more/games/8ballclassic/img/ballSpriteSheet13.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet14', './games/more/games/8ballclassic/img/ballSpriteSheet14.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet15', './games/more/games/8ballclassic/img/ballSpriteSheet15.png', 50, 50, 41);
	this.load.spritesheet('spotSpriteSheet', './games/more/games/8ballclassic/img/spotSpriteSheet.png', 38, 38, 16);
	this.load.spritesheet('bonusStarSpriteSheet', './games/more/games/8ballclassic/img/bonusStar.png', 59, 67, 1.5);
	this.load.spritesheet('mouseSprite', './games/more/games/8ballclassic/img/mouseSprite.png', 132, 116);

	this.load.spritesheet('humanIcon', './games/more/games/8ballclassic/img/humanIcon.png', 256, 256);
	this.load.spritesheet('aiIcon', './games/more/games/8ballclassic/img/aiIcon.png', 256, 256);

	this.load.spritesheet('guiSolids', './games/more/games/8ballclassic/img/guiSolids.png', 102, 102);
	this.load.spritesheet('guiStripes', './games/more/games/8ballclassic/img/guiStripes.png', 101, 102);
	this.load.spritesheet('turnArrow', './games/more/games/8ballclassic/img/turnArrow.png', 128, 128);
	this.load.spritesheet('pVpButton', './games/more/games/8ballclassic/img/pVpButton.png', 460, 195);
	this.load.spritesheet('pVAIButton', './games/more/games/8ballclassic/img/pVAIButton.png', 460, 195);
	this.load.spritesheet('aiLevel', './games/more/games/8ballclassic/img/aiLevel.png', 128, 128);
	this.load.spritesheet('illegalContacts', './games/more/games/8ballclassic/img/illegalContacts.png', 345, 137);
	this.load.spritesheet('illegalShots', './games/more/games/8ballclassic/img/illegalShots.png', 324, 324);
	this.load.spritesheet('switch', './games/more/games/8ballclassic/img/switch.png', 152, 55);

	this.load.spritesheet('plusButton', './games/more/games/8ballclassic/img/plusButton.png', 128, 128);
	this.load.spritesheet('minusButton', './games/more/games/8ballclassic/img/minusButton.png', 128, 128);






	this.load.atlas('marker', './games/more/games/8ballclassic/img/marker.png', './games/more/games/8ballclassic/img/marker.json');



	game.load.bitmapFont('font1', './games/more/games/8ballclassic/fonts/font1.png', './games/more/games/8ballclassic/fonts/font1.fnt');
	game.load.bitmapFont('font2', './games/more/games/8ballclassic/fonts/font2.png', './games/more/games/8ballclassic/fonts/font2.fnt');
	game.load.bitmapFont('font3', './games/more/games/8ballclassic/fonts/font3.png', './games/more/games/8ballclassic/fonts/font3.fnt');
	//game.load.bitmapFont('font4', './games/more/games/8ballclassic/fonts/font4.png', './games/more/games/8ballclassic/fonts/font4.fnt');
	game.load.bitmapFont('font5', './games/more/games/8ballclassic/fonts/font5.png', './games/more/games/8ballclassic/fonts/font5.fnt');
	game.load.bitmapFont('font6', './games/more/games/8ballclassic/fonts/font6.png', './games/more/games/8ballclassic/fonts/font6.fnt');

	game.load.bitmapFont('font7', './games/more/games/8ballclassic/fonts/Font.png', './games/more/games/8ballclassic/fonts/Font.fnt');

	this.load.image('more_games', window.famobi.getBrandingButtonImage());
	//this.load.image('line', './games/more/games/8ballclassic/img/line.png');
	this.load.image('pockets', './games/more/games/8ballclassic/./games/more/games/8ballclassic/img/pockets.png');
	this.load.image('cloth', './games/more/games/8ballclassic/img/cloth.png');
	this.load.image('tableTop', './games/more/games/8ballclassic/img/tableTop.png');
	this.load.image('shade', './games/more/games/8ballclassic/img/shade.png');
	this.load.image('shadow', './games/more/games/8ballclassic/img/shadow.png');
	this.load.image('cue_1', './games/more/games/8ballclassic/img/cue_1.png');
	this.load.image('cue_2', './games/more/games/8ballclassic/img/cue_2.png');
	this.load.image('cue_3', './games/more/games/8ballclassic/img/cue_3.png');
	this.load.image('cue_4', './games/more/games/8ballclassic/img/cue_4.png');
	this.load.image('cue_5', './games/more/games/8ballclassic/img/cue_5.png');
	this.load.image('cue_6', './games/more/games/8ballclassic/img/cue_6.png');
	this.load.image('cue_7', './games/more/games/8ballclassic/img/cue_7.png');
	this.load.image('cue_8', './games/more/games/8ballclassic/img/cue_8.png');
	this.load.image('cue_9', './games/more/games/8ballclassic/img/cue_9.png');
	this.load.image('cue_10', './games/more/games/8ballclassic/img/cue_10.png');
	this.load.image('cue_11', './games/more/games/8ballclassic/img/cue_11.png');
	this.load.image('cue_12', './games/more/games/8ballclassic/img/cue_12.png');
	this.load.image('cue_13', './games/more/games/8ballclassic/img/cue_13.png');
	this.load.image('cue_14', './games/more/games/8ballclassic/img/cue_14.png');
	this.load.image('cue_15', './games/more/games/8ballclassic/img/cue_15.png');
	this.load.image('cue_16', './games/more/games/8ballclassic/img/cue_16.png');
	this.load.image('cue_17', './games/more/games/8ballclassic/img/cue_17.png');
	this.load.image('cue_18', './games/more/games/8ballclassic/img/cue_18.png');
	this.load.image('cue_19', './games/more/games/8ballclassic/img/cue_19.png');
	this.load.image('cue_20', './games/more/games/8ballclassic/img/cue_20.png');
	this.load.image('cue_21', './games/more/games/8ballclassic/img/cue_21.png');
	this.load.image('cue_22', './games/more/games/8ballclassic/img/cue_22.png');
	this.load.image('cue_23', './games/more/games/8ballclassic/img/cue_23.png');
	this.load.image('cue_24', './games/more/games/8ballclassic/img/cue_24.png');
	this.load.image('cue_25', './games/more/games/8ballclassic/img/cue_25.png');
	this.load.image('cue_26', './games/more/games/8ballclassic/img/cue_26.png');
	this.load.image('cue_27', './games/more/games/8ballclassic/img/cue_27.png');
	this.load.image('cueShadow', './games/more/games/8ballclassic/img/cueShadow.png');
	//this.load.image('guiBar', './games/more/games/8ballclassic/img/guiBar.png');
	this.load.image('bonusDisc', './games/more/games/8ballclassic/img/bonusDisc.png');
	this.load.image('powerBarBase', './games/more/games/8ballclassic/img/powerBarBase.png');
	this.load.image('powerBarTop', './games/more/games/8ballclassic/img/powerBarTop.png');
	this.load.image('powerBarBG', './games/more/games/8ballclassic/img/powerBarBG.png');


	//this.load.image('backgroundImageL', './games/more/games/8ballclassic/img/bgLandscape2.png');
	//this.load.image('backgroundImageP', './games/more/games/8ballclassic/img/bgPortrait2.png');
	this.load.image('bonusStar', './games/more/games/8ballclassic/img/bonusStar2.png');
	//this.load.image('box', './games/more/games/8ballclassic/img/box.png');
	this.load.image('panel', './games/more/games/8ballclassic/img/panel.png');
	this.load.image('panel2', './games/more/games/8ballclassic/img/panel2.png');
	this.load.image('panel3', './games/more/games/8ballclassic/img/panel3.png');
	let externalMute = famobi.hasFeature("external_mute");
	this.load.image('panel4', externalMute ? './games/more/games/8ballclassic/img/panel4e.png' : './games/more/games/8ballclassic/img/panel4d.png');
	//this.load.image('phaserLogo', './games/more/games/8ballclassic/img/phaserLogo.png');
	//this.load.image('andromedusLogo', './games/more/games/8ballclassic/img/andromedusLogo.jpg');
	this.load.image('helpMouse', './games/more/games/8ballclassic/img/helpMouse.png');
	this.load.image('helpTouch', './games/more/games/8ballclassic/img/helpTouch.png');
	this.load.image('guiPanel1', './games/more/games/8ballclassic/img/guiPanel1.png');
	this.load.image('guiPanel2', './games/more/games/8ballclassic/img/guiPanel2.png');
	this.load.image('score', './games/more/games/8ballclassic/img/score.png');
	this.load.image('highScore', './games/more/games/8ballclassic/img/highscore.png');
	this.load.image('success', './games/more/games/8ballclassic/img/success.png');
	this.load.image('hand', './games/more/games/8ballclassic/img/hand.png');
	this.load.image('dottedLine', './games/more/games/8ballclassic/img/dottedLine.png');
	this.load.image('rackBG', './games/more/games/8ballclassic/img/rackBG.png');
	this.load.image('mover', './games/more/games/8ballclassic/img/mover.png');
	this.load.image('8ball', './games/more/games/8ballclassic/img/8ball.png');
	this.load.image('spinSetterSmall', './games/more/games/8ballclassic/img/spinSetterLarge.png');
	this.load.image('cueBallSpot', './games/more/games/8ballclassic/img/cueBallSpot.png');
	this.load.image('spinSetterZoom', './games/more/games/8ballclassic/img/spinSetterZoom.png');
	this.load.image('cueBallSpotZoom', './games/more/games/8ballclassic/img/cueBallSpotZoom.png');
	this.load.image('clockIcon', './games/more/games/8ballclassic/img/clockIcon.png');
	this.load.image('aiWin', './games/more/games/8ballclassic/img/aiWin.png');
	this.load.image('playerWin', './games/more/games/8ballclassic/img/playerWin.png');
	this.load.image('rosette', './games/more/games/8ballclassic/img/rosette.png');
	this.load.image('illegalBreak', './games/more/games/8ballclassic/img/illegalBreak.png');
	this.load.image('foulDisplay', './games/more/games/8ballclassic/img/foulDisplay.png');
	this.load.image('foulHighlight', './games/more/games/8ballclassic/img/foulHighlight.png');
	this.load.image('cross', './games/more/games/8ballclassic/img/cross.png');
	this.load.image('tick', './games/more/games/8ballclassic/img/tick.png');
	this.load.image('gameController', './games/more/games/8ballclassic/img/gameController.png');
	this.load.image('famobi', './games/more/games/8ballclassic/img/famobi.png');


	this.load.audio('ballHit', ['./games/more/games/8ballclassic/audio/ballHit2.wav', './games/more/games/8ballclassic/audio/ballHit2.mp3']);
	this.load.audio('cushionHit', ['./games/more/games/8ballclassic/audio/cushionHit.wav', './games/more/games/8ballclassic/audio/cushionHit.mp3']);
	this.load.audio('pocketHit', ['./games/more/games/8ballclassic/audio/pocketHit.wav', './games/more/games/8ballclassic/audio/pocketHit.mp3']);
	this.load.audio('cueHit', ['./games/more/games/8ballclassic/audio/cueHit.wav', './games/more/games/8ballclassic/audio/cueHit.mp3']);
	this.load.audio('shimmer', ['./games/more/games/8ballclassic/audio/shimmer.wav', './games/more/games/8ballclassic/audio/shimmer.mp3']);
	this.load.audio('ding', ['./games/more/games/8ballclassic/audio/ding.wav', './games/more/games/8ballclassic/audio/ding.mp3']);
	this.load.audio('cheer', ['./games/more/games/8ballclassic/audio/cheer.wav', './games/more/games/8ballclassic/audio/cheer.mp3']);

	game.load.onFileComplete.add(this.updateProgressBar, this);

}

loadState.updateProgressBar = function () {

	var loaderInfo = this.loaderInfo;


	//console.log("loader: " + game.load.progress);
	loaderInfo.loaderProgress = game.load.progress;


	//loaderInfo.graphics.drawRect(loaderInfo.loaderCanvas.x - 375/2, loaderInfo.loaderCanvas.y, game.load.progress * 3.75, 30);
	//loaderInfo.graphics.drawRect(loaderInfo.loaderCanvas.x + loaderInfo.loaderBase.x - (375/2), loaderInfo.loaderCanvas.y + loaderInfo.loaderBase.y + 8, loaderInfo.progress.val, 30);

	loaderInfo.graphics.clear();
	loaderInfo.graphics.beginFill(0xffffff);
	loaderInfo.graphics.drawRect(game.width / 2 - 375 / 2, game.height / 2 + loaderInfo.loaderBase.y + 8, loaderInfo.loaderProgress * 3.75, 30);


	//tween = game.add.tween(loaderInfo.progress).to({val: game.load.progress * 3.75}, 3000, Phaser.Easing.Linear.None,true);
}



loadState.render = function () {

	//var loaderInfo = this.loaderInfo;
	//loaderInfo.graphics.drawRect(loaderInfo.loaderBase.x - (375/2), loaderInfo.loaderBase.y + 8, loaderInfo.progress.val, 30);
}

loadState.create = function () {

	var loaderInfo = this.loaderInfo;

	//console.log("loaded");
	game.time.events.add(Phaser.Timer.SECOND * 2, fadeLoader, this);

	function fadeLoader() {

		//initMenu();
		var tween = game.add.tween(loaderInfo.loaderCanvas).to({ alpha: 0 }, 1000, Phaser.Easing.Linear.None, true);
		tween.onComplete.add(initMenu, this);
	}

	function initMenu() {

		//console.log("tween complete");
		initProjectInfo();
		game.state.start('mainMenu');


		function initProjectInfo() {

			//one time initiation routine after game load and before main menu
			projectInfo.levelComplete = false;
		}
	}




}



loadState.update = function () {

	//console.log("updating");




}

loadState.shutdown = function () {

	var loaderInfo = this.loaderInfo;

	//console.log("cleaning loader");
	game.stage.removeChild(loaderInfo.loaderCanvas);
	loaderInfo.loaderCanvas = null;
	loaderInfo = null;
}





