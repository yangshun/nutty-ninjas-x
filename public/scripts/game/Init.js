var Q = window.Q = Quintus({audioSupported: [ 'wav','mp3','ogg' ]})
.include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio")
		// Maximize this game to whatever the size of the browser is
		.setup({ maximize: true })
		// And turn on default input controls and touch input (for UI)
		.controls(true).touch()
		// Enable sounds.
		.enableSound();

// Load and init audio files.

Q.SPRITE_PLAYER = 1;
Q.SPRITE_COLLECTABLE = 2;
Q.SPRITE_DOOR = 8;
Q.SPRITE_UI = 32;

Q.loadTMX("level3.tmx, collectables.json, doors.json, enemies.json, fire.mp3, jump.mp3, heart.mp3, hit.mp3, coin.mp3, player.json, player.png, shuriken.png, whirlpool.png, shurikenRed.png, whirlpool-pink.png, whirlpool-blue.png", function() {
	Q.compileSheets("player.png","player.json");
	Q.compileSheets("collectables.png","collectables.json");
	Q.compileSheets("enemies.png","enemies.json");
	Q.compileSheets("doors.png","doors.json");
	Q.animations("player", {
		walk_right: { frames: [0,1,2,3,4,5,6,7,8,9,10], rate: 1/15, flip: false, loop: true },
		walk_left: { frames:  [0,1,2,3,4,5,6,7,8,9,10], rate: 1/15, flip:"x", loop: true },
		jump_right: { frames: [13], rate: 1/10, flip: false },
		jump_left: { frames:  [13], rate: 1/10, flip: "x" },
		stand_right: { frames:[14], rate: 1/10, flip: false },
		stand_left: { frames: [14], rate: 1/10, flip:"x" },
		duck_right: { frames: [15], rate: 1/10, flip: false },
		duck_left: { frames:  [15], rate: 1/10, flip: "x" },
		climb: { frames:  [16, 17], rate: 1/3, flip: false }
	});
	Q.stageScene("level3");

	var app = angular.module('NuttyNinjasX', []);
	app.controller('ScoreBoardController', ScoreBoardController);
	angular.bootstrap(document, ['NuttyNinjasX']);
});