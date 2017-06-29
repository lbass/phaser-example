function Tower(props) {
  this.game = props.game;
  this.weapon = props.weapon;
  this.enemies = props.enemies;
  this.tower = props.tower;
  this.target = null;
  this.fireRate = props.fireRate;
  this.targetDistance = props.targetDistance;
  this.weapon = props.weapon;
  this.nextFire = 0;
  game.physics.enable(this.tower, Phaser.Physics.ARCADE);
}

Tower.prototype = {
  update: function() {
    this._updateTagetEnemy();
    if (this.target && this.game.time.now > this.nextFire) {
      this._fireWeapon();
    }
  },
  _updateTagetEnemy: function() {
    for(var i = 0 ; i < this.enemies.length ; i++) {
      if (this.enemies[i].isAlive && ( this.game.physics.arcade.distanceBetween(this.tower, this.enemies[i]) < this.targetDistance )) {
        this.target = this.enemies[i];
        return;
      }
    }
    this.target = null;
  },
  _fireWeapon: function() {
    this.nextFire = this.game.time.now + this.fireRate;
    var weapon = this.weapon.getFirstDead();
    weapon.reset(this.tower.x + 20, this.tower.y + 35);
    weapon.rotation = this.game.physics.arcade.moveToObject(weapon, this.target, 1000);
  }
}
