define(['Q', 'Config'], function (Q, Config) {
  
  Q.Sprite.extend('Actor', {
    init: function (p) {
      this._super(p, {
        asset: Config.player.asset,
        jumpSpeed: Config.player.jumpSpeed,
        update: true
      });
      this.add('2d');
    }
  });

});
