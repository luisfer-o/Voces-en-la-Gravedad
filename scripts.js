const LEVELS = [
  {
    map: [
      'WWWWWWWWWWWW',
      'W..K.......W',
      'W..WWWWW...W',
      'W..........W',
      'W...B......W',
      'W..WWWWWWW.W',
      'W.......E..W',
      'WWWWWWWWWWWW'
    ],
    keys: 1, batteries: 1
  },
  {
    map: [
      'WWWWWWWWWWWW',
      'W.K....B..EW',
      'W..WWWWWW..W',
      'W..........W',
      'W..WWWWWWW.W',
      'W..........W',
      'W....B.K...W',
      'WWWWWWWWWWWW'
    ],
    keys: 2, batteries: 2
  }
];

class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }
  init(data) { this.levelIndex = data.level || 0; }
  preload() {
    this.load.image('tiles', 'assets/tiles.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('ghost', 'assets/ghost.png');
    this.load.image('key', 'assets/key.png');
    this.load.image('battery', 'assets/battery.png');
    this.load.image('exit', 'assets/exit.png');
    this.load.audio('ambient', 'assets/ambient.mp3');
    this.load.audio('bg', 'assets/bg_music.mp3');
  }

  create() {
    // audio
    this.sound.add('bg', { loop: true, volume: .2 }).play();
    this.sound.add('ambient', { loop: true, volume: .1 }).play();

    // estado
    this.keysCollected = 0;
    this.batteries = LEVELS[this.levelIndex].batteries;
    this.levelData = LEVELS[this.levelIndex];

    // grupos
    this.walls = this.physics.add.staticGroup();
    this.keys = this.physics.add.group();
    this.bats = this.physics.add.group();
    this.ghosts = this.physics.add.group();

    // crear mapa a partir de array
    this.levelData.map.forEach((row,y) => {
      [...row].forEach((cell,x) => {
        const px = x*64, py = y*64;
        if (cell==='W') this.walls.create(px,py,'tiles').setFrame(0).refreshBody();
        if (cell==='K') this.keys.create(px,py,'key');
        if (cell==='B') this.bats.create(px,py,'battery');
        if (cell==='E') this.exit = this.physics.add.staticImage(px,py,'exit').setVisible(false);
      });
    });

    // jugador
    this.player = this.physics.add.sprite(100,100,'player');
    this.player.setCollideWorldBounds(true);

    // fantasma
    this.ghost = this.physics.add.sprite(600,300,'ghost');
    this.ghost.setCollideWorldBounds(true);

    // colisiones
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.ghost, this.walls);
    this.physics.add.overlap(this.player, this.keys, this.pickKey, null, this);
    this.physics.add.overlap(this.player, this.bats, this.pickBattery, null, this);
    this.physics.add.overlap(this.player, this.ghost, this.hitGhost, null, this);
    this.physics.add.overlap(this.player, this.exit, this.completeLevel, null, this);

    // máscara linterna
    const { width, height } = this.sys.game.canvas;
    this.darkness = this.add.graphics().fillRect(0,0,width,height).generateTexture('darknessTexture',width,height);
    this.darkImage = this.add.image(0,0,'darknessTexture').setOrigin(0).setDepth(10);
    this.lightMaskG = this.make.graphics({ add: false });
    this.mask = this.darkImage.createGeometryMask(this.lightMaskG);

    // texto
    this.hud = this.add.text(10,10,'Llaves: 0/'+this.levelData.keys, { color:'#fff' }).setDepth(11);
  }

  update() {
    if (this.gameOver) return;

    // movimiento básico
    const speed = 200;
    this.player.setVelocity(0);
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) this.player.setVelocityX(-speed);
    if (cursors.right.isDown) this.player.setVelocityX(speed);
    if (cursors.up.isDown) this.player.setVelocityY(-speed);
    if (cursors.down.isDown) this.player.setVelocityY(speed);

    // fantasma te persigue
    this.physics.moveToObject(this.ghost, this.player, 100);

    // actualizar máscara: círculo de radio basado en baterías
    this.lightMaskG.clear();
    const radius = 100 + this.batteries * 50;
    this.lightMaskG.fillCircle(this.player.x, this.player.y, radius);

    // flicker
    if (Phaser.Math.Between(0,100)>98) this.darkImage.alpha = .8; else this.darkImage.alpha = .95;
  }

  pickKey(p,k) {
    k.destroy();
    this.keysCollected++;
    this.hud.setText(`Llaves: ${this.keysCollected}/${this.levelData.keys}`);
    if (this.keysCollected === this.levelData.keys) this.exit.setVisible(true);
  }

  pickBattery(p,b) {
    b.destroy();
    this.batteries = Math.min(this.batteries+1,4);
  }

  hitGhost() {
    this.gameOver = true;
    this.add.text(300,250,'¡GAME OVER!',{ fontSize:'32px', color:'#f00' });
    window.AppInventor.setWebViewString("GAME_OVER");
    this.time.delayedCall(2000,()=>this.scene.restart({level:this.levelIndex}),[],this);
  }

  completeLevel() {
    if (this.keysCollected===this.levelData.keys) {
      window.AppInventor.setWebViewString("LEVEL_DONE:"+this.levelIndex);
      this.levelIndex++;
      if (this.levelIndex<LEVELS.length) {
        this.scene.restart({level:this.levelIndex});
      } else {
        this.add.text(250,250,'¡HAS ESCAPADO!',{ fontSize:'32px', color:'#0f0' });
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 768,
  height: 512,
  backgroundColor: '#000',
  physics: { default:'arcade', arcade:{ debug:false } },
  scene: [GameScene]
};

new Phaser.Game(config);