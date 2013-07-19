/**
 * The Player object represents, unsurprisingly players.
 * Players have a name, and sit at a specific wind direction.
 * They also have "a hand", which is the object that deals with
 * tile management during play.
 */

var Player = function(name) {
  this.name = name;
  this.hand = new Hand();
};

Player.prototype = {
  name: "",
  hand: false,
  wind: false,
  // set this player's wind direction
  setWind: function(wind) { this.wind = wind; },
  // inspect a tile in the player's hand
  get: function(pos) { return this.hand.concealed.tiles[pos]; },
  // draw from the wall
  draw: function(wall, supplement) {
    var tile = (supplement ? wall.drawSupplement() : wall.draw());
    if(tile === Constants.NOTILE) return Constants.NOTILE;
    while(Tiles.isBonus(tile)) {
      this.hand.addBonus(tile);
      tile = (supplement ? wall.drawSupplement() : wall.draw());
      if(tile === Constants.NOTILE) return Constants.NOTILE;
    }
    this.hand.add(tile);
    this.determineStrategy();
    return tile;
  },
  // add a tile (claimed, for instance)
  claim: function(tile, bid) {
    this.hand.add(tile);
    this.play(tile, Tiles.getClaimType(bid), bid);
    this.determineStrategy();
  },
  // discard a specific tile (action intiated by user) or pick one (tile==undef, automated discard)
  discard: function(tile) {
    var hand = this.hand;
    if(tile) { hand.remove(tile); }
    else { tile = hand.pickDiscard(); }

    if(tile === Constants.NOTILE || tile === Constants.WIN) {
      return tile;
    }

/*
    // Did this player just break up a pair? I want to know if they did.
    if(this.hand.concealed.contains(tile)) {
      console.log("PLAYER BROKE UP A PAIR!");
      console.log("discard:");
      console.log("  "+tile.tileNumber+" ("+Tiles.getTileName(tile)+")");
      console.log("hand:");
      console.log("  concealed: "+hand.concealed.toTileNumbers());
      console.log("  open: "+hand.open.toTileNumbers());
      console.log("strategy:");
      console.log("  required: "+hand.strategy.required);
      console.log("  role: "+hand.strategy.role);
      console.log("  discard: "+hand.strategy.discard);
      throw "Player just broke up a pair. Why?"
    }
*/

    this.determineStrategy();
    return tile;
  },
  // play a set of tiles, moving them from concealed to the open tile bank
  play: function(tile, setType, origin) { return this.hand.play(tile, setType, origin); },
  // reveal the player's hand
  reveal: function() { this.hand.reveal(); },
  // sort the player's hand
  sort: function() { this.hand.sort(); },
  // determine the play strategy
  determineStrategy: function(wall) { return this.hand.determineStrategy(wall); },
  // are we looking for this tile?
  lookingFor: function(tile) { return this.hand.lookingFor(tile); },
  // highlight player as "current player" (HTML)
  highlight: function() { if(this.el) { this.el.classList.add("highlight"); }},
  // unhighlight player as no longer being "current player" (HTML)
  unhighlight: function() { if(this.el) { this.el.classList.remove("highlight"); }},
  // this playeras HTML element
  asHTMLElement: function() {
    if(!this.el) {
      var div = document.createElement("div");
      div.setAttribute("class", "player");
      div.setAttribute("data-name", this.name);
      div.appendChild(this.hand.asHTMLElement());
      this.el = div; }
    return this.el;
  }
};

Player.prototype.constructor = Player;
