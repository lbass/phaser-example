function Tutorial_01(props) {
  this.target = {
    x: 4 * TILE_SQUARE,
    y: 14 * TILE_SQUARE
  };
  this.game = props.game;
  this.towers = props.towers;
  this.moveCursor = null;
  this.isRun = false;

  var textBackGround = this.game.add.bitmapData(250, 120);
  textBackGround.ctx.beginPath();
  textBackGround.ctx.rect(0, 0, 250, 120);
  textBackGround.ctx.fillStyle = 'rgba(20, 20, 20, 1)';
  textBackGround.ctx.fill();
  this.textBackGround = this.game.add.sprite(220, 10, textBackGround);
  this.tutorialText = game.add.text(250, 30, messageMap['tutorial_message_01'], { font: "20px 맑은고딕", fill: "#FFFF00" });

  /*
  this.cursor = this.game.add.group();
  this.cursor.enableBody = true;
  this.cursor.physicsBodyType = Phaser.Physics.ARCADE;
  this.cursor.setAll('anchor.x', 0.5);
  this.cursor.setAll('anchor.y', 0.5);
  this.cursor.setAll('outOfBoundsKill', true);
  this.cursor.setAll('checkWorldBounds', true);
  */
  var handCursor = this.game.add.sprite(0, 0, 'tutorial_hand');
  this.game.physics.arcade.enable(handCursor);
  handCursor.scale.set(0.1, 0.1);
  handCursor.alpha = 0.0;
  handCursor.outOfBoundsKill = true;
  handCursor.checkWorldBounds = true;
  this.moveCursor = handCursor;
  //this.cursor.add(handCursor);
  //this.moveCursor.alpha = 1.0;
  //this._resetPosition();

  this.isPause = true;
}

Tutorial_01.prototype = {
  update: function() {
    //  tower가 지어지면 tutorial을 종료된다.
    for(var key in towers) {
      this.isPause = false;
      this.moveCursor.kill();
      this.textBackGround.kill();
      this.tutorialText.kill();
    }
    if(this.isRun) {
      if(this.game.physics.arcade.distanceToXY(this.moveCursor, this.target.x, this.target.y) < 100 ) {
        this._resetPosition();
      }
    } else {
      this.isRun = true;
      //this.moveCursor = this.cursor.getAt(0);
      this.moveCursor.alpha = 1.0;
      this._resetPosition();
    }
  },
  checkPause: function() {
    return this.isPause;
  },
  _resetPosition: function() {
    this.moveCursor.reset(this.target.x + (11 * TILE_SQUARE), this.target.y - 50);
    this.moveCursor.rotation = this.game.physics.arcade.moveToXY(this.moveCursor, this.target.x, this.target.y - 50, 300);
    this.moveCursor.angle = this.moveCursor.angle + 180;
  }
}
