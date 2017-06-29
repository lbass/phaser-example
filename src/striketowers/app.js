'use strict';
var VIEW_W = 800;
var VIEW_H = 600;
var TILE_SQUARE = 40;
var BUILD_TILE_SQUARE = TILE_SQUARE * 2;

// 탑의 생성을 위한 설정 정보
var TOWER_CONFIG = {
  'COMMON': {
    'button_image': 'tower_icon_01',
    'tower_image': 'tower_01',
    'button_position_x': 15,
    'button_position_y': 12,
    'weapon': 'bullet',
    'fireRate': 500,
    'targetDistance': 200
  },
  'ROCKET': {
    'button_image': 'tower_icon_01',
    'tower_image': 'tower_01',
    'button_position_x': 17,
    'button_position_y': 12,
    'weapon': 'rocket',
    'fireRate': 1000,
    'targetDistance': 300
  }
}

var game;
var player;
//  탑을 지을수 있는 장소
var buildSpots = {};
//  건설된 탑
var towers = {};

//  탑의 사용 무기
var weapon_bullets;
var weapon_rockets;
var weapon_explosion;

//  enemy array
var enemies = [];
var enemies_alive_count = 0;
var enemies_create_count = 0;
var enemies_max_count = 10;

var enemiesAnimation = [{'name': 'mummy', 'length': 5}];
var current_tutorial = null;
var nextGenerateTime = 0;
var generateRate = 1000;

//  게임을 생성한다. 각각에 맞는 핸들러를 설정
var game = new Phaser.Game(VIEW_W, VIEW_H, Phaser.AUTO, '',
  {
    preload: preload,
    create: create,
    update: update
  }
);
//  게임에서 사용될 이미지를 로딩
function preload() {
  game.load.image('ground', '/assets/striketowers/earth.png');
  game.load.image('player', '/assets/striketowers/player.jpg', 510, 434);
  game.load.image('tower_01', '/assets/striketowers/tower_01.png');
  game.load.image('tower_icon_01', '/assets/striketowers/tower_icon_01.png');
  game.load.image('bullet', '/assets/striketowers/bullet.png');
  game.load.image('rocket', '/assets/striketowers/rocket.png');
  game.load.image('rocket', '/assets/striketowers/rocket.png');
  game.load.image('smoke', '/assets/striketowers/smoke.png');
  game.load.spritesheet('explosion', '/assets/striketowers/explosion.png', 128, 128);
  game.load.spritesheet('mummy', '/assets/striketowers/metalslug_mummy37x45.png', 37, 45, 18);
}

