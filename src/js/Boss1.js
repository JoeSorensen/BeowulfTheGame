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
let boss;
let cursors;
let spawnPoint;
let bossPoint;
let bossPoint2;
let deathObjects;
let rand;
let rand2;
let dead = false;

function preload() {
  this.load.image('level-tiles', 'assets/simples_pimples.png');
  this.load.tilemapTiledJSON('map', 'assets/BeowulfDev3-1.json');
  this.load.spritesheet('dude', 'assets/beowulf.png', {frameWidth: 32, frameHeight: 48});
  this.load.spritesheet('boss', 'assets/grendel.png', {frameWidth: 64, frameHeight: 48});
}

function create() {

  const map = this.make.tilemap({key: 'map'});

  const tileset = map.addTilesetImage('16x16', 'level-tiles');

  const BG = map.createStaticLayer('1-B BG', tileset, 0, 0);
  const Ground = map.createStaticLayer('1-B G', tileset, 0, 0);
  Ground.setCollisionByProperty({collides: true});
  //map.setCollisionByExclusion([], true, this.collisionLayer);
  spawnPoint = map.findObject('1-B OBJ', obj => obj.name === 'Spawn Point');
  bossPoint = map.findObject('1-B OBJ', obj => obj.name === 'Boss Point');
  bossPoint2 = map.findObject('1-B OBJ', obj => obj.name === 'Boss Point 2')
  //deathObjects = map.createFromObjects('1-B OBJ', 3, {key: 'overlap_item'});

  player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y - 20, 'dude');
  player.setBounce(0.2);
  player.checkWorldBounds = true;
  rand = Math.floor(Math.random() * 2);
  if(rand == 0)
    boss = this.physics.add.sprite(bossPoint.x, bossPoint.y, 'boss');
  else
    boss = this.physics.add.sprite(bossPoint2.x, bossPoint2.y, 'boss');
  this.physics.add.collider(player, Ground);
  this.physics.add.collider(boss, Ground);
  this.physics.add.overlap(player, boss, die, null, this);

  /*const debugGraphics = this.add.graphics().setAlpha(0.75);
  Ground.renderDebug(debugGraphics, {
    tileColor: null, // Color of non-colliding tiles
    collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
  });*/
  /*deathObjects.renderDebug(debugGraphics, {
    tileColor: null, // Color of non-colliding tiles
    collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
    faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
  });*/

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [{key: 'dude', frame: 4}],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'bleftidle',
    frames: [{key: 'boss', frame: 4}],
    frameRate: 20,
  });

  this.anims.create({
    key: 'bleftswoop',
    frames: [{key: 'boss', frame: 3}],
    frameRate: 20,
  });

  this.anims.create({
    key: 'bleftattack',
    frames: [{key: 'boss', frame: 0}],
    frameRate: 20,
  });

  this.anims.create({
    key: 'brightidle',
    frames: [{key: 'boss', frame: 5}],
    frameRate: 20,
  });

  this.anims.create({
    key: 'brightswoop',
    frames: this.anims.generateFrameNumbers('boss', {start: 5, end: 8}),
    frameRate: 2,
  });

  this.anims.create({
    key: 'brightattack',
    frames: this.anims.generateFrameNumbers('boss', {start: 7, end: 9}),
    frameRate: 2,
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

  if(boss.x > player.x && !dead) {
    boss.setVelocityX(-250);
    window.setTimeout(boss.anims.play('bleftswoop'), 1000);
  } else if(boss.x < player.x) {
    boss.setVelocityX(250);
    window.setTimeout(boss.anims.play('brightswoop'), 1000);
  }

  if(boss.body.blocked.left || boss.body.blocked.right) {
    boss.setVelocityY(-200);
  }

  if(boss.body.blocked.down && boss.x > player.x) {
    boss.anims.play('bleftattack');
  } else if(boss.body.blocked.down && boss.x < player.x) {
    boss.anims.play('brightattack');
  }

  if (player.y > 2000) {
    player.setVelocityY(0);
    player.x = spawnPoint.x;
    player.y = spawnPoint.y - 20;
  } else if (player.x < 0) {
    player.x = spawnPoint.x;
  }
}

function die(player, overlap_item) {
  if(rand == 0) {
    boss.setVelocityX(300);
    boss.setVelocityY(-1000);
    boss.anims.play('brightidle');
  } else {
    boss.setVelocityX(-300);
    boss.setVelocityY(-1000);
    boss.anims.play('bleftidle');
  }
  dead = true;
  player.setVelocityY(0);
  player.x = spawnPoint.x;
  player.y = spawnPoint.y - 20;
  bossReset();
}

function bossReset() {
  rand2 = Math.floor(Math.random() * 11);
  window.setTimeout(bossPosition, rand2*1000);
}

function bossPosition() {
  rand = Math.floor(Math.random() * 2);
  if(rand == 0){
    boss.x = bossPoint.x;
    boss.y = bossPoint.y;
  } else {
    boss.x = bossPoint2.x;
    boss.y = bossPoint2.y;
  }
  boss.setVelocityY(0);
  dead = false;
}
