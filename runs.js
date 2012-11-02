var Run = function(hand, tileNumber, setSize) {
  var Run = this;
  this.tiles = [];

  var count = 0;
  var bank = hand.concealed;
  var tile, i;
  
  tileNumber += setSize-1;

  // can we do this?
  for(i = bank.tiles.length - 1; i>=0; i--) {
    tile = bank.tiles[i];
    if(tile.tileNumber === tileNumber) {
      this.add(tile);
      count++;
      tileNumber--;
    }
  }
  // we cannot:
  if (count < setSize) {
    throw "cannot form a set of size "+setSize+" for tile "+(tileNumber + 1 - setSize);
  }
  // we can:
  this.tiles = this.tiles.slice(0,setSize);
  for(i=0; i<setSize; i++) {
    this.tiles[i].reveal();
    bank.remove(this.tiles[i]);
  }
  this.tiles.reverse();
}

Run.prototype = {
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
      div.setAttribute("class", "run");
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

Run.prototype.constructor = Run;

// pair, pung, kong
var ConnectedPair = function(hand, tileNumber) {
  return new Run(hand, tileNumber, 2);
};
var Chow = function(hand, tileNumber) {
  return new Run(hand, tileNumber, 3);
};