window.location.query = function(key, defaultValue) {
  var str = window.location.toString();
  var re = new RegExp(key + "=\\w+");
  var match = str.match(re);
  if(!match) return defaultValue;
  return match[0].replace(key+"=",'');
};

var initialise = function() {
  document.removeEventListener("DOMContentLoaded", initialise, false);

  // game variables
  var turnHistory,
      wall,
      players,
      idx = 3,
      tile,
      player,
      drawnTile,
      states = {
        SETUP: 0,
        STALE: 1,
        WON: 2,
        DRAWN: 3,
        PLAY: 4,
        CHECKCLAIM: 5,
        CLAIMED: 6,
        TURN: 7,
        INTERRUPTED: 8,
        CLAIMPROCESS: 9
      },
      gameState = states.STALE,
      claims = {
        best: Constants.NOTHING
      };

  // these are effectively constants, but they can be overruled through the URL
  var turnInterval = Constants.turnInterval = window.location.query("turnInterval", 1),
      bidInterval  = Constants.bidInterval  = window.location.query("bidInterval", false),
      openPlay     = Constants.openPlay     = window.location.query("openPlay", false),
      autoPlay     = Constants.autoPlay     = window.location.query("autoPlay", false);

  /**
   * someone has won the hand.
   */
  var processWin = function(player) {
    console.log(player.name + " has won this hand.");
    gameState = states.WON;
    players.forEach(function(player) {
      player.reveal();
    });
    return Constants.WON;
  };


  /**
   * no one has won the hand.
   */
  var processDraw = function() {
    console.log("the hand was a draw.");
    gameState = states.DRAWN;
    return Constants.NOTILE;
  };

  /**
   * Initial game setup
   */
  var setupGame = function(options) {
    // yeah, we have loops...
    var i;

    // seriously. Do this:
    console.clear();
    document.getElementById("log").innerHTML = "";

    if(gameState === states.SETUP) {
      return;
    }

    turnHistory = newHistory(document.getElementById("log"));
    wall = new Wall();
    players = [];
    options = options || {
      players: [
        { name: "Pomax", computer: autoPlay },
        { name: "Defense Cat", computer: true },
        { name: "Yellow Dragon", computer: true },
        { name: "Tonbot5000", computer: true }
      ]
    };

    // clear "board"
    document.body.setAttribute("class",'');
    document.getElementById("players").innerHTML = "";
    document.getElementById("wall").innerHTML = "";
    document.getElementById("wall").appendChild(wall.asHTMLElement());

    // match heights
    setTimeout(function() {
      var wheight = document.querySelector("#wall .wall").clientHeight;
      document.querySelector("#wall .wall").style.height = wheight + "px";
      var discards = document.querySelector("#wall .discards");
      discards.style.height = wheight + "px";
    }, 200);

    /**
     * setup the hands
     */
    options.players.forEach(function(p) {
      var player = new Player(p.name, p.computer, wall, players);
      players.push(player);
      document.getElementById("players").appendChild(player.asHTMLElement());
    });

    for(i=0; i < players.length; i++) {
      players[i].next = players[(i+1)%4];
      players[i].previous = players[(i+3)%4];
    }

    // draw tiles for each player
    var drawTile = function(player) { player.draw(wall); };
    for(i=0; i < Constants.HANDSIZE - 1; i++) {
      players.forEach(drawTile);
    }

    // record our starting position
    turnHistory.setInitial(players);

    // show what each player has in their hand
    players.forEach(function(player) {
      player.sort();
      player.endOfTurn();
      if(openPlay || player === players[0]) {
        player.reveal();
      }
    });

    gameState = states.SETUP;
  };

  // get the current player's discard.
  var getDiscard = function(player, discardTile) {
    if(discardTile === Constants.WIN || discardTile === Constants.NOTHING) {
      turnHistory.addStep(player, drawnTile, Constants.NOTHING, Constants.WIN);
      return processWin(player);
    }
    turnHistory.addStep(player, drawnTile, discardTile);
    console.log(player.name + " discards [" + Tiles.getTileName(discardTile) + "] after claiming [" + Tiles.getTileName(drawnTile) + "]");
    checkClaims(player, discardTile);
  };


  /**
   *
   */
  var startClaimListening = function(player, discard) {
    claims = {
      count: 0,
      tile: discard,
      discardingPlayer: player,
      best: Constants.NOTHING,
      bestBidder: false
    };
  };

  /**
   * Discard claim bid aggregator
   */
  var getBid = function(player, response) {
    var bid = response.inhand,
        win = (response.claim === Constants.WIN);
    if(win || bid > claims.best) {
      console.log(player.name + " wants this tile (bid: "+bid+", to form a "+Constants.setNames[Tiles.getClaimType(bid)]+").");
      console.log(player.name + " currently holds " + player.hand.concealed.toTileNumbers()+", requires " + player.hand.strategy.required);
      claims.best = (win ? Constants.WIN : bid);
      claims.bestBidder = player;
    }
    if(++claims.count === players.length-1) {
      setTimeout(processBids, 1);
    }
  };

  /**
   * This function checks whether a discard is wanted by
   * any of the players, using a bidding system.
   */
  var checkClaims = function(player, discard) {
    wall.addDiscard(discard);
    document.getElementById("discard").appendChild(discard);
    gameState = states.CHECKCLAIM;
    startClaimListening(player, discard);
    players.forEach(function(otherplayer){
      if(otherplayer===player) return;
      otherplayer.bid(discard, getBid, bidInterval);
    });
  };

  /**
   *
   */
  var processBids = function() {
    gameState = states.CLAIMPROCESS;
    var bestBid = claims.best,
        drawnTile = claims.tile;

    // no bids, or the best claim is a chow by someone who can't get that chow: normal discard.
    if(bestBid !== Constants.WIN) {
      var chowCall =(bestBid===Constants.GAPPED || bestBid===Constants.CONNECTED),
          illegalChow = chowCall && (claims.bestBidder !== claims.discardingPlayer.next);
      if(bestBid===Constants.NOTHING || illegalChow) {
        wall.addDiscard(drawnTile);
        nextTurn(claims.discardingPlayer);
        return;
      }
    }

    claims.discardingPlayer.endOfTurn();
    player = claims.bestBidder;
    player.highlight();
    document.getElementById("discard").innerHTML = "";
    player.claim(drawnTile, claims.best);

    // if this was for a kong, the player gets a supplement tile
    if(bestBid === Constants.PUNG) {
      console.log(player.name+" played a kong. Issuing supplement tile.");
      player.draw(wall, true);
    }

    // get the discard after this claim
    player.discard(getDiscard);
  };

  /**
   * Play a next turn.
   */
  var nextTurn = function(player) {
    setTimeout(function() {
      playTurn(player.next);
    }, turnInterval);
  };


  /**
   * set up the game loop function
   */
  var playTurn = function(player) {
    if(Constants.interrupt) {
      gameState = states.INTERRUPTED;
      Constants.interrupt = false;
      return;
    }

    gameState = states.TURN;

    player = player || players[0];
    player.previous.endOfTurn();
    player.highlight();
    drawnTile = player.draw(wall);

    // end of wall/is the game a draw?
    if (drawnTile === Constants.NOTILE) {
      return processDraw();
    }

    // show the drawn tile, and play
    if(openPlay || player===players[0]) {
      drawnTile.reveal();
    }
    console.log(player.name + " drew [" + Tiles.getTileName(drawnTile)+ "] from the wall");

    // async wait for the player's discard
    player.discard(getDiscard);
  };

  /**
   * finish a turn. this is called from the claim check
   * function, after all players have pitched in on
   * whether or not they want a tile.
   */
  var finishTurn = function(player) {
    if(result === Constants.WON) {
      console.log(player.name + " won off a discard.");
      return processWin(player);
    }

    // keep playing
    else { nextTurn(player); }
  };

  // button bindings
  document.querySelector(".reset.button").onclick = setupGame;

  document.querySelector(".play.button").onclick = function() {
    if(gameState!==states.INTERRUPTED) {
      setupGame();
    }
    playTurn();
  };

  document.querySelector(".interrupt.button").onclick = function(){
    Constants.interrupt = true;
  };

  document.querySelector(".log.button").onclick = function() {
    var el = document.getElementById("history");
    if(el.style.display === "block") { el.style.display = "none"; }
    else { el.style.display = "block"; }
  };

  // initial setup
  setupGame();
};

document.addEventListener("DOMContentLoaded", initialise, false);
