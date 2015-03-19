define(['Config'], function (Config) {

  var Q = Quintus({ 
    imagePath: '/images/',
    audioPath: '/audio/',
    dataPath: '/data/',
    audioSupported: [ 'wav','mp3','ogg' ]
  })
  .include('Sprites, Scenes, Input, 2D, Anim, Touch, UI, TMX, Audio')
  .setup(Config.setup)
  .controls()
  .touch()
  .enableSound();

  Q.SPRITE_PLAYER = 1;
  Q.SPRITE_COLLECTABLE = 2;
  Q.SPRITE_ENEMY = 4;
  Q.SPRITE_DOOR = 8;

  return Q;
});