function create() {
  //  물리엔진을 선택한다. ARCADE < NINJA < P2 순으로 부하가 크다.
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.add.tileSprite(0, 0, VIEW_W, VIEW_H, 'ground');
  //  그룹을 만든다 (바닥을 비롯한 게임의 실제 고정 장애물)

  //  이동경로를 보여주는 길을 표시한다.
  for(var i = 0 ; i < path1.length ; i++) {
    var pathBmd = game.add.bitmapData(TILE_SQUARE, TILE_SQUARE);
    pathBmd.ctx.beginPath();
    pathBmd.ctx.rect(0, 0, TILE_SQUARE, TILE_SQUARE);
    pathBmd.ctx.fillStyle = 'rgba(20, 20, 20, 0.5)';
    pathBmd.ctx.fill();
    game.add.sprite(path1[i].x * TILE_SQUARE, path1[i].y * TILE_SQUARE, pathBmd);
  }

  for(var i = 0 ; i < path2.length ; i++) {
    var pathBmd = game.add.bitmapData(TILE_SQUARE, TILE_SQUARE);
    pathBmd.ctx.beginPath();
    pathBmd.ctx.rect(0, 0, TILE_SQUARE, TILE_SQUARE);
    pathBmd.ctx.fillStyle = 'rgba(20, 20, 20, 0.5)';
    pathBmd.ctx.fill();
    game.add.sprite(path2[i].x * TILE_SQUARE, path2[i].y * TILE_SQUARE, pathBmd);
  }

  //  건설이 가능한 영역을 세팅
  for(var i = 0 ; i < buildPointXY.length ; i++) {
    var bmd = game.add.bitmapData(BUILD_TILE_SQUARE, BUILD_TILE_SQUARE);
    bmd.ctx.beginPath();
    bmd.ctx.rect(0, 0, BUILD_TILE_SQUARE, BUILD_TILE_SQUARE);
    bmd.ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    bmd.ctx.fill();
    var buildSpot = game.add.sprite(buildPointXY[i].x * TILE_SQUARE, buildPointXY[i].y * TILE_SQUARE, bmd);
    var spotId = buildPointXY[i].x.toString() + '_' + buildPointXY[i].y.toString();
    buildSpots[spotId] = buildSpot;
  }

  createBuildButton(TOWER_CONFIG.COMMON);
  createBuildButton(TOWER_CONFIG.ROCKET);

  //  플레이어를 표시한다.
  player = game.add.sprite(17.6 * TILE_SQUARE, 3.7 * TILE_SQUARE, 'player');
  player.scale.set(0.19, 0.22);

  //  무기를 생성
  weapon_bullets = game.add.group();
  weapon_bullets.enableBody = true;
  weapon_bullets.physicsBodyType = Phaser.Physics.ARCADE;
  weapon_bullets.createMultiple(100, 'bullet');
  weapon_bullets.setAll('anchor.x', 0.5);
  weapon_bullets.setAll('anchor.y', 0.5);
  weapon_bullets.setAll('outOfBoundsKill', true);
  weapon_bullets.setAll('checkWorldBounds', true);

  weapon_rockets = game.add.group();
  weapon_rockets.enableBody = true;
  weapon_rockets.physicsBodyType = Phaser.Physics.ARCADE;
  weapon_rockets.createMultiple(100, 'rocket');
  weapon_rockets.setAll('anchor.x', 0.5);
  weapon_rockets.setAll('anchor.y', 0.5);
  weapon_rockets.setAll('outOfBoundsKill', true);
  weapon_rockets.setAll('checkWorldBounds', true);

  weapon_explosion = game.add.group();
  weapon_explosion.enableBody = true;
  weapon_explosion.physicsBodyType = Phaser.Physics.ARCADE;
  weapon_explosion.createMultiple(30, 'explosion');
  weapon_explosion.setAll('anchor.x', 0.5);
  weapon_explosion.setAll('anchor.y', 0.5);
  weapon_explosion.forEach(function(explosion) {
    var animation = explosion.animations.add('boom', [0,1,2,3], 60, false);
    animation.killOnComplete = true;
  });

  game.input.activePointer.x = this.game.width/2;
  game.input.activePointer.y = this.game.height/2 - 100;

  //  첫번째 Tutorial 객체를 생성한다.
  var t_properties = {
    'game': game,
    'towers': towers
  };
  current_tutorial = new Tutorial(t_properties);

  //  적을 생성한다 - 물리엔진 사용을 위해 Group을 사용함.
  enemies = game.add.group();
  enemies.enableBody = true;
  enemies.physicsBodyType = Phaser.Physics.ARCADE;
}


function generateEnemy(pathType) {
  if(enemies_create_count >= enemies_max_count) {
    return;
  } else {
    var animEnemy = enemiesAnimation[parseInt(Math.random() * enemiesAnimation.length)];
    new Enemy(pathType, animEnemy.name, animEnemy.length, pathType);
  }
  enemies_alive_count++;
  enemies_create_count++;
}

function update() {
  //  Tutorial 실행
  current_tutorial.update();
  var isTutorialPause = current_tutorial.checkPause();

  //  Tutorial로 인한 일시정지가 풀렸을 경우
  if(!isTutorialPause) {
    for(var key in towers) {
      towers[key].update();
    }

    if(this.game.time.now > nextGenerateTime) {
      generateEnemy(1);
      generateEnemy(2);
      nextGenerateTime = this.game.time.now + generateRate;
    }

    enemies.forEach(function(enemy) {
      //  적 객체가 무기에 맞을 경우를 처리 한다.
      //  bullet
      game.physics.arcade.overlap(weapon_bullets, enemy,
        function (enemy, bullet) {
          bullet.kill();
          enemy.kill();
          enemy.isAlive = false;
          enemies_alive_count--;
        },
        null, this);
      //  rocket
      game.physics.arcade.overlap(weapon_rockets, enemy,
        function rocketHitEnemy (enemy, rocket) {
          rocket.kill();
          enemy.isAlive = false;
          enemy.kill();
          enemies_alive_count--;
          //로켓이 폭발하면 발생하는 splash damage 처리
          processSplashDamage(enemy, rocket);
        },
        null, this);
        //적의 이동처리
        Enemy.prototype.moveElmt(enemy);
    });

    if(enemies_create_count >= enemies_max_count && enemies_alive_count === 0) {
        game.paused = true;
        alert("잘했네");
    }
  }
}

