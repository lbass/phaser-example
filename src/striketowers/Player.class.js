function Player(props) {
  this.game = props.game;
  var health = props.health;
  //  플레이어를 표시
  this.body = this.game.add.sprite(17.6 * TILE_SQUARE, 3.7 * TILE_SQUARE, 'player');
  this.body.scale.set(0.19, 0.22);
  this.body.health = health;

  this.game.physics.arcade.enable(this.body);
  this.game.physics.arcade.enable(this.body);
  this.healthText = this.game.add.text(580, 40, 'Player HP: ' + this.body.health, { fontSize: '25px', fill: '#FFF' });
}

Player.prototype = {
  setDamaged: function(damage) {
    this.body.health -= damage;
    if(this.body.health.health >= 0) {
      this.healthText.text = 'Player HP: ' + this.body.health;
    } else {
      console.info("game over");
      this.game.lockRender = true;
    }
  }
}
