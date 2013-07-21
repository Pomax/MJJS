window.location.getQueryValue = function(key) {
  var str = window.location.toString();
  var re = new RegExp(key + "=\\w+");
  var match = str.match(re);
  if(!match) return ""
  return match[0].replace(key+"=",'');
}

document.addEventListener("DOMContentLoaded", function() {
  // game variables
  var turnHistory,
      wall,
      players,
      idx = 3,
      tile,
      player,
      drawnTile,
      interrupt = false,
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
      }
      gameState = states.STALE,
      turnInterval =  window.location.getQueryValue("turnInterval") || 1,
      claims = {
        best: Constants.NOTHING
      };



  /**
   * someone has won the hand.
   */
  var processWin = function(player) {
    console.log(player.name + " has won this hand.");
    gameState = states.WON;
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
    if(gameState===states.SETUP) return;
    turnHistory = newHistory(document.getElementById("log"));
    wall = new Wall();
    players = [];
    options = options || {
      players: [
        { name: "Pomax", computer: false },
        { name: "Defense Cat", computer: true },
        { name: "Yellow Dragon", computer: true },
        { name: "Tonbot5000", computer: true }
      ]
    };

    // clear "board"
    document.body.setAttribute("class",'');
    document.getElementById("discards").innerHTML = "";
    document.getElementById("players").innerHTML = "";
    document.getElementById("wall").innerHTML = "";
    document.getElementById("wall").appendChild(wall.asHTMLElement());

    // match heights
    setTimeout(function() {
      var wheight = document.getElementById("wall").clientHeight;
      document.getElementById("wall").style.height = wheight + "px";
      var discards = document.getElementById("discards");
      discards.style.height = wheight + "px";
    }, 200);

    /**
     * setup the hands
     */
    options.players.forEach(function(p) {
      var player = new Player(p.name, p.computer);
      players.push(player);
      document.getElementById("players").appendChild(player.asHTMLElement());
    });

    for(var i=0; i < players.length; i++) {
      players[i].next = players[(i+1)%4];
      players[i].previous = players[(i+3)%4];
    }

    // draw tiles for each player
    for(var i=0; i < Constants.HANDSIZE - 1; i++) {
      players.forEach(function(player) {
        player.draw(wall);
      });
    }

    // record our starting position
    turnHistory.setInitial(players);

    // show what each player has in their hand
    players.forEach(function(player) {
      player.sort();
      player.reveal();
    });

    gameState = states.SETUP;
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
    }
  };

  /**
   * Discard claim bid aggregator
   */
  var getBid = function(player, bid) {
    if(bid > claims.best) {
      console.log(player.name + " wants this tile (bid: "+bid+", to form a "+Constants.setNames[Tiles.getClaimType(bid)]+").");
      console.log(player.name + " currently holds " + player.hand.concealed.toTileNumbers()+", requires " + player.hand.strategy.required);
      claims.best = bid;
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
  var checkClaim = function(player, discard) {
    gameState = states.CHECKCLAIM;
    startClaimListening(player, discard);
    players.forEach(function(otherplayer){
      if(otherplayer===player) return;
      otherplayer.bid(discard, getBid);
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
    if(bestBid===Constants.NOTHING || (bestBid===Constants.CHOW && claims.bestBidder!==claims.discardingPlayer.next)) {
      document.getElementById("discards").appendChild(drawnTile);
      nextTurn(claims.discardingPlayer);
      return;
    }

    claims.discardingPlayer.unhighlight();
    player = claims.bestBidder;
    player.highlight();
    player.claim(drawnTile, claims.best);

    // if this was for a kong, the player gets a supplement tile
    if(bestBid === Constants.PUNG) {
      console.log(player.name+" played a kong. Issuing supplement tile.");
      player.draw(wall, true);
    }

    // after claiming the tile, the claiming player has either
    // won, or they need to discard a tile themselves.
    var discardTile = player.discard();
    if(discardTile === Constants.WIN || discardTile === Constants.NOTHING) {
      turnHistory.addStep(player, drawnTile, Constants.NOTHING, Constants.WIN);
      return processWin(player);
    }

    player.sort();
    turnHistory.addStep(player, drawnTile, discardTile, bestBid);
    console.log(player.name + " discards [" + Tiles.getTileName(discardTile) + "] after claiming [" + Tiles.getTileName(drawnTile) + "]");
    checkClaim(player, discardTile);
  };

  /**
   * Play a next turn.
   */
  var nextTurn = function(player) {
    setTimeout(function() {
      playTurn(player.next)
    }, turnInterval);
  }


  /**
   * set up the game loop function
   */
  var playTurn = function(player) {
    if(interrupt) {
      gameState = states.INTERRUPTED;
      interrupt = false;
      return;
    }

    gameState = states.TURN;

    player = player || players[0];
    player.previous.unhighlight();
    player.highlight();
    drawnTile = player.draw(wall);

    // end of wall/is the game a draw?
    if (drawnTile === Constants.NOTILE) {
      return processDraw();
    }

    // show the drawn tile, and play
    drawnTile.reveal();
    console.log(player.name + " drew [" + Tiles.getTileName(drawnTile)+ "] from the wall");

    var discardTile = player.discard();
    console.log(player.name + " discards "+discardTile.tileNumber+" [" + Tiles.getTileName(discardTile) + "]");
    console.log(player.name + " now holds ["+player.hand.concealed.toTileNumbers()+" + " + player.hand.open.toTileNumbers() + "]");
    player.sort();

    // did this player just win?
    if(discardTile === Constants.WIN || discardTile === Constants.NOTHING) {
      turnHistory.addStep(player, drawnTile, Constants.NOTHING, Constants.WIN);
      return processWin(player);
    }

    // they did not. continue the turn
    turnHistory.addStep(player, drawnTile, discardTile, Constants.NOTHING);

    // check whether any of the other players want this tile
    var result = checkClaim(player, discardTile);
  }

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
    interrupt = true;
  };

  document.querySelector(".log.button").onclick = function() {
    var el = document.getElementById("history");
    if(el.style.display === "block") { el.style.display = "none"; }
    else { el.style.display = "block"; }
  };

  // initial setup
  setupGame();
}());
