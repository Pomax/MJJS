var Bank = function(type) {
  this.tiles = [];
  this.type = type;
}

Bank.prototype = {
  // add a tile to this hand
  add: function(tile) { 
    this.tiles.push(tile); 
    if(this.el) { this.el.appendChild(tile); }
  },
  // do we have this tile?
  contains: function(tile) {
    var tileNumber = tile.tileNumber;
    var i=this.tiles.length;
    while(i-->0) {
      tile = this.tiles[i]
      if(tile.tileNumber===tileNumber) {
        return true;
      }
    }
    return false;
  },
  // get a tile from the bank
  get: function(idx) {
    return this.tiles[idx];
  },
  // get a tile by tile number
  removeTileByNumber: function(tileNumber) {
    var tile, i=this.tiles.length;
    while(i-->0) {
      tile = this.tiles[i]
      if(tile.tileNumber===tileNumber) {
        this.remove(tile);
        return tile;
      }
    }
    console.log("could not find "+tileNumber+" in "+this.toTileNumbers().join(","));
    return null;
  },
  // remove a tile from this hand
  remove: function(tile) {
    var tiles = this.tiles, last = tiles.length, t;
    for(t=0; t<last; t++) {
      if(tiles[t] === tile) {
        tiles.splice(t,1);
        if(this.el) { this.asHTMLElement(true); }
        return;
      }
    }
  },
  // reveal this bank
  reveal: function() {
    (this.tiles).forEach(function(tile) { tile.reveal(); });
  },
  // sort this bank
  sort: function() {
    this.tiles.sort(function(a,b) {
      a = a.tileNumber;
      b = b.tileNumber;
      return Constants.sortFunction(a,b);
    });
    this.asHTMLElement(true);
  },
  // convert to array of tileNumbers
  toTileNumbers: function() {
    var numbers = [];
    this.tiles.forEach(function(tile) {
      numbers.push(tile.tileNumber);
    });
    return numbers;
  },
  // this bank as HTML element
  asHTMLElement: function(update) {
    if(!this.el) {
      var div = document.createElement("div");
      div.setAttribute("class", this.type + " bank");
      (this.tiles).forEach(function(tile) { div.appendChild(tile); });
      this.el = div; }
    else if(update===true) {
      var div = this.el;
      div.innerHTML = "";
      (this.tiles).forEach(function(tile) { div.appendChild(tile); });
    }
    return this.el;
  }
};

Bank.prototype.constructor = Bank;
