/**
 * The Player object represents, unsurprisingly players.
 * Players have a name, and sit at a specific wind direction.
 * They also have "a hand", which is the object that deals with
 * tile management during play.
 */

var Player = function(name, computer) {
  this.name = name;
  this.hand = new Hand();
  this.computer = !!computer;
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
    // FIXME: if this tile draws us a kong, immediately play it
    //        This is not good play policy, but it helps right now.
    while(this.hand.hasKong(tile)) {
      this.play(tile, Constants.KONG);
      tile = wall.drawSupplement();
      this.hand.add(tile);
    }

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
    else { tile = hand.pickDiscard(this.computer); }

    if(tile === Constants.NOTILE || tile === Constants.WIN) {
      return tile;
    }
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
  lookingFor: function(tile) {
    // TODO: computer vs. human player
    return this.hand.lookingFor(tile);
  },
  // bid on a tile
  bid: function(tile, sendBid) { sendBid(this, this.lookingFor(tile)); },
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