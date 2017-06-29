function Tutorial(props) {
  this.target = {
    x: 5 * TILE_SQUARE,
    y: 14 * TILE_SQUARE
  };
  this.game = props.game;
  this.towers = props.towers;
  this.moveCursor = null;
  
  var textBackGround = this.game.add.bitmapData(300, 230);
  textBackGround.ctx.beginPath();
  textBackGround.ctx.rect(0, 0, 300, 230);
  textBackGround.ctx.fillStyle = 'rgba(20, 20, 20, 1)';
  textBackGround.ctx.fill();
  this.textBackGround = this.game.add.sprite(300, 150, textBackGround);
  this.tutorialText = game.add.text(350, 180, messageMap['tutorial_message_01'], { font: "40px 맑은고딕", fill: "#FFFF00" });

  this.cursor = this.game.add.group();
  this.cursor.enableBody = true;
  this.cursor.physicsBodyType = Phaser.Physics.ARCADE;
  this.cursor.setAll('anchor.x', 0.5);
  this.cursor.setAll('anchor.y', 0.5);
  this.cursor.setAll('outOfBoundsKill', true);
  this.cursor.setAll('checkWorldBounds', true);

  var handCursorBmd = game.add.bitmapData(70, 70);
  handCursorBmd.ctx.beginPath();
  handCursorBmd.ctx.rect(0, 0, 70, 70);
  handCursorBmd.ctx.fillStyle = 'rgba(20, 20, 20, 1)';
  handCursorBmd.ctx.fill();
  var handCursor = game.add.sprite(530, 450, handCursorBmd);
  this.cursor.add(handCursor);

  this.isPause = true;
}

Tutorial.prototype = {
  update: function() {
    for(var key in towers) {
      this.isPause = false;
      this.moveCursor.kill();
      this.textBackGround.kill();
      this.tutorialText.kill();
    }
    if(this.moveCursor) {
      if(this.game.physics.arcade.distanceToXY(this.moveCursor, this.target.x, this.target.y) < 100 ) {
        this._resetPosition();
      }
    } else {
      this.moveCursor = this.cursor.getAt(0);
      this._resetPosition();
    }
  },
  checkPause: function() {
    return this.isPause;
  },
  _resetPosition: function() {
    this.moveCursor.reset(this.target.x + (10 * TILE_SQUARE), this.target.y);
    this.moveCursor.rotation = this.game.physics.arcade.moveToXY(this.moveCursor, this.target.x, this.target.y, 400);
  }
}
