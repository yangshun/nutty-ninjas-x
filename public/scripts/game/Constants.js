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
      JumpSpeed: -500,
      BulletSpeed: 1200,
      BulletDamage: 20
    },
    blue: {
      Speed: 800,
      Hp: 200,
      JumpSpeed: -500,
      BulletSpeed: 800,
      BulletDamage: 30
    },
    green: {
      Speed: 400,
      Hp: 200,
      JumpSpeed: -500,
      BulletSpeed: 600,
      BulletDamage: 40
    },
    yellow: {
      Speed: 400,
      Hp: 100,
      JumpSpeed: -750,
      BulletSpeed: 800,
      BulletDamage: 30
    }
  },
  Ammo: {
    Max: 5,
    RegenRate: 2  // Regen 1 ammo per x seconds
  }
}
