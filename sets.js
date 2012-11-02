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
  add: function(tile) {
    this.tiles.push(tile);
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

// single, pair, pung, kong
var Single = function(hand, tileNumber) {
  return new Set(hand, tileNumber, 1);
};
var Pair = function(hand, tileNumber) {
  return new Set(hand, tileNumber, 2);
};
var Pung = function(hand, tileNumber) {
  return new Set(hand, tileNumber, 3);
};
var Kong = function(hand, tileNumber) {
  return new Set(hand, tileNumber, 4);
};