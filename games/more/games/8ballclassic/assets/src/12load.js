
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
	this.load.spritesheet('muteButton', './games/more/games/8ballclassic/assets/img/muteButton.png', 256, 256);
	this.load.spritesheet('playButton', './games/more/games/8ballclassic/assets/img/playButton.png', 256, 256);
	this.load.spritesheet('playButton', './games/more/games/8ballclassic/assets/img/playButton.png', 256, 256);
	this.load.spritesheet('quitButton', './games/more/games/8ballclassic/assets/img/quitButton.png', 256, 256);
	this.load.spritesheet('replayButton', './games/more/games/8ballclassic/assets/img/replayButton.png', 256, 256);
	this.load.spritesheet('helpButton', './games/more/games/8ballclassic/assets/img/helpButton.png', 256, 256);
	this.load.spritesheet('statsButton', './games/more/games/8ballclassic/assets/img/statsButton.png', 256, 256);
	this.load.spritesheet('settingsButton', './games/more/games/8ballclassic/assets/img/settingsButton.png', 256, 256);

	//this.load.spritesheet('creditsButton', './games/more/games/8ballclassic/assets/img/creditsButton.png', 100, 100);
	this.load.spritesheet('menuButton', './games/more/games/8ballclassic/assets/img/menuButton.png', 256, 256);
	this.load.spritesheet('solidsSpriteSheet', './games/more/games/8ballclassic/assets/img/solidsSpriteSheet.png', 48, 48, 9);
	this.load.spritesheet('ballSpriteSheet9', './games/more/games/8ballclassic/assets/img/ballSpriteSheet9.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet10', './games/more/games/8ballclassic/assets/img/ballSpriteSheet10.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet11', './games/more/games/8ballclassic/assets/img/ballSpriteSheet11.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet12', './games/more/games/8ballclassic/assets/img/ballSpriteSheet12.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet13', './games/more/games/8ballclassic/assets/img/ballSpriteSheet13.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet14', './games/more/games/8ballclassic/assets/img/ballSpriteSheet14.png', 50, 50, 41);
	this.load.spritesheet('ballSpriteSheet15', './games/more/games/8ballclassic/assets/img/ballSpriteSheet15.png', 50, 50, 41);
	this.load.spritesheet('spotSpriteSheet', './games/more/games/8ballclassic/assets/img/spotSpriteSheet.png', 38, 38, 16);
	this.load.spritesheet('bonusStarSpriteSheet', './games/more/games/8ballclassic/assets/img/bonusStar.png', 59, 67, 1.5);
	this.load.spritesheet('mouseSprite', './games/more/games/8ballclassic/assets/img/mouseSprite.png', 132, 116);

	this.load.spritesheet('humanIcon', './games/more/games/8ballclassic/assets/img/humanIcon.png', 256, 256);
	this.load.spritesheet('aiIcon', './games/more/games/8ballclassic/assets/img/aiIcon.png', 256, 256);

	this.load.spritesheet('guiSolids', './games/more/games/8ballclassic/assets/img/guiSolids.png', 102, 102);
	this.load.spritesheet('guiStripes', './games/more/games/8ballclassic/assets/img/guiStripes.png', 101, 102);
	this.load.spritesheet('turnArrow', './games/more/games/8ballclassic/assets/img/turnArrow.png', 128, 128);
	this.load.spritesheet('pVpButton', './games/more/games/8ballclassic/assets/img/pVpButton.png', 460, 195);
	this.load.spritesheet('pVAIButton', './games/more/games/8ballclassic/assets/img/pVAIButton.png', 460, 195);
	this.load.spritesheet('aiLevel', './games/more/games/8ballclassic/assets/img/aiLevel.png', 128, 128);
	this.load.spritesheet('illegalContacts', './games/more/games/8ballclassic/assets/img/illegalContacts.png', 345, 137);
	this.load.spritesheet('illegalShots', './games/more/games/8ballclassic/assets/img/illegalShots.png', 324, 324);
	this.load.spritesheet('switch', './games/more/games/8ballclassic/assets/img/switch.png', 152, 55);

	this.load.spritesheet('plusButton', './games/more/games/8ballclassic/assets/img/plusButton.png', 128, 128);
	this.load.spritesheet('minusButton', './games/more/games/8ballclassic/assets/img/minusButton.png', 128, 128);






	this.load.atlas('marker', './games/more/games/8ballclassic/assets/img/marker.png', './games/more/games/8ballclassic/assets/img/marker.json');



	game.load.bitmapFont('font1', './games/more/games/8ballclassic/assets/fonts/font1.png', './games/more/games/8ballclassic/assets/fonts/font1.fnt');
	game.load.bitmapFont('font2', './games/more/games/8ballclassic/assets/fonts/font2.png', './games/more/games/8ballclassic/assets/fonts/font2.fnt');
	game.load.bitmapFont('font3', './games/more/games/8ballclassic/assets/fonts/font3.png', './games/more/games/8ballclassic/assets/fonts/font3.fnt');
	//game.load.bitmapFont('font4', './games/more/games/8ballclassic/assets/fonts/font4.png', './games/more/games/8ballclassic/assets/fonts/font4.fnt');
	game.load.bitmapFont('font5', './games/more/games/8ballclassic/assets/fonts/font5.png', './games/more/games/8ballclassic/assets/fonts/font5.fnt');
	game.load.bitmapFont('font6', './games/more/games/8ballclassic/assets/fonts/font6.png', './games/more/games/8ballclassic/assets/fonts/font6.fnt');

	game.load.bitmapFont('font7', './games/more/games/8ballclassic/assets/fonts/Font.png', './games/more/games/8ballclassic/assets/fonts/Font.fnt');

	this.load.image('more_games', window.famobi.getBrandingButtonImage());
	//this.load.image('line', './games/more/games/8ballclassic/assets/img/line.png');
	this.load.image('pockets', './games/more/games/8ballclassic/assets/./games/more/games/8ballclassic/assets/img/pockets.png');
	this.load.image('cloth', './games/more/games/8ballclassic/assets/img/cloth.png');
	this.load.image('tableTop', './games/more/games/8ballclassic/assets/img/tableTop.png');
	this.load.image('shade', './games/more/games/8ballclassic/assets/img/shade.png');
	this.load.image('shadow', './games/more/games/8ballclassic/assets/img/shadow.png');
	this.load.image('cue_1', './games/more/games/8ballclassic/assets/img/cue_1.png');
	this.load.image('cue_2', './games/more/games/8ballclassic/assets/img/cue_2.png');
	this.load.image('cue_3', './games/more/games/8ballclassic/assets/img/cue_3.png');
	this.load.image('cue_4', './games/more/games/8ballclassic/assets/img/cue_4.png');
	this.load.image('cue_5', './games/more/games/8ballclassic/assets/img/cue_5.png');
	this.load.image('cue_6', './games/more/games/8ballclassic/assets/img/cue_6.png');
	this.load.image('cue_7', './games/more/games/8ballclassic/assets/img/cue_7.png');
	this.load.image('cue_8', './games/more/games/8ballclassic/assets/img/cue_8.png');
	this.load.image('cue_9', './games/more/games/8ballclassic/assets/img/cue_9.png');
	this.load.image('cue_10', './games/more/games/8ballclassic/assets/img/cue_10.png');
	this.load.image('cue_11', './games/more/games/8ballclassic/assets/img/cue_11.png');
	this.load.image('cue_12', './games/more/games/8ballclassic/assets/img/cue_12.png');
	this.load.image('cue_13', './games/more/games/8ballclassic/assets/img/cue_13.png');
	this.load.image('cue_14', './games/more/games/8ballclassic/assets/img/cue_14.png');
	this.load.image('cue_15', './games/more/games/8ballclassic/assets/img/cue_15.png');
	this.load.image('cue_16', './games/more/games/8ballclassic/assets/img/cue_16.png');
	this.load.image('cue_17', './games/more/games/8ballclassic/assets/img/cue_17.png');
	this.load.image('cue_18', './games/more/games/8ballclassic/assets/img/cue_18.png');
	this.load.image('cue_19', './games/more/games/8ballclassic/assets/img/cue_19.png');
	this.load.image('cue_20', './games/more/games/8ballclassic/assets/img/cue_20.png');
	this.load.image('cue_21', './games/more/games/8ballclassic/assets/img/cue_21.png');
	this.load.image('cue_22', './games/more/games/8ballclassic/assets/img/cue_22.png');
	this.load.image('cue_23', './games/more/games/8ballclassic/assets/img/cue_23.png');
	this.load.image('cue_24', './games/more/games/8ballclassic/assets/img/cue_24.png');
	this.load.image('cue_25', './games/more/games/8ballclassic/assets/img/cue_25.png');
	this.load.image('cue_26', './games/more/games/8ballclassic/assets/img/cue_26.png');
	this.load.image('cue_27', './games/more/games/8ballclassic/assets/img/cue_27.png');
	this.load.image('cueShadow', './games/more/games/8ballclassic/assets/img/cueShadow.png');
	//this.load.image('guiBar', './games/more/games/8ballclassic/assets/img/guiBar.png');
	this.load.image('bonusDisc', './games/more/games/8ballclassic/assets/img/bonusDisc.png');
	this.load.image('powerBarBase', './games/more/games/8ballclassic/assets/img/powerBarBase.png');
	this.load.image('powerBarTop', './games/more/games/8ballclassic/assets/img/powerBarTop.png');
	this.load.image('powerBarBG', './games/more/games/8ballclassic/assets/img/powerBarBG.png');


	//this.load.image('backgroundImageL', './games/more/games/8ballclassic/assets/img/bgLandscape2.png');
	//this.load.image('backgroundImageP', './games/more/games/8ballclassic/assets/img/bgPortrait2.png');
	this.load.image('bonusStar', './games/more/games/8ballclassic/assets/img/bonusStar2.png');
	//this.load.image('box', './games/more/games/8ballclassic/assets/img/box.png');
	this.load.image('panel', './games/more/games/8ballclassic/assets/img/panel.png');
	this.load.image('panel2', './games/more/games/8ballclassic/assets/img/panel2.png');
	this.load.image('panel3', './games/more/games/8ballclassic/assets/img/panel3.png');
	let externalMute = famobi.hasFeature("external_mute");
	this.load.image('panel4', externalMute ? './games/more/games/8ballclassic/assets/img/panel4e.png' : './games/more/games/8ballclassic/assets/img/panel4d.png');
	//this.load.image('phaserLogo', './games/more/games/8ballclassic/assets/img/phaserLogo.png');
	//this.load.image('andromedusLogo', './games/more/games/8ballclassic/assets/img/andromedusLogo.jpg');
	this.load.image('helpMouse', './games/more/games/8ballclassic/assets/img/helpMouse.png');
	this.load.image('helpTouch', './games/more/games/8ballclassic/assets/img/helpTouch.png');
	this.load.image('guiPanel1', './games/more/games/8ballclassic/assets/img/guiPanel1.png');
	this.load.image('guiPanel2', './games/more/games/8ballclassic/assets/img/guiPanel2.png');
	this.load.image('score', './games/more/games/8ballclassic/assets/img/score.png');
	this.load.image('highScore', './games/more/games/8ballclassic/assets/img/highscore.png');
	this.load.image('success', './games/more/games/8ballclassic/assets/img/success.png');
	this.load.image('hand', './games/more/games/8ballclassic/assets/img/hand.png');
	this.load.image('dottedLine', './games/more/games/8ballclassic/assets/img/dottedLine.png');
	this.load.image('rackBG', './games/more/games/8ballclassic/assets/img/rackBG.png');
	this.load.image('mover', './games/more/games/8ballclassic/assets/img/mover.png');
	this.load.image('8ball', './games/more/games/8ballclassic/assets/img/8ball.png');
	this.load.image('spinSetterSmall', './games/more/games/8ballclassic/assets/img/spinSetterLarge.png');
	this.load.image('cueBallSpot', './games/more/games/8ballclassic/assets/img/cueBallSpot.png');
	this.load.image('spinSetterZoom', './games/more/games/8ballclassic/assets/img/spinSetterZoom.png');
	this.load.image('cueBallSpotZoom', './games/more/games/8ballclassic/assets/img/cueBallSpotZoom.png');
	this.load.image('clockIcon', './games/more/games/8ballclassic/assets/img/clockIcon.png');
	this.load.image('aiWin', './games/more/games/8ballclassic/assets/img/aiWin.png');
	this.load.image('playerWin', './games/more/games/8ballclassic/assets/img/playerWin.png');
	this.load.image('rosette', './games/more/games/8ballclassic/assets/img/rosette.png');
	this.load.image('illegalBreak', './games/more/games/8ballclassic/assets/img/illegalBreak.png');
	this.load.image('foulDisplay', './games/more/games/8ballclassic/assets/img/foulDisplay.png');
	this.load.image('foulHighlight', './games/more/games/8ballclassic/assets/img/foulHighlight.png');
	this.load.image('cross', './games/more/games/8ballclassic/assets/img/cross.png');
	this.load.image('tick', './games/more/games/8ballclassic/assets/img/tick.png');
	this.load.image('gameController', './games/more/games/8ballclassic/assets/img/gameController.png');
	this.load.image('famobi', './games/more/games/8ballclassic/assets/img/famobi.png');


	this.load.audio('ballHit', ['./games/more/games/8ballclassic/assets/audio/ballHit2.wav', './games/more/games/8ballclassic/assets/audio/ballHit2.mp3']);
	this.load.audio('cushionHit', ['./games/more/games/8ballclassic/assets/audio/cushionHit.wav', './games/more/games/8ballclassic/assets/audio/cushionHit.mp3']);
	this.load.audio('pocketHit', ['./games/more/games/8ballclassic/assets/audio/pocketHit.wav', './games/more/games/8ballclassic/assets/audio/pocketHit.mp3']);
	this.load.audio('cueHit', ['./games/more/games/8ballclassic/assets/audio/cueHit.wav', './games/more/games/8ballclassic/assets/audio/cueHit.mp3']);
	this.load.audio('shimmer', ['./games/more/games/8ballclassic/assets/audio/shimmer.wav', './games/more/games/8ballclassic/assets/audio/shimmer.mp3']);
	this.load.audio('ding', ['./games/more/games/8ballclassic/assets/audio/ding.wav', './games/more/games/8ballclassic/assets/audio/ding.mp3']);
	this.load.audio('cheer', ['./games/more/games/8ballclassic/assets/audio/cheer.wav', './games/more/games/8ballclassic/assets/audio/cheer.mp3']);

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





