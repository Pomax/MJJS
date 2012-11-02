var Hand = function() {
  this.concealed = new Bank("concealed");
  this.bonus = new Bank("bonus");
  this.open = new Declared();
  this.strategy = { discard: [], required: []};
};

Hand.prototype = {
  // add a tile to this hand
  add: function(tile) { this.concealed.add(tile); },
  // add a bonus tile to this hand
  addBonus: function(tile) { tile.reveal(); this.bonus.add(tile); this.bonus.sort(); },
  // remove a tile from this hand
  remove: function(tile) { this.concealed.remove(tile); },
  // lock tile by moving it to the open tile bank
  lock: function(tile, setType, origin) {
    var set = false;
    if (setType === Constants.PAIR) {
      // we can only claim a pair if it will let us win
      console.log("player implicitly declared win");
    }
    this.sort();
    switch(setType) {
      case Constants.PAIR: { set = new Pair(this, tile.tileNumber); }; break;
      case Constants.CHOW: { 
        var tn = tile.tileNumber;
        console.log("trying chow for "+tn);
        var prev2 = this.concealed.contains({tileNumber: tn-2});
        var prev1 = this.concealed.contains({tileNumber: tn-1});
        var next1 = this.concealed.contains({tileNumber: tn+1});
        console.log(prev2, prev1, "-", next1);
        
        if(prev2 && prev1 && Tiles.isLegalChow(tn-2, tn-1, tn)) { set = new Chow(this, tn-2); }
        else if(prev1 && next1 && Tiles.isLegalChow(tn-1, tn, tn+1)) { set = new Chow(this, tn-1); }
        else { set = new Chow(this, tn); }
      }; break;
      case Constants.PUNG: { set = new Pung(this, tile.tileNumber); }; break;
      case Constants.KONG: { set = new Kong(this, tile.tileNumber); }; break;
    }
    this.open.add(set);
    this.concealed.remove(tile);
  },
  // reveal this hand
  reveal: function() { this.concealed.reveal(); },
  // sort this hand
  sort: function() { this.concealed.sort(); },
  // determine what we want to pay attention to during play
  determineStrategy: function(wall) { this.strategy = Strategies.pick(wall, this.concealed, this.open); },
  // pick a discard tile
  pickDiscard: function() {
    var discards = this.strategy.discard;
    console.log(discards.join(","));
    // clear choice
    if(discards.length>0) {
      var tileNumber = discards.splice(0,1)[0];
      console.log("discarding "+tileNumber);
      return this.concealed.removeTileByNumber(tileNumber);
    }
    // unclear choice - TEST DISCARD FOR NOW
    return this.concealed.removeTileByNumber(this.concealed.get(0).tileNumber);
  },
  // are we looking for this tile?
  lookingFor: function(tile) {
    console.log(this.strategy.required, "/", this.strategy.role);
    var pos = this.strategy.required.indexOf(tile.tileNumber);
    if (pos===-1) return 0;
    var role = this.strategy.role[pos];
    return role;
  },
  // this hand as HTML element
  asHTMLElement: function(update) {
    if(!this.el) {
      var div = document.createElement("div");
      div.setAttribute("class", "hand");
      div.appendChild(this.concealed.asHTMLElement());
      var open = this.open.asHTMLElement();
      open.classList.add("open");
      div.appendChild(open);
      div.appendChild(this.bonus.asHTMLElement());
      this.el = div; }
    else if(update===true) {
      this.concealed.asHTMLElement(true);
      this.open.asHTMLElement(true); 
      this.bonus.asHTMLElement(true); 
    }
    return this.el;
  }
};

Hand.prototype.constructor = Hand;
