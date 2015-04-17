var Q = window.Q = Quintus({
		audioSupported: ['mp3','wav','ogg']
	})
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
