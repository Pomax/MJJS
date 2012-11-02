/**

  This set of objects is responsible for determining A.I. player strategy
  
  We start off by asking "given the following concealed tiles, and
  declared, open sets in our hand, which tiles do we need to form
  a winning pattern, and which tiles should we get rid of in favour
  of the tiles needed for that winning pattern?"
  
  This yields a set of possible answers, each of which is in the
  form "in order to get winning set X, you will need to discard
  all tiles from the list Y, and you require tiles from the list Z"

**/

var FSA = {
  // generate the set of (reasonably) possible hands
  generate: function(concealedTiles, declaredSets) {
    var copied = concealedTiles.slice(0);
    copied.sort(Constants.sortFunction);
    return this.expand(copied, declaredSets);
  },
  
  // Generate all possible answers using the provided information.
  // The 
  expand: function(permutable, locked) {
    var discard = [];

    // First, we weed all tiles that do not already
    // form a (connected) pair, or gapped chow, since
    // these tiles are essentially irrelevant.
    var t = permutable.length, tileNumber,
        copied = [], tileTypes = [];
    while(t-->0) {
      tileNumber = permutable[t];
      copied = permutable.slice(0);
      copied.splice(t,1);
      tileTypes[t] = Tiles.getTileType(tileNumber, copied); }
    
    // filter
    t = permutable.length;
    while(t-->0) {
      if(tileTypes[t]===Constants.SINGLE) {
        discard.push(permutable.splice(t,1)[0]); 
        tileTypes.splice(t,1); }}

    // With the remaining good tiles, and a knowledge of which
    // patterns they can be used in, determine which tiles we
    // still need to complete a partial good hand.
    //
    // How that hand is then actually finished is entirely up
    // to the A.I. "speed vs. score vs. not losing" algorithm.

    var partials = {required: [], role: []}, partial;
    var last = permutable.length;
    for(t=0; t<last; t++) {
      partial = this.fulfill(t, permutable, tileTypes);
      if(partial.required.length>0) {
        partials.required = partials.required.concat(partial.required);
        partials.role = partials.role.concat(partial.role);
      }
    }
    
    // TODO: rank discards, and append every free tile
    //       to the list based on its value, so that we
    //       never have an empty discard list.
    var match = 1;
    while(tileTypes.length>0) {
      t = tileTypes.length;
      while(t-->0) {
        if(tileTypes[t]===match) {
          discard.push(permutable[t]);
          permutable.splice(t,1);
          tileTypes.splice(t); }}
      match *= 2;
    }

    return {discard: discard, required: partials.required, role: partials.role};
  },
  // what is necessary to make this bit a full set?
  fulfill: function(idx, permutable, tileTypes) {
    var required = [], role = [];

    var permutable = permutable.slice(0);
    var tileNumber = permutable.splice(idx, 1)[0];
    var tileSuit = Tiles.getTileSuit(tileNumber);
    var tileTypes = tileTypes.slice(0);
    var tileType = tileTypes.splice(idx, 1)[0];
    
    var record = function(tileNumber, tileType) {
      required.push(tileNumber);
      role.push(tileType); }

    //console.log(tileNumber + "("+ tileType +")", permutable);   

    if (tileType === Constants.PAIR) {
      //console.log(tileNumber+": pair - requires "+tileNumber+" to form a pung");
      record(tileNumber, tileType);
    }
    else if (tileType === Constants.PUNG) {
      //console.log(tileNumber+": pair - requires "+tileNumber+" to form a kong");
      record(tileNumber, tileType);
    }
    else if (tileType === Constants.CONNECTED) {
      var req;
      var prev = tileNumber - 1;
      var psuit = Tiles.getTileSuit(prev);
      if(permutable.indexOf(prev)!==-1 && psuit === tileSuit) {
        req = tileNumber - 2;
        //console.log(tileNumber+": connected pair - requires "+req+" to form a chow");
        record(req, tileType);
      }

      var next = tileNumber + 1;
      var nsuit = Tiles.getTileSuit(next);
      if(permutable.indexOf(next)!==-1 && nsuit === tileSuit) {
        req = tileNumber + 2;
        //console.log(tileNumber+": connected pair - requires "+req+" to form a chow");
        record(req, tileType);
      }
    }
    else if (tileType === Constants.GAPPED) {
      // which side?
      var prev = tileNumber - 2;
      var psuit = Tiles.getTileSuit(prev);
      if(permutable.indexOf(prev)!==-1 && psuit === tileSuit) {
        req = tileNumber - 1;
        //console.log(tileNumber+": gapped chow - requires "+req+" to fill the gap");
        record(req, tileType);
      }

      var next = tileNumber + 2;
      var nsuit = Tiles.getTileSuit(next);
      if(permutable.indexOf(next)!==-1 && nsuit === tileSuit) {
        req = tileNumber + 1;
        //console.log(tileNumber+": gapped chow - requires "+req+" to fill the gap");
        record(req, tileType);
      }
    }
    else {
      //console.log("already a set"); 
    }

    return {required: required, role: role};
  },
  
  // generate all hands that can (reasonably) be formed by committing
  // to locked + (single + what is needed to complete as set).
  expandSingle: function(hands, baseTile, permutable, locked, required) {
    // when starting from a single tile, there are three options:
    // (1) pair, (2) pung, and (3) chow.
    // Kongs are a bonus, and not really something you actively go
    // for, so we do not take them into special consideration.
    // Chows can only be reached via a connected pair, which is
    // not a legal set itself.

    this.expandSingleToSet(hands, baseTile, permutable.slice(0), locked.slice(0), required.slice(0));
    this.expandSingleToChow(hands, baseTile, permutable.slice(0), locked.slice(0), required.slice(0));
  },

  // turn the base tile into a pair or pung if the hand is not at (HANDSIZE-2) tiles yet
  expandSingleToSet: function(hands, baseTile, permutable, locked, required) {
    // do we require the second tile, or do we already have it in hand?
    var paired = permutable.indexOf(baseTile);
    if(paired !== -1) { permutable.splice(paired, 1); }
    else { required.push(baseTile); }
    // lock in the pair
    locked = locked.concat([baseTile,baseTile]);
    
    // if we only require a pair to form a winning hand, we are now done.
    if(locked.length === Constants.HANDSIZE) {
      locked.sort(Constants.sortFunction);
      required.sort(Constants.sortFunction);
      this.addHand(hands, locked, required);
    }
    // otherwise, we need to expand to a pung, first
    else if(locked.length < Constants.HANDSIZE){
      // do we require the third tile, or do we already have it in hand?
      var paired = permutable.indexOf(baseTile);
      if(paired !== -1) { permutable.splice(paired, 1); }
      else { required.push(baseTile); }
      // lock in the pung (we already had the pair, so we just add the tile once more)
      locked.push(baseTile);
      this.expand(hands, permutable.slice(0), locked.slice(0), required.slice(0));
    }
  },
  
  // turn the base tile into any of three possible chows
  expandSingleToChow: function(hands, baseTile, permutable, locked, required) {
    if(locked.length + 3 > Constants.HANDSIZE) return;
    var prev2 = baseTile-2, prev1 = baseTile-1, next1 = baseTile+1, next2 = baseTile+2;
    
    if (Tiles.isLegalChow(prev2, prev1, baseTile)) {
      // do we require the second and third tile, or do we already have them in hand?
      [prev2, prev1].forEach(function(tile){
        var inhand = permutable.indexOf(tile);
        if(inhand !== -1) { permutable.splice(inhand, 1); }
        else { required.push(tile); }
      });
      var appended = locked.slice(0).concat([prev2, prev1, baseTile]);
      this.expand(hands, permutable.slice(0), appended, required.slice(0));
    }

    if (Tiles.isLegalChow(prev1, baseTile, next1)) {
      [prev1, next1].forEach(function(tile){
        var inhand = permutable.indexOf(tile);
        if(inhand !== -1) { permutable.splice(inhand, 1); }
        else { required.push(tile); }
      });
      var appended = locked.slice(0).concat([prev1, baseTile, next1]);
      this.expand(hands, permutable.slice(0), appended, required.slice(0));
    }

    if (Tiles.isLegalChow(baseTile, next1, next2)) {
      [next1, next2].forEach(function(tile){
        var inhand = permutable.indexOf(tile);
        if(inhand !== -1) { permutable.splice(inhand, 1); }
        else { required.push(tile); }
      });
      var appended = locked.slice(0).concat([baseTile, next1, next2]);
      this.expand(hands, permutable.slice(0), appended, required.slice(0));
    }
  },
  
  count: 0,
  
  equal: function(ar1, ar2) {
    var len = ar1.length
    if(len-- != ar2.length) return false;
    for(var i=len; i>=0; i--) {
      if(ar1[i]!==ar2[i]) return false;
    }
    return true;
  },

  addHand: function(hands, target, required) {
    if (required.length>5) return;

    var hand, _target, i;
    for(i=hands.length-1; i>=0; i--) {
      hand = hands[i];
      _target = hand.target;
      // duplicate?
      if(this.equal(target, _target)) break;
    }

    this.count++;
    if(i<0) { hands.push({target: target, required: required}); }
    if(this.count++ > 100000) throw "unreasonably sized hypothesis space ("+hands.length+")";
  }
}

var Statistics = {
  // this estimates the likelihood of getting the least-likely required tile
  getShortTermLikelihood: function(requiredTiles, wall, concealedTiles, declaredSets) {
    return 0;
  }
}

var Strategies = {
  pick: function(wall, concealedTiles, declaredSets) {
    // generate the set of (reasonably) possible hands we can play for
    var concealedTiles = concealedTiles.toTileNumbers();
    var declaredSets = declaredSets.toTileNumbers();
    var strategy = FSA.generate(concealedTiles, declaredSets); // {required, discard}

/*
    // how likely are we to get the tiles required for this hand?
    allHands.forEach(function(hand) {
      hand.likelihood = Statistics.getShortTermLikelihood(hand.requiredTiles, wall, concealedTiles, declaredSets);
    });

    // rank hands in descending order or likelihood
    allHands.sort(function(a,b) {
      a = a.likelihood;
      b = b.likelihood;
      return - Constants.sortFunction(a,b);
    });

    // return the best hand's strategy
    return allHands[0].strategy;
*/
    return strategy;
  }
};
