function GameInfo(props) {
  this.game = props.game;
  var gold = props.gold;
  //  플레이어를 표시
  this.gold = gold;
  this.goldPointText = this.game.add.text(580, 10, 'Gold: '+ this.gold, { fontSize: '25px', fill: '#FFF' });
}

GameInfo.prototype = {
  update: function() {
    this.goldPointText.text = 'Gold: '+ this.gold;
  },
  getGold: function() {
    return this.gold;
  },
  setGold: function(gold) {
    this.gold += gold;
  }
}
