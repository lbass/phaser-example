function Tutorial_02(props) {
  this.game = props.game;
  this.towers = props.towers;
  var textBackGround = this.game.add.bitmapData(250, 120);
  textBackGround.ctx.beginPath();
  textBackGround.ctx.rect(0, 0, 250, 120);
  textBackGround.ctx.fillStyle = 'rgba(20, 20, 20, 1)';
  textBackGround.ctx.fill();
  this.textBackGround = this.game.add.sprite(220, 10, textBackGround);
  this.tutorialText = game.add.text(250, 30, messageMap['tutorial_message_02'], { font: "20px 맑은고딕", fill: "#FFFF00" });
  this.textBackGround.alpha = 0.0;
  this.tutorialText.alpha = 0.0;
  this.game.world.bringToTop(this.textBackGround);
  this.game.world.bringToTop(this.tutorialText);
}

Tutorial_02.prototype = {
  update: function() {
    if(this.textBackGround.alpha === 0.0) {
      this.textBackGround.alpha = 1.0;
      this.tutorialText.alpha = 1.0;
    }
    
    for(var key in towers) {
      if(towers[key].upgradeLevel > 0) {
        this.textBackGround.kill();
        this.tutorialText.kill();
      }
    }
  }
}
