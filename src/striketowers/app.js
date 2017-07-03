//'use strict';
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
    'targetDistance': 200,
    'build_cost': 100,
    'damage': 10,
    'splash_damage': 0,
    'upgrade_config': [
      {
        'cost': 100,
        'damage_up': 5
      },
      {
        'cost': 200,
        'damage_up': 10
      }
    ]
  },
  'ROCKET': {
    'button_image': 'tower_icon_01',
    'tower_image': 'tower_01',
    'button_position_x': 17,
    'button_position_y': 12,
    'weapon': 'rocket',
    'fireRate': 1000,
    'targetDistance': 300,
    'build_cost': 200,
    'damage': 10,
    'splash_damage': 5,
    'upgrade_config': [
      {
        'cost': 200,
        'damage_up': 10,
        'splash_damage_up': 5,
      },
      {
        'cost': 400,
        'damage_up': 20,
        'splash_damage_up': 10,
      }
    ]
  }
}
var tutorial_01_off = false;
var tutorial_02_off = false;
var game;

var player;
var player_health = 100;
//  탑을 지을수 있는 장소
var buildSpots = {};
var buildDragButtons = [];
//  건설된 탑
var towers = {};

//  탑의 사용 무기
var WEAPON_TYPES = {
  'BULLET': 'bullet',
  'ROCKET': 'rocket',
  'EXPLOSION': 'explosion'
}
var weapon_bullets;
var weapon_rockets;
var weapon_explosion;

//  enemy array
var enemies = [];
var enemies_alive_count = 0;
var enemies_create_count = 0;
var enemies_max_count = 100;

var enemiesAnimation = [{'name': 'mummy', 'length': 5}];
var tutorial_01 = null;
var tutorial_02 = null;
var nextGenerateTime = 0;
var generateRate = 500;

var gameInfo = {};

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
  game.load.image('tower_drag_01', '/assets/striketowers/tower_drag_01.png');
  game.load.image('tower_icon_01', '/assets/striketowers/tower_icon_01.png');
  game.load.image('bullet', '/assets/striketowers/bullet.png');
  game.load.image('rocket', '/assets/striketowers/rocket.png');
  game.load.image('smoke', '/assets/striketowers/smoke.png');

  game.load.spritesheet('arrows', '/assets/striketowers/arrows.png', 219, 200, 2);
  game.load.spritesheet('tutorial_hand', '/assets/striketowers/tutorial_hand.png');
  game.load.spritesheet('explosion', '/assets/striketowers/explosion.png', 128, 128);
  game.load.spritesheet('mummy', '/assets/striketowers/mummy.png', 37, 45, 18);
}

function create() {
  //  물리엔진을 선택한다. ARCADE < NINJA < P2 순으로 부하가 크다.
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.add.tileSprite(0, 0, VIEW_W, VIEW_H, 'ground');

  var gameInfoProperties = {
    'game': game,
    'gold': 100
  };
  gameInfo = new GameInfo(gameInfoProperties);
  //  이동경로를 보여주는 길을 표시한다.
  createPath(path1);
  createPath(path2);

  //  건설이 가능한 영역을 세팅
  for(var i = 0 ; i < buildPointXY.length ; i++) {
    var spotId = buildPointXY[i].x.toString() + '_' + buildPointXY[i].y.toString();
    var buildSpot = createBuildPoint(buildPointXY[i].x, buildPointXY[i].y);
    buildSpots[spotId] = buildSpot;
  }

  //화면에 건설을 위한 버튼을 배치
  createBuildButton(TOWER_CONFIG.COMMON, gameInfo);
  createBuildButton(TOWER_CONFIG.ROCKET, gameInfo);

  //  플레이어 생성
  var playerProperties = {
    game: game,
    health: player_health
  }
  player = new Player(playerProperties);

  //  무기를 생성
  weapon_bullets = createWeapon(WEAPON_TYPES.BULLET);
  weapon_rockets = createWeapon(WEAPON_TYPES.ROCKET);
  weapon_explosion = createWeapon(WEAPON_TYPES.EXPLOSION);

  //  첫번째 Tutorial 객체를 생성한다.
  var tutorialProperties = {
    'game': game,
    'towers': towers
  };
  tutorial_01 = new Tutorial_01(tutorialProperties);
  // 두번째 Tutorial 객체를 생성한다.
  tutorial_02 = new Tutorial_02(tutorialProperties);
}

