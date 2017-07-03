function Tower(props) {
  this.game = props.game;
  this.gameInfo = props.game_info;
  this.weapon = props.weapon;
  this.enemies = props.enemies;

  this.body = game.add.sprite(props.position.x + 10, props.position.y, props.tower_image);
  this.game.physics.arcade.enable(this.body);
  this.body.scale.set(0.83, 0.73);

  this.buildPoint = 100;

  this.upgradeButton = game.add.sprite(props.position.x + 10, props.position.y, props.tower_image);
  this.upgradeButton.scale.set(0.83, 0.73);
  this.upgradeButton.inputEnabled = true;
  this.upgradeButton.events.onInputDown.add(
    function() {
      this._upgradeTower();
    }, this);

  this.upgradeButton.alpha = 0.0;

  this.target = null;
  this.fireRate = props.fireRate;
  this.targetDistance = props.targetDistance;

  this.upgradConfig = props.upgrade_config;
  this.upgradeLevel = 0;
  this.maxUpgradeLevel = this.upgradConfig.length;
  this.currentUpgradeCost = this.upgradConfig[0].cost;

  this.damage = props.damage;
  this.splashDamage = props.splash_damage;

  this.weapon = props.weapon;
  this.weapon.setAll('damage', this.damage);
  this.weapon.setAll('data', {'splashDamage': this.splashDamage});
  //  무기에 대미지를 고정하는 기능이 있어야 한다.
  this.nextFire = 0;

  this.arrows = this.game.add.sprite(this.body.x - 20, this.body.y + 50, 'arrows', 2);
  this.arrows.scale.set(0.1, 0.1);
  this.arrows.smoothed = false;
  anim = this.arrows.animations.add('run');
  anim.play(5, true);
  this.arrows.alpha = 0.0;

}

Tower.prototype = {
  update: function() {
    if(this.upgradeLevel < this.maxUpgradeLevel && this.gameInfo.getGold() > this.currentUpgradeCost) {
      this._showUpgradeButton();
    }

    this._updateTagetEnemy();
    if (this.target && this.game.time.now > this.nextFire) {
      this._fireWeapon();
    }
  },
  _updateTagetEnemy: function() {
    for(var i = 0 ; i < this.enemies.length ; i++) {
      var enemySprite = this.enemies[i].body;
      if (this.enemies[i].alive && ( this.game.physics.arcade.distanceBetween(this.body, enemySprite) < this.targetDistance )) {
        this.target = enemySprite;
        return;
      }
    }
    this.target = null;
  },
  _fireWeapon: function() {
    this.nextFire = this.game.time.now + this.fireRate;
    var weapon = this.weapon.getFirstDead();
    weapon.reset(this.body.x + 20, this.body.y + 35);
    weapon.rotation = this.game.physics.arcade.moveToObject(weapon, this.target, 1000);
  },
  _showUpgradeButton: function() {
    this.upgradeButton = 1.0;
    this.arrows.alpha = 1.0;
  },
  _upgradeTower: function() {
    if(this.upgradeLevel <= this.maxUpgradeLevel - 1) {
      this.gameInfo.setGold(this.currentUpgradeCost * (-1));
      this.damage += this.upgradConfig[this.upgradeLevel].damage_up;
      this.splashDamage += this.upgradConfig[this.upgradeLevel].splash_damage_up;
      this.weapon.setAll('damage', this.damage);
      this.weapon.setAll('data', {'splashDamage': this.splashDamage});
      this.upgradeLevel++;
      this._hideUpgradeButton();
    }
  },
  _hideUpgradeButton: function() {
    this.arrows.alpha = 0.0;
    //changeImage;
    //changeImage;
  }
}
