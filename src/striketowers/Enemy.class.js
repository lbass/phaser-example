function Enemy(props) {
  var animLength = props.animation_length;
  var imageName = props.image_name;

  this.game = props.game;
  this.player = props.player;
  this.name = props.name;
  this.path = props.move_path;
  //this.dropGold = props.gold;
  this.dropGold = 200;
  this.alive = true;
  this.health = 30;
  //this.damage = props.damage;
  this.speed = 1;
  this.speedX = 0;
  this.speedY = 0;
  this.curTile = 0;

  this.damage = 10;
  this.nextAttackTime = 0;
  this.attackRate = 500;

  this.body = this.game.add.sprite(this.path[0].x * TILE_SQUARE, this.path[0].y * TILE_SQUARE, imageName, animLength);
  this.game.physics.arcade.enable(this.body);
  //this.enemy.width = this.enemy.sourceWidth * 3.5;
  this.body.anchor.setTo(0.0, 0.0);
  this.body.scale.set(1.0, 0.8);
  this.body.animations.add('walk');
  this.body.animations.play('walk', animLength, true);

  this.nextTile();
}

Enemy.prototype = {
  update: function() {
    this.moveElmt();
    //  적이 플레이어와 가까워 지면 공격한다.
    if (this.game.physics.arcade.distanceBetween(this.body, this.player) <= 100) {
      if(this.game.time.now > this.nextAttackTime) {
        this.attackPlayer();
        this.nextAttackTime = this.game.time.now + this.attackRate;
      }
    }
  },
  attackPlayer: function() {
    this.player.setDamaged(this.damage);
  },
  moveElmt: function() {
    this.body.x += this.speedX;
    this.body.y += this.speedY;
    if (this.speedX > 0 && this.body.x >= this.next_positX) {
        this.body.x = this.next_positX;
    } else if (this.speedX < 0 && this.body.x <= this.next_positX) {
        this.body.x = this.next_positX;
    } else if (this.speedY > 0 && this.body.y >= this.next_positY) {
        this.body.y = this.next_positY;
    } else if (this.speedY < 0 && this.body.y <= this.next_positY) {
        this.body.y = this.next_positY;
    } else {
      return;
    }
    this.nextTile();
  },
  nextTile: function() {
    var path = this.path;
    this.curTile++;
    if(this.curTile > path.length - 1) {
      return;
    }
    this.next_positX = parseInt(path[this.curTile].x * TILE_SQUARE);
    this.next_positY = parseInt(path[this.curTile].y * TILE_SQUARE);
    // on check le sens gauche/droite
    if (this.next_positX > this.body.x) {
        this.speedX = this.speed;
    } else if (this.next_positX < this.body.x) {
        this.speedX =- this.speed;
    } else {
        this.speedX = 0;
    }
    // on check le sens haut/bas
    if (this.next_positY > this.body.y) {
        this.speedY = this.speed;
    } else if (this.next_positY < this.body.y) {
        this.speedY =- this.speed;
    } else {
        this.speedY = 0;
    }
  }
}
