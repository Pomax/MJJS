function newHistory() {

  var Step = function(player, drawn, discarded, claimType) {
    this.playerName = player.name;
    this.tiles = player.hand.concealed.toTileNumbers().join(",");
    this.open =  player.hand.open.toTileNumbers().join(",");
    this.bonus =  player.hand.bonus.toTileNumbers().join(",");
    this.drawn = drawn.tileNumber;
    this.discard = (discarded.tileNumber ? discarded.tileNumber : discarded);
    this.claimType = (claimType ? claimType : Constants.NOTHING);
  };

  var history = {
    steps: [],
    addStep: function(player, drawn, discarded) {
      this.steps.push(new Step(player, drawn, discarded));
    },
    getSteps: function() {
      return this.steps;
    }
  };

  return history;
}
