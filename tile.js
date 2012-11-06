// treat a tile as an HTML image element
var Tile = Image;

/**
 * Mahjong "tile" implementation
 */
var Tiles = {
  create: function(tileNumber, concealed) {
    var tile = new Tile();
    tile.tileNumber = tileNumber;
    tile.face = "tiles/"+tileNumber+".jpg";
    tile.back = "tiles/concealed.jpg";
    tile.concealed = concealed;
    tile.setAttribute("class","tile");
    var events = ["onclick", "onmouseover", "onmouseout"];
    events.forEach(function(eventName) {
      tile[eventName] = function() {
        window.trigger("tile-" + eventName.substring(2), {tile: tile});
      };
    });
    // extend tile function set
    tile.isConcealed = function() { return tile.concealed; };
    tile.reveal = function() { tile.concealed = false; tile.src = tile.face; };
    tile.getTileNumber = function() { return tileNumber; };
    // load the image!
    tile.src = (concealed? tile.back : tile.face);

    var fns = ["isNumeral", "isTerminal", "isHonour", "isWind", "isDragon", "isBonus"];
    fns.forEach(function(fn) { tile[fn] = function() { return Tiles[fn](tile); }; });

    return tile;
  },
  // is... functions
  isNumeral: function(tile) {
    var tn = tile.tileNumber;
    return Constants.NUMERALS <= tn && tn < Constants.HONOURS;
  },
  isTerminal: function(tile) {
    if (!this.isNumeral(tile)) return false;
    var tn = tile.tileNumber;
    return (tn % Constants.NUMMOD === 0 || tn % Constants.NUMMOD === 8);
  },
  isHonour: function(tile) {
    var tn = tile.tileNumber;
    return Constants.HONOURS <= tn && tn < Constants.BONUS;
  },
  isWind: function(tile) {
    var tn = tile.tileNumber;
    return Constants.WINDS <= tn && tn < Constants.DRAGONS;
  },
  isDragon: function(tile) {
    var tn = tile.tileNumber;
    return Constants.DRAGONS <= tn && tn < Constants.BONUS;
  },
  isBonus: function(tile) {
    var tn = tile.tileNumber;
    return Constants.BONUS <= tn;
  },
  getTileName: function(tile) {
    return Constants.tileNames[tile.tileNumber];
  },
  getTileSuit: function(tileNumber) {
    if (Constants.BAMBOOS    <= tileNumber  && tileNumber < Constants.CHARACTERS) return Constants.BAMBOOS;
    if (Constants.CHARACTERS <= tileNumber  && tileNumber < Constants.DOTS)       return Constants.CHARACTERS;
    if (Constants.DOTS       <= tileNumber  && tileNumber < Constants.WINDS)      return Constants.DOTS;
    if (Constants.WINDS      <= tileNumber  && tileNumber < Constants.DRAGONS)    return Constants.WINDS;
    if (Constants.DRAGONS    <= tileNumber  && tileNumber < Constants.FLOWERS)    return Constants.DRAGONS;
    if (Constants.FLOWERS    <= tileNumber  && tileNumber < Constants.SEASONS)    return Constants.FLOWERS;
    return Constants.SEASONS;
  },
  isLegalChow: function(t1, t2, t3) {
    if(t1 >= Constants.HONOURS) return false;
    if(t2 >= Constants.HONOURS) return false;
    if(t3 >= Constants.HONOURS) return false;
    if(t1 !== t2-1) return false;
    if(t2 !== t3-1) return false;
    var s1 = this.getTileSuit(t1);
    var s2 = this.getTileSuit(t2);
    if(s1 != s2) return false;
    var s3 = this.getTileSuit(t3);
    if(s1 != s3) return false;
    return true;
  },
  getClaimType: function(tileType) {
    if(tileType === Constants.CONNECTED)    return Constants.CHOW;
    else if(tileType === Constants.GAPPED) return Constants.CHOW;
    else if(tileType === Constants.PAIR)   return Constants.PUNG;
    else if(tileType === Constants.PUNG)   return Constants.KONG;
    return Constants.NOTHING;
  },
  getTileType: function(tileNumber, tileList) {
    // part of a pair?
    if(tileList.indexOf(tileNumber) !== -1) {
      // we know we can use it for a pair, but can we use it for a pung?
      tileList.splice(tileList.indexOf(tileNumber), 1);
      if(tileList.indexOf(tileNumber) !== -1) {
        // we know we can use it for a pung, but can we use it for a kong?
        tileList.splice(tileList.indexOf(tileNumber), 1);
        if(tileList.indexOf(tileNumber) !== -1) {
          return Constants.KONG;
        }
        // we can't use it for a kong, so: pung it is.
        return Constants.PUNG;
      }
      // we can't use it for a pung, so: pair it is.
      return Constants.PAIR;
    }

    // We can't chow honours. This might "break" for rule sets, but for now we don't care about those.
    if (tileNumber >= Constants.HONOURS) { Constants.SINGLE; }

    // if we get here, we might be able to form a chow from a connected pair or gapped chow
    var bestType = Constants.SINGLE;

    // part of a connected pair or gapped chow?
    var prev2 = tileNumber-2;
    var prev1 = tileNumber-1;
    var next1 = tileNumber+1;
    var next2 = tileNumber+2;

    var suit = this.getTileSuit(tileNumber);
    var p2 = (this.getTileSuit(prev2) === suit && tileList.indexOf(prev2) !== -1);
    var p1 = (this.getTileSuit(prev1) === suit && tileList.indexOf(prev1) !== -1);
    var n1 = (this.getTileSuit(next1) === suit && tileList.indexOf(next1) !== -1);
    var n2 = (this.getTileSuit(next2) === suit && tileList.indexOf(next2) !== -1);

    // this tile at the end?
    if((p1||p2) && this.isLegalChow(prev2, prev1, tileNumber)) {
      //console.log("prev", prev2, p2, prev1, p1, "[", tileNumber, "]", true);
      if(p1 && p2) { bestType = Math.max(bestType, Constants.CHOW); }
      else if(p1 && !p2) { bestType = Math.max(bestType, Constants.CONNECTED); }
      else { bestType = Math.max(bestType, Constants.GAPPED); }
    }

    // this tile in the middle?
    if((p1||n1) && this.isLegalChow(prev1, tileNumber, next1)) {
      //console.log("mid", prev1, p1, "[", tileNumber, "]", true, next1, n1);
      if(!p1 || !n1) { bestType = Math.max(bestType, Constants.CONNECTED); }
      else { bestType = Math.max(bestType, Constants.CHOW); }
    }

    // this tile at the start?
    if((n1||n2) && this.isLegalChow(tileNumber, next1, next2)) {
      //console.log("next", "[", tileNumber, "]", true, next1, n1, next2, n2);
      if(n1 && n2) { bestType = Math.max(bestType, Constants.CHOW); }
      else if(n1 && !n2) { bestType = Math.max(bestType, Constants.CONNECTED); }
      else { bestType = Math.max(bestType, Constants.GAPPED); }
    }

    // definitely singleton
    return bestType;
  },
  // FIXME: this function is broken - it does not take into account
  //        that values can change when certain tiles are treated
  //        as locked. This function should move tiles from
  //        concealed to locked, instead, and re-evaluate the tile
  //        values based on this more rigid hand.
  isWinningPattern: function(concealed, values, open) {
    var setCount = 4 - open.size();
    var pairCount = 1;
    var i, v;
    for(i=0; i<concealed.length; i++) {
      v = values[i];
      if(v === Constants.CONNECTED || v === Constants.GAPPED) {
        return false;
      }
      if(v === Constants.PUNG || v === Constants.CHOW) {
        if(values[i+1]!==v ||values[i+2]!==v) { return false; }
        setCount--;
        if(setCount<0) { return false; }
        i+=2;
      }
      if(v === Constants.PAIR) {
        if(values[i+1]!==v) { return false; }
        pairCount--;
        if(pairCount<0) { return false; }
        i+=1;
      }
    }
    console.log("win result: "+setCount+"/"+pairCount);

    if(setCount===0 && pairCount===0) {
      console.log("win result: "+setCount+"/"+pairCount);
    }
    return (setCount+pairCount===0);
  }
};
