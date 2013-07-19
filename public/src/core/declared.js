/**
 * This object is similar to a Bank, but rather than containing tiles,
 * contains Set/Run objects.
 *
 * NOTE: we cannot remove declared sets, and they are always open
 */

var Declared = function(type) {
  this.sets = [];
};

Declared.prototype = {
  // add a tile to this hand
  add: function(set) {
    set.reveal();
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
  // sort this bank
  sort: function() {
    this.sets.sort(function(a,b) {
      a = a.get(0).tileNumber;
      b = b.get(0).tileNumber;
      return Constants.sortFunction(a,b);
    });
    this.asHTMLElement(true);
  },
  size: function() {
    return this.sets.length;
  },
  asHTMLElement: function(update) {
    var div;
    if(!this.el) {
      div = document.createElement("div");
      div.setAttribute("class", "declared bank");
      (this.sets).forEach(function(set) { div.appendChild(set.asHTMLElement()); });
      this.el = div; }
    else if(update===true) {
      div = this.el;
      div.innerHTML = "";
      (this.sets).forEach(function(set) { div.appendChild(set.asHTMLElement()); });
    }
    return this.el;
  }
};

Declared.prototype.constructor = Declared;
