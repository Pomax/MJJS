/**
 * This object represents a set of tiles. While any size is possible,
 * the game itself is only really concerned with sets of two tiles,
 * forming a pair, three tiles, forming a pung, or four tiles, forming
 * a kong.
 */
var Set = function(hand, tileNumber, setSize) {
  var Set = this;
  this.tiles = [];

  var count = 0;
  var bank = hand.concealed;
  var tile, i;
  // can we do this?
  for(i = bank.tiles.length - 1; i>=0; i--) {
    tile = bank.tiles[i];
    if(tile.tileNumber === tileNumber) {
      this.add(tile);
      count++;
    }
  }
  // we cannot:
  if (count < setSize) {
    throw "cannot form a set of size "+setSize+" for tile "+tileNumber;
  }
  // we can:
  this.tiles = this.tiles.slice(0,setSize);
  for(i=0; i<setSize; i++) {
    this.tiles[i].reveal();
    bank.remove(this.tiles[i]);
  }
}

Set.prototype = {
  tiles: [],
  get: function(idx) {
    return this.tiles[idx];
  },
  add: function(tile) {
    this.tiles.push(tile);
  },
  reveal: function() {
    this.tiles.forEach(function(t){ t.reveal(); });
  },
  // convert to array of tileNumbers
  toTileNumbers: function() {
    var numbers = [];
    this.tiles.forEach(function(tile) {
      numbers.push(tile.tileNumber);
    });
    return numbers;
  },
  asHTMLElement: function(update) {
    if(!this.el) {
      var div = document.createElement("div");
      div.setAttribute("class", "set");
      (this.tiles).forEach(function(tile) { div.appendChild(tile); });
      this.el = div; }
    else if(update===true) {
      var div = this.el;
      div.innerHTML = "";
      (this.tiles).forEach(function(tile) { div.appendChild(tile); });
    }
    return this.el;
  }
}

Set.prototype.constructor = Set;

// While we don't really use it, let's mode the "single" set as well as the rest.
var Single = function(hand, tileNumber) {
  return new Set(hand, tileNumber, 1);
};

// set of size 2: pair of tiles
var Pair = function(hand, tileNumber) {
  return new Set(hand, tileNumber, 2);
};

// set of size 3: pung. good set.
var Pung = function(hand, tileNumber) {
  return new Set(hand, tileNumber, 3);
};

// set of size 4: kong. eyebrow-raising-ly good set.
var Kong = function(hand, tileNumber) {
  return new Set(hand, tileNumber, 4);
};