function processSplashDamage(enemy, rocket) {
  //  splash 효과처리
  var explosion = weapon_explosion.getFirstDead();
  explosion.revive();
  explosion.x = rocket.x;
  explosion.y = rocket.y;
  explosion.angle = game.rnd.integerInRange(0, 360);
  explosion.animations.play('boom');
  //  splash damage 처리
  enemies.forEach(function(enemy) {
    var distance = game.math.distance(rocket.x, rocket.y,
        enemy.x, enemy.y);
    if (distance < 70) {
      enemy.kill();
      enemy.isAlive = false;
      enemies_alive_count--;
    }
  }, this);
}


function createBuildButton(config) {
  //버튼 배치와 버튼을 드래그하여 배치 할 경우의 이벤트 핸들러까지 정의 된다.
  var buttonX = config.button_position_x * TILE_SQUARE;
  var buttonY = config.button_position_y * TILE_SQUARE;
  var scaleX = 0.83;
  var scaleY = 0.77;
  var towerButton = game.add.sprite(buttonX, buttonY, config.button_image);
  towerButton.scale.set(scaleX, scaleY);

  var dragObject = game.add.sprite(buttonX, buttonY, config.button_image);
  dragObject.scale.set(scaleX, scaleY);
  dragObject.alpha = 0.0;
  dragObject.inputEnabled = true;
  dragObject.input.enableDrag(true);
  dragObject.input.enableSnap(TILE_SQUARE, TILE_SQUARE, true, true);

  dragObject.events.onDragStart.add(
    function dragStart() {
      dragObject.alpha = 0.5;
    }
  );

  dragObject.events.onDragUpdate.add(
    function dragUpdate(sprite, pointer, dragX, dragY, snapPoint) {
        //  nothing
    }
  );

  dragObject.events.onDragStop.add(
    function dragStop(sprite, pointer) {
      var spotId = (sprite.x / TILE_SQUARE).toString() + '_' + (sprite.y / TILE_SQUARE).toString();
      if(buildSpots[spotId]) {
        var buildSpot = buildSpots[spotId];
        buildSpot.alpha = 0.0;
        var towerObj = game.add.sprite(sprite.x + 10, sprite.y, config.tower_image);
        towerObj.scale.set(0.83, 0.73);

        var properties = {
          game: game,
          tower: towerObj,
          weapon: getWeapon(config.weapon),
          enemies: enemies.children,
          fireRate: config.fireRate,
          targetDistance: config.targetDistance
        };
        var tower = new Tower(properties);
        towers[spotId] = tower;
      }
      sprite.alpha = 0.0;
      sprite.reset(buttonX, buttonY);
    }
  );
}

function getWeapon(type) {
  var weapon;
  switch(type) {
    case 'bullet':
      weapon = weapon_bullets;
      break;
    case 'rocket':
      weapon = weapon_rockets;
      break;
  }
  return weapon;
}

function bulletHitEnemy (enemy, bullet) {
  bullet.kill();
  enemy.kill();
  enemy.isAlive = false;
}

function rocketHitEnemy (enemy, rocket) {
  rocket.kill();
  enemy.isAlive = false;
  enemy.kill();

  enemies.forEach(function(enemy) {
      var distance = this.game.math.distance(rocket.x, rocket.y,
          enemy.x, enemy.y);
      if (distance < 70) {
        enemy.kill();
        enemy.isAlive = false;
      }
  }, this);

  var explosion = weapon_explosion.getFirstDead();
  explosion.revive();
  explosion.x = rocket.x;
  explosion.y = rocket.y;
  explosion.angle = game.rnd.integerInRange(0, 360);
  explosion.animations.play('boom');
}
