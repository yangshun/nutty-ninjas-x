var Constants = {
  WeaponType: {
    Shuriken: 0,
    Portal: 1,
  },
  HexColors: {
    red: '#fe1b1b',
    blue: '#1bd6fe',
    green: '#5bfe1b',
    yellow: '#fed61b'
  },
  Ninjas: {
    red: {
      Speed: 400,
      Hp: 200,
      JumpSpeed: -400,
      BulletSpeed: 500,
      BulletDamage: 40
    },
    green: {
      Speed: 300,
      Hp: 250,
      JumpSpeed: -600,
      BulletSpeed: 400,
      BulletDamage: 25
    },
    blue: {
      Speed: 350,
      Hp: 400,
      JumpSpeed: -700,
      BulletSpeed: 450,
      BulletDamage: 15
    },
    yellow: {
      Speed: 500,
      Hp: 100,
      JumpSpeed: -500,
      BulletSpeed: 600,
      BulletDamage: 30
    }
  },
  Ammo: {
    Max: 8,
    RegenRate: 0.75  // Regen 1 ammo per x seconds
  }
}
