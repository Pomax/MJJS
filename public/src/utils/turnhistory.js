function newHistory(el) {

  var Step = function(player, drawn, discarded, claimType) {
    this.playerName = player.name;
    this.tiles = player.hand.concealed.toTileNumbers().join(",");
    this.open =  player.hand.open.toTileNumbers().join(",");
    this.bonus =  player.hand.bonus.toTileNumbers().join(",");
    this.drawn = drawn.tileNumber;
    this.discard = (discarded.tileNumber ? discarded.tileNumber : discarded);
    this.claimType = (claimType ? claimType : Constants.NOTHING);
  };

  Step.prototype.toString = function () {
    with(this) {
      return  playerName + " " +
              (claimType === Constants.NOTHING ?
                "drew" : "claimed"
              ) +
              " " + Constants.tileNames[drawn] + " (" + drawn + ")"+
              (claimType !== Constants.NOTHING ?
                ", as " + Constants.setNames[claimType]
                :
                ""
              ) +
              (discard !== Constants.NOTHING?
                ", discarded " + Constants.tileNames[discard] + " (" + discard + ")"
                :
                ""
              );
    }
  };

  var history = {
    steps: [],
    initial: [],
    setInitial: function(players) {
      var initial = this.initial;
      players.forEach(function(player){
        initial[player.name] = {
          tiles: player.hand.concealed.toTileNumbers()
        };
        el.innerHTML += player.name + " starts with [" + initial[player.name].tiles + "] <br>";
      });
      el.innerHTML += "<br>";
    },
    addStep: function(player, drawn, discarded, claimType) {
      var step = new Step(player, drawn, discarded, claimType);
      this.steps.push(step);
      el.innerHTML += step.toString() + "<br>";
    },
    getSteps: function() {
      return this.steps;
    }
  };

  return history;
}
