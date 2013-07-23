/**
 * A bank represents a collection of tiles that are associated
 * with a player's hand. The usually "banks" are the concealed
 * tile set, the open/revealed tile set, and the bonus tiles.
 */

var Bank = function(type) {
  this.tiles = [];
  this.type = type;
};

Bank.prototype = {
  // add a tile to this bank
  add: function(tile) {
    this.tiles.push(tile);
    if(this.el) { this.el.appendChild(tile); }
  },
  // does this tile exist in this bank?
  contains: function(tile) {
    var tileNumber = tile.tileNumber;
    var i=this.tiles.length;
    while(i-->0) {
      tile = this.tiles[i];
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
  // count how many times this tile exists in the hand
  getCount: function(tile) {
    var tileNumber = tile.tileNumber;
    var i=this.tiles.length;
    var ccount = 0;
    while(i-->0) {
      tile = this.tiles[i];
      if(tile.tileNumber===tileNumber) {
        ccount++;
      }
    }
    return ccount;
  },
  // get a tile by tile number
  getTileByNumber: function(tileNumber) {
    var tile, i=this.tiles.length;
    while(i-->0) {
      tile = this.tiles[i];
      if(tile.tileNumber===tileNumber) {
        return tile;
      }
    }
    console.log("could not find "+tileNumber+" in "+this.toTileNumbers().join(","));
    return false;
  },
  removeTileByNumber: function(tileNumber) {
    var tile, i=this.tiles.length;
    while(i-->0) {
      tile = this.tiles[i];
      if(tile.tileNumber===tileNumber) {
        this.remove(tile);
        return tile;
      }
    }
    console.log("could not find "+tileNumber+" in "+this.toTileNumbers().join(","));
    return false;
  },
  // remove a tile from this bank
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
  // reveal all tiles in this bank
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
  // convert the tile set to an array of tile numbers
  toTileNumbers: function() {
    var numbers = [];
    this.tiles.forEach(function(tile) {
      numbers.push(tile.tileNumber);
    });
    return numbers;
  },
  // this bank as HTML element
  asHTMLElement: function(update) {
    var div;
    if(!this.el) {
      div = document.createElement("div");
      div.setAttribute("class", this.type + " bank");
      (this.tiles).forEach(function(tile) { div.appendChild(tile); });
      this.el = div; }
    else if(update===true) {
      div = this.el;
      div.innerHTML = "";
      (this.tiles).forEach(function(tile) { div.appendChild(tile); });
    }
    return this.el;
  }
};

Bank.prototype.constructor = Bank;
