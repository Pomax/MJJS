/**
 * Similar to Bank, but for Set/Run objects rather than tiles
 * NOTE: we cannot remove declared tiles, and they are always revealed
 */

var Declared = function(type) {
  this.sets = [];
}

Declared.prototype = {
  // add a tile to this hand
  add: function(set) { 
    this.sets.push(set); 
    if(this.el) { this.el.appendChild(set.asHTMLElement()); }
  },
  // convert to array of tileNumbers
  toTileNumbers: function() {
    var numbers = [];
    this.sets.forEach(function(set) {
      numbers = numbers.concat([set.toTileNumbers()]);
    });
    return numbers;
  },
  asHTMLElement: function(update) {
    if(!this.el) {
      var div = document.createElement("div");
      div.setAttribute("class", "declared bank");
      (this.sets).forEach(function(set) { div.appendChild(set.asHTMLElement()); });
      this.el = div; }
    else if(update===true) {
      var div = this.el;
      div.innerHTML = "";
      (this.sets).forEach(function(set) { div.appendChild(set.asHTMLElement()); });
    }
    return this.el;
  }
};

Declared.prototype.constructor = Declared;
