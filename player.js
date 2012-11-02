var Player = function(name) {
  this.name = name;
  this.hand = new Hand();
};

Player.prototype = {
  name: "",
  hand: false,
  // DEBUG
  get: function(pos) { return this.hand.concealed.tiles[pos]; },
  // draw from the wall
  draw: function(resource) { 
    var tile = wall.draw();
    while(Tiles.isBonus(tile)) {
      this.hand.addBonus(tile);
      tile = wall.draw(); }
    this.hand.add(tile);
    return tile;
  },
  // add a tile (claimed, for instance)
  claim: function(tile, bid) { 
    this.hand.add(tile);
    this.lock(tile, Tiles.getClaimType(bid), bid);
  },
  // discard a specific tile (by user) or pick one (automated)
  discard: function(tile) { 
    if(tile) { this.hand.remove(tile); }
    else { tile = this.hand.pickDiscard(); }
    return tile;
  },
  // lock tile as revealed
  lock: function(tile, setType, origin) { this.hand.lock(tile, setType, origin); },
  // wrappers
  reveal: function() { this.hand.reveal(); },
  sort: function() { this.hand.sort(); },
  determineStrategy: function(wall) { return this.hand.determineStrategy(wall); },
  // are we looking for this tile?
  lookingFor: function(tile) { return this.hand.lookingFor(tile) },
  // highlight player as "current player"
  highlight: function() { if(this.el) { this.el.classList.add("highlight"); }},
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