function update() {
  //  Tutorial 체크 실행
  gameInfo.update();
  checkGameOver();

  var isTutorialPause = false;
  if(!tutorial_01_off) {
    tutorial_01.update();
    isTutorialPause = tutorial_01.checkPause();
  }
  if(!tutorial_02_off && gameInfo.getGold() >= 10) {
    tutorial_02.update();
  }

  //  건설버튼 활성화 체크.
  for (var i = 0; i < buildDragButtons.length; i++) {
    if(gameInfo.getGold() >= buildDragButtons[i].data.buildCost) {
      if(!buildDragButtons[i].data.isDragable) {
        checkDragObjState(buildDragButtons[i], true);
      }
    } else {
      if(buildDragButtons[i].data.isDragable) {
        checkDragObjState(buildDragButtons[i], false);
      }
    }
  }

  //  Tutorial로 인한 일시정지가 풀렸을 경우
  if(!isTutorialPause) {
    for(var key in towers) {
      towers[key].update();
    }

    //  적을 생성한다.
    if(this.game.time.now > nextGenerateTime && enemies_create_count <= enemies_max_count) {
      //  물리엔진 적용을 위해 group에 실제 sprite객체를 추가한다.
      enemies.push(createEnemy(path1));
      enemies.push(createEnemy(path2));
      nextGenerateTime = this.game.time.now + generateRate;
    }

    for (var i = 0; i < enemies.length; i++) {
      if(enemies[i].alive) {
        var enemySprite = enemies[i].body;
        game.physics.arcade.overlap(weapon_bullets, enemySprite,
          function (enemy, bullet) {
            bullet.kill();
            hitEnemy(enemies[i], bullet.damage);
          },
          null, this);
        //  rocket
        game.physics.arcade.overlap(weapon_rockets, enemySprite,
          function (enemy, rocket) {
            rocket.kill();
            hitEnemy(enemies[i], rocket.damage);
            //  로켓이 폭발하면 발생하는 splash damage 처리
            processSplashDamage(enemies[i], rocket);
          },
          null, this);
        //  enemy 업데이트
        enemies[i].update();
      }
    }
    //  for END
  }
  //  if(!isTutorialPause) END

}

function createEnemy(enemyMovePath) {
  var animEnemy = enemiesAnimation[0];
  var properties = {
    game: game,
    player: player,
    name: enemies_create_count,
    image_name: animEnemy.name,
    animation_length: animEnemy.length,
    move_path: enemyMovePath,
    gold: 15,
    hp: 100
  };
  var enemy = new Enemy(properties);
  enemies_alive_count++;
  enemies_create_count++;
  return enemy;
}

function createPath(path) {
  for(var i = 0 ; i < path.length ; i++) {
    var pathBmd = game.add.bitmapData(TILE_SQUARE, TILE_SQUARE);
    pathBmd.ctx.beginPath();
    pathBmd.ctx.rect(0, 0, TILE_SQUARE, TILE_SQUARE);
    pathBmd.ctx.fillStyle = 'rgba(20, 20, 20, 0.5)';
    pathBmd.ctx.fill();
    game.add.sprite(path[i].x * TILE_SQUARE, path[i].y * TILE_SQUARE, pathBmd);
  }
}

function createWeapon(weaponType) {
  var weapon = game.add.group();
  weapon.enableBody = true;
  weapon.physicsBodyType = Phaser.Physics.ARCADE;
  weapon.createMultiple(100, weaponType);
  weapon.setAll('anchor.x', 0.5);
  weapon.setAll('anchor.y', 0.5);
  weapon.setAll('outOfBoundsKill', true);
  weapon.setAll('checkWorldBounds', true);
  if(weaponType === WEAPON_TYPES.EXPLOSION) {
    weapon.forEach(function(explosion) {
      var animation = explosion.animations.add('boom', [0,1,2,3], 60, false);
      animation.killOnComplete = true;
    });
  }
  return weapon;
}

