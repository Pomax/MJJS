var setupGame = function setupGame() {
  // clear "board"
  document.body.setAttribute("class",'');
  document.getElementById("wall").innerHTML = "";
  document.getElementById("discards").innerHTML = "";
  document.getElementById("players").innerHTML = "";

  // set up "board"
  var wall = new Wall();
  var players = [];

  // set up the game run function
  (function runGame() {
    document.getElementById("wall").appendChild(wall.asHTMLElement());

    setTimeout(function() {
      var wheight = document.getElementById("wall").clientHeight;
      document.getElementById("wall").style.height = wheight + "px";
      var discards = document.getElementById("discards");
      discards.style.height = wheight + "px";
    }, 200);

    var playerNames = ["Pomax", "Defense Cat", "Yellow Dragon", "Tonbot5000"], pos;

    (function setupHand(playerNames) {
      playerNames.forEach(function(playerName) {
        pos = players.length;
        players.push(new Player(playerName));
        document.getElementById("players").appendChild(players[pos].asHTMLElement());
      });

      // draw tiles for each player
      for(var i=0; i < Constants.HANDSIZE - 1; i++) {
        players[0].draw(wall);
        players[1].draw(wall);
        players[2].draw(wall);
        players[3].draw(wall);
      }

      // show what each player has in their hand
      for(var i=0; i<4; i++) {
        players[i].reveal();
        players[i].sort();
      }
    }(playerNames));

    // set up the game loop function
    window.gameLoop = (function(players, wall, discardsDiv) {
      var idx = 3, i=0, tile;
      turnHistory = newHistory();

      // closure wrapped
      return function() {
        players[idx].unhighlight();
        idx = (idx+1)%4;

        var player = players[idx];
        player.highlight();
        var drawnTile = player.draw(wall);

        if (drawnTile === Constants.NOTILE) {
          console.log("Game was drawn.");
          return Constants.DRAWN;
        }

        drawnTile.reveal();
        console.log(player.name + " drew [" + Tiles.getTileName(drawnTile)+ "] from the wall");
        var discardTile = player.discard();
        console.log(player.name + " discards "+discardTile.tileNumber+" [" + Tiles.getTileName(discardTile) + "]");
        console.log(player.name + " now holds ["+player.hand.concealed.toTileNumbers()+" + " + player.hand.open.toTileNumbers() + "]");
        player.sort();

        if(discardTile === Constants.WIN || discardTile === Constants.NOTHING) {
          turnHistory.addStep(player, drawnTile, Constants.NOTHING, Constants.WIN);
          return Constants.WON;
        }

        turnHistory.addStep(player, drawnTile, discardTile);

        // does anyone want this?
        var result = (function checkClaim() {
          var bestBid = -1, bid, bidx, bestBidder, bidder;
          while (bestBid != 0) {
            bestBid = 0;
            bestBidder = -1;
            for(i=1; i<4; i++) {
              bidx = (idx+i)%4;
              bidder = players[bidx];
              bid = bidder.lookingFor(discardTile);
              // better than current bid?
              if(bid > bestBid) {
                if(i>1 && bid<Constants.PUNG) continue;
                console.log(bidder.name + " wants this tile (bid: "+bid+", to form a "+Constants.setNames[Tiles.getClaimType(bid)]+").");
                console.log(bidder.name + " currently holds " + bidder.hand.concealed.toTileNumbers()+", requires " + bidder.hand.strategy.required);
                bestBid = bid;
                bestBidder = bidx;
              }
            }

            // if there is a valid bid, honour the claim
            if (bestBid > 0) {
              drawnTile = discardTile;
              console.log("claim bid accepted.");
              player.unhighlight();
              idx = bestBidder;
              player = players[idx];
              player.highlight();
              player.claim(drawnTile, bestBid);

              // if this was for a kong, the player gets a supplement tile
              if(bestBid === Constants.PUNG) {
                console.log(player.name+" played a kong. Issuing supplement tile.");
                player.draw(wall, true);
              }
              discardTile = player.discard();
              if(discardTile === Constants.WIN || discardTile === Constants.NOTHING) {
                turnHistory.addStep(player, drawnTile, Constants.NOTHING, Constants.WIN);
                return Constants.WON;
              }
              player.sort();
              turnHistory.addStep(player, drawnTile, discardTile, bestBid);
              console.log(player.name + " discards [" + Tiles.getTileName(discardTile) + "] after claiming [" + Tiles.getTileName(drawnTile) + "]");
            }
          }

          console.log("no one wants it.");
          discardsDiv.appendChild(discardTile);
        }());

        if(result === Constants.WON) {
          console.log(player.name + " won off a discard.");
          return result;
        }

        // successful tile
        return Constants.CONTINUE;
      }
    }(players, wall, discards));
  }());  // end of runGame()

  window.interrupt = false;

  // call this!
  window.autoplay = function() {
    if(interrupt) return;
    if(!wall.isDead()) {
      var result = gameLoop();
      if (result === Constants.WON) {
        document.body.setAttribute("class","won");
        throw "won";
      }
      if (result === Constants.DRAWN) {
        document.body.setAttribute("class","drawn");
        setupGame();
      }
      setTimeout(autoplay, 5);
    }
  };

};  // end of setupGame

setupGame();
