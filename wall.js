/**
 * Mahjong "wall" implementation
 */

var Wall = function () {
  // create sorted array
  var tiles = [], i;
  for(i=0; i<Constants.PLAYTILES; i++) {
    tiles = tiles.concat([i,i,i,i]);
  }
  tiles = tiles.concat([Constants.PLUM,Constants.ORCHID,Constants.CHRYSANTHEMUM,Constants.BAMBOO,
                        Constants.SPRING,Constants.SUMMER,Constants.FALL,Constants.WINTER]);
  // permute the array
  var tileNumber;
  while(tiles.length>0) {
    tileNumber = tiles.splice((Math.random()*tiles.length), 1)[0];
    this.tiles.push(Tiles.create(tileNumber, true));
  }
};

Wall.prototype = {
  tiles: [],
  deadCount: Constants.DEADWALL,
  isDead: function() { return this.tiles.size <= this.deadCount; },
  // draw a tile, unless we're in the dead wall
  draw: function() {
    if (this.size() <= this.deadCount) { return Constants.NOTILE; }
    var tile = this.tiles.splice(0,1)[0];
    if (this.el) { this.el.removeChild(this.el.children.item(0)); }
    return tile;
  },
  // draw a supplement tile, unless we've exhausted the wall
  drawSupplement: function() {
    return (this.size()>this.deadCount ? this.tiles.splice(this.tiles.length-1,1)[0] : Constants.NOTILE);
  },
  // this wall as an HTML element
  asHTMLElement: function() {
    if(!this.el) {
      var div = document.createElement("div");
      div.setAttribute("class", "wall");
      (this.tiles).forEach(function(tile) { div.appendChild(tile); });
      this.el = div; }
    return this.el;
  },
  // show all tiles in the wall
  reveal: function() {
    (this.tiles).forEach(function(tile) { tile.reveal(); });
  },
  // what's the wall's size?
  size: function() { return this.tiles.length; }
};

Wall.prototype.constructor = Wall;