function createBuildPoint(x, y) {
  var bmd = game.add.bitmapData(BUILD_TILE_SQUARE, BUILD_TILE_SQUARE);
  bmd.ctx.beginPath();
  bmd.ctx.rect(0, 0, BUILD_TILE_SQUARE, BUILD_TILE_SQUARE);
  bmd.ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
  bmd.ctx.fill();
  var buildSpot = game.add.sprite(x * TILE_SQUARE, y * TILE_SQUARE, bmd);
  return buildSpot;
}

function createBuildButton(config) {
  //버튼 배치와 버튼을 드래그하여 배치 할 경우의 이벤트 핸들러까지 정의 된다.
  var buttonX = config.button_position_x * TILE_SQUARE;
  var buttonY = config.button_position_y * TILE_SQUARE;
  var scaleX = 0.83;
  var scaleY = 0.77;
  var towerButton = game.add.sprite(buttonX, buttonY, config.button_image);
  towerButton.scale.set(scaleX, scaleY);

  var dragObject = game.add.sprite(buttonX, buttonY, 'tower_drag_01');
  dragObject.scale.set(scaleX, scaleY);
  dragObject.alpha = 0.5;
  dragObject.data = {
    'buildCost': config.build_cost,
    'isDragable': false
  };
//  dragObject.input.enableDrag(false);
//  dragObject.input.enableSnap(TILE_SQUARE, TILE_SQUARE, true, true);
  buildDragButtons.push(dragObject);

  dragObject.events.onDragStart.add(
    function dragStart(sprite) {
      sprite.alpha = 0.3;
    }
  );

  dragObject.events.onDragUpdate.add(
    function dragUpdate(sprite, pointer, dragX, dragY, snapPoint) {
    }
  );

  dragObject.events.onDragStop.add(
    function dragStop(sprite, pointer) {
      var spotId = (sprite.x / TILE_SQUARE).toString() + '_' + (sprite.y / TILE_SQUARE).toString();
      if(buildSpots[spotId]) {
        var buildSpot = buildSpots[spotId];
        buildSpot.alpha = 0.0;

        var properties = {
          game: game,
          game_info: gameInfo,
          weapon: getWeapon(config.weapon),
          enemies: enemies,
          position: {x: sprite.x, y: sprite.y},
          fireRate: config.fireRate,
          tower_image: config.tower_image,
          targetDistance: config.targetDistance,
          damage: config.damage,
          splash_damage: config.splash_damage,
          upgrade_config: config.upgrade_config
        };
        var tower = new Tower(properties);
        towers[spotId] = tower;

        gameInfo.setGold(sprite.data.buildCost * (-1));
      }
      sprite.alpha = 0.0;
      sprite.reset(buttonX, buttonY);
    }
  );
}

function checkDragObjState(dragObj, isDragable) {
  if(isDragable) {
    dragObj.inputEnabled = true;
    dragObj.input.enableDrag(true);
    dragObj.input.enableSnap(TILE_SQUARE, TILE_SQUARE, true, true);
    dragObj.alpha = 0.0;
    dragObj.data.isDragable = true;
  } else {
    dragObj.alpha = 0.5;
    dragObj.inputEnabled = false;
    dragObj.data.isDragable = false;
  }
}

function hitEnemy(enemy, damage) {
  enemy.health -= damage;
  if (enemy.health <= 0) {
    destroyEnemy(enemy);
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
  for (var i = 0; i < enemies.length; i++) {
    if(enemies[i].alive) {
      var distance = game.math.distance(rocket.x, rocket.y, enemies[i].body.x, enemies[i].body.y);
      if (distance < 90) {
        if(enemies[i].alive) {
          hitEnemy(enemies[i], rocket.data.splashDamage);
        }
      }
    }
  }
}

function destroyEnemy(enemy) {
  enemy.body.kill();
  enemy.alive = false;
  enemies_alive_count--;

  gameInfo.setGold(enemy.dropGold);
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

function checkGameOver() {
  //  게임 종료
  if((enemies_create_count >= enemies_max_count && enemies_alive_count === 0) ) {
  }

}
