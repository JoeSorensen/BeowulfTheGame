const config = {
  type: Phaser.AUTO, // Which renderer to use
  width: window.innerWidth, // Canvas width in pixels
  height: window.innerHeight, // Canvas height in pixels
  parent: "game-container", // ID of the DOM element to add the canvas to
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let controls;
let player;
let cursors;

function preload() {
  this.load.image("level-tiles", "assets/simples_pimples.png");
  this.load.tilemapTiledJSON("map", "assets/BeowulfDev2.json");
  this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
  //game.physics.startSystem(Phaser.Physics.ARCADE)

  const map = this.make.tilemap({ key: "map" });

  const tileset = map.addTilesetImage("16x16", "level-tiles");

  const BG = map.createStaticLayer("1-1 BG", tileset, 0, 0);
  const Ground = map.createStaticLayer("1-1 G", tileset, 0, 0);
  map.setCollisionByProperty({ collides: true });
  map.setCollisionByExclusion([], true, this.collisionLayer);
  const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

  player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y-200, 'dude');
  player.setBounce(0.2);
  this.physics.add.collider(player, map);

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [ { key: 'dude', frame: 4 } ],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // Phaser supports multiple cameras, but you can access the default camera like this:
  const camera = this.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  // Set up the arrows to control the camera
  cursors = this.input.keyboard.createCursorKeys();


  // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  // Help text that has a "fixed" position on the screen
  this.add
    .text(16, 16, "Arrow keys to scroll", {
      font: "18px monospace",
      fill: "#ffffff",
      padding: { x: 20, y: 10 },
      backgroundColor: "#000000"
    })
    .setScrollFactor(0);
}

function update(time, delta) {
  if (cursors.left.isDown)
  {
    player.setVelocityX(-160);

    player.anims.play('left', true);
  }
  else if (cursors.right.isDown)
  {
    player.setVelocityX(160);

    player.anims.play('right', true);
  }
  else
  {
    player.setVelocityX(0);

    player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.touching.down)
  {
    player.setVelocityY(-330);
  }
}

