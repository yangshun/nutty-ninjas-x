define(['Config'], function (Config) {

  var Q = Quintus({ 
    imagePath: "/images/",
    audioPath: "/audio/",
    dataPath: "/data/" 
  })
  .include('Sprites, Scenes, Input, 2D, Touch, UI')
  .setup(Config.setup)
  .controls()
  .touch();

  return Q;
});
