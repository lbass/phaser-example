var Enemy = function(id, anim, animLength, pathType) {
  if(pathType === 1) {
    this.enemy = game.add.sprite(path1[0].x * TILE_SQUARE, path1[0].y * TILE_SQUARE, 'mummy', 5);
  } else {
    this.enemy = game.add.sprite(path2[0].x * TILE_SQUARE, path2[0].y * TILE_SQUARE, 'mummy', 5);
  }
  this.enemy.width = this.enemy.sourceWidth * 3.5;
  this.enemy.anchor.setTo(0.0, 0.0);
  this.enemy.scale.set(1.0, 0.8);
  this.enemy.animations.add('walk');
  this.enemy.animations.play('walk', animLength, true);

  this.enemy.name = id;
  this.enemy.pathType = pathType;
  this.enemy.isAlive = true;

  this.enemy.speed = 1;
  this.enemy.speedX = 0;
  this.enemy.speedY = 0;
  this.enemy.curTile = 0
  enemies.add(this.enemy);

  Enemy.prototype.nextTile(this.enemy);
  Enemy.prototype.moveElmt(this.enemy);
}

Enemy.prototype.moveElmt = function(enemy) {
  enemy.x += enemy.speedX;
  enemy.y += enemy.speedY;
  if (enemy.speedX > 0 && enemy.x >= enemy.next_positX) {
      enemy.x = enemy.next_positX;
      Enemy.prototype.nextTile(enemy);
  }
  else if (enemy.speedX < 0 && enemy.x <= enemy.next_positX) {
      enemy.x = enemy.next_positX;
      Enemy.prototype.nextTile(enemy);
  }
  else if (enemy.speedY > 0 && enemy.y >= enemy.next_positY) {
      enemy.y = enemy.next_positY;
      Enemy.prototype.nextTile(enemy);
  }
  else if (enemy.speedY < 0 && enemy.y <= enemy.next_positY) {
      enemy.y = enemy.next_positY;
      Enemy.prototype.nextTile(enemy);
  } else {
  }
}
Enemy.prototype.nextTile = function(enemy) {
  var movePath = [];
  if(enemy.pathType === 1) {
    movePath = path1;
  } else {
    movePath = path2;
  }

  enemy.curTile++;
  if(enemy.curTile > movePath.length - 1) {
    return;
  }
  enemy.next_positX = parseInt(movePath[enemy.curTile].x * TILE_SQUARE);
  enemy.next_positY = parseInt(movePath[enemy.curTile].y * TILE_SQUARE);
  // on check le sens gauche/droite
  if (enemy.next_positX > enemy.x) {
      enemy.speedX = enemy.speed;
  } else if (enemy.next_positX < enemy.x) {
      enemy.speedX = -enemy.speed;
  } else {
      enemy.speedX = 0;
  }
  // on check le sens haut/bas
  if (enemy.next_positY > enemy.y) {
      enemy.speedY = enemy.speed;
  } else if (enemy.next_positY < enemy.y) {
      enemy.speedY = -enemy.speed;
  } else {
      enemy.speedY = 0;
  }
}
