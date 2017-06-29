var score = 0;
var scoreText;

var game = new Phaser.Game(800, 600, Phaser.AUTO, '',
  {
    preload: preload,
    create: create,
    update: update
  }
);

//게임의 이미지와 같은 자원들을 로딩
function preload() {
  game.load.image('sky', '/assets/first/sky.png');
  game.load.image('ground', '/assets/first/platform.png');
  game.load.image('star', '/assets/first/star.png');
  game.load.spritesheet('dude', '/assets/first/dude.png', 32, 48);
}

function create() {
  //  물리엔진을 선택한다. ARCADE < NINJA < P2 순으로 부하가 크다.
  game.physics.startSystem(Phaser.Physics.ARCADE);
  //  커서 반응 등록
  cursors = game.input.keyboard.createCursorKeys();
  //  배경이 되는 하늘을 등록한다.
  game.add.sprite(0, 0, 'sky');
  //  그룹을 만든다 (바닥을 비롯한 게임의 실제 고정 장애물)
  platforms = game.add.group();
  platforms.enableBody = true;

  //  바닥을 생성한다.
  var ground = platforms.create(0, game.world.height - 64, 'ground');
  ground.scale.setTo(2, 2);
  ground.body.immovable = true;

  //  장애물 생성 1
  var ledge = platforms.create(400, 400, 'ground');
  ledge.scale.setTo(1, 0.5);
  ledge.body.immovable = true;

  //  장애물 생성 2
  ledge = platforms.create(-150, 250, 'ground');
  ledge.scale.setTo(1, 0.5);
  ledge.body.immovable = true;

  //  플레이어 등록
  player = game.add.sprite(32, game.world.height - 150, 'dude');
  //  물리엔진을 적용한다.
  game.physics.arcade.enable(player);

  //  [플레이어 설정]
  //  바운스 수준 설정 - 점프나 착지 시 튀는 정도
  player.body.bounce.y = 0.0;
  //  중력 수준 설정 - 적용 받는 중력 수준을 설정
  player.body.gravity.y = 300;
  //  화면끝에서 더이상 이동하지 못하도록 설정
  player.body.collideWorldBounds = true;

  //  애니메이션 설정
  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);
  //  [플레이서 설정 끝]

  //  [별 설정]
  stars = game.add.group();
  //  화면에 표시되도록 설정
  stars.enableBody = true;
  //  별 12 개 생성
  for (var i = 0; i < 12; i++) {
    //  별을 생성
    var star = stars.create(i * 70, 0, 'star');
    //  중력 설정
    star.body.gravity.y = 10;
    //  바운스 설정
    star.body.bounce.y = 0.7 + Math.random() * 0.2;
  }
  // [별 설정 끝]

  //  [점수 Text 설정]
  //화면에 순서대로 입혀지기 때문에 순서에 주의
  scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
  //  [점수 Text 설정 끝]
}

function collectStarts(player, star) {
  star.kill();
  score += 10;
  scoreText.text = 'Score: ' + score;
}

function update() {
  var hitPlatform = game.physics.arcade.collide(player, platforms);
  game.physics.arcade.collide(stars, platforms);
  game.physics.arcade.overlap(player, stars, collectStarts, null, this);

  player.body.velocity.x = 0;

  if (cursors.left.isDown) {
      //  Move to the left
      player.body.velocity.x = -150;
      player.animations.play('left');

  } else if (cursors.right.isDown) {
      //  Move to the right
      player.body.velocity.x = 150;
      player.animations.play('right');

  } else {
      //  Stand still
      player.animations.stop();
      player.frame = 4;

  }

  //  Allow the player to jump if they are touching the ground.
  /*
  if (cursors.up.isDown && player.body.touching.down && hitPlatform) {
      player.body.velocity.y = -350;
  }
  */
  if (cursors.up.isDown) {
      player.body.velocity.y = -150;
  }

}
