define(['Config'], function (Config) {

  var Q = Quintus({ 
    // imagePath: "http://cdn.yourgame.com/assets/",
    // audioPath: "http://cdn.yourgame.com/assets/",
    // dataPath: "http://cdn.yourgame.com/assets/" 
  })
  .include('Sprites, Scenes, Input, 2D, Touch, UI')
  .setup(Config.setup)
  .controls()
  .touch();

  return Q;
});
