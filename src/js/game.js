const config = {
  type: Phaser.AUTO, // Which renderer to use
  width: window.innerWidth, // Canvas width in pixels
  height: window.innerHeight, // Canvas height in pixels
  parent: 'game-container', // ID of the DOM element to add the canvas to
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 300}
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
let spawnPoint;
let deathObjects;

function preload() {
  this.load.image('level-tiles', 'assets/simples_pimples.png');
  this.load.tilemapTiledJSON('map', 'assets/BeowulfDev2.json');
  this.load.spritesheet('beowulf', 'assets/beowulf.png', {frameWidth: 32, frameHeight: 48});
}

function create() {

  const map = this.make.tilemap({key: 'map'});

  const tileset = map.addTilesetImage('16x16', 'level-tiles');

  const BG = map.createStaticLayer('1-1 BG', tileset, 0, 0);
  const Ground = map.createStaticLayer('1-1 G', tileset, 0, 0);
  Ground.setCollisionByProperty({collides: true});
  //map.setCollisionByExclusion([], true, this.collisionLayer);
  spawnPoint = map.findObject('Objects', obj => obj.name === 'Spawn Point');
  deathObjects = map.createFromObjects('Objects', 3, {key: 'overlap_item'});

  player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y - 20, 'beowulf');
  player.setBounce(0.2);
  player.checkWorldBounds = true;
  this.physics.add.collider(player, Ground);
  this.physics.add.overlap(player, deathObjects, die, null, this);

  const debugGraphics = this.add.graphics().setAlpha(0.75);
  Ground.renderDebug(debugGraphics, {
    tileColor: null, // Color of non-colliding tiles
    collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
  });
  /*deathObjects.renderDebug(debugGraphics, {
    tileColor: null, // Color of non-colliding tiles
    collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
  });*/

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('beowulf', {start: 0, end: 3}),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [{key: 'beowulf', frame: 4}],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('beowulf', {start: 5, end: 8}),
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
    .text(16, 16, 'Arrow keys to scroll', {
      font: '18px monospace',
      fill: '#ffffff',
      padding: {x: 20, y: 10},
      backgroundColor: '#000000'
    })
    .setScrollFactor(0);
}

function update(time, delta) {
  if (cursors.left.isDown) {
    player.setVelocityX(-260);

    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(260);

    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);

    player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.blocked.down) {
    player.setVelocityY(-330);
  }

  if (player.y > 2000 || player.x < 0) {
    player.setVelocityY(0);
    player.x = spawnPoint.x;
    player.y = spawnPoint.y - 20;
  }
}

function die(player, overlap_item) {
  console.log('e');
  player.setVelocityY(0);
  player.x = spawnPoint.x;
  player.y = spawnPoint.y - 20;
}
