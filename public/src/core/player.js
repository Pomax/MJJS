/**
 * The Player object represents, unsurprisingly players.
 * Players have a name, and sit at a specific wind direction.
 * They also have "a hand", which is the object that deals with
 * tile management during play.
 */

var Player = function(name, computer) {
  this.name = name;
  this.hand = new Hand();
  this.computer = !!computer;
};

Player.prototype = {
  name: "",
  hand: false,
  wind: false,
  // set this player's wind direction
  setWind: function(wind) { this.wind = wind; },
  // inspect a tile in the player's hand
  get: function(pos) { return this.hand.concealed.tiles[pos]; },
  // draw from the wall
  draw: function(wall, supplement) {
    var tile = (supplement ? wall.drawSupplement() : wall.draw());
    if(tile === Constants.NOTILE) return Constants.NOTILE;

    while(Tiles.isBonus(tile)) {
      this.hand.addBonus(tile);
      tile = (supplement ? wall.drawSupplement() : wall.draw());
      if(tile === Constants.NOTILE) return Constants.NOTILE;
    }

    this.hand.add(tile);

    // FIXME: if this tile draws us a kong, immediately play it
    //        This is not good play policy, but it helps prevent
    //        a "locked" hand for computer players for the moment.
    while(this.hand.hasKong(tile)) {
      this.play(tile, Constants.KONG);
      tile = wall.drawSupplement();
      this.hand.add(tile);
    }

    // TODO: if we have a pung of this tile on the table, we need
    //       to decide whether or not to append that pung to form
    //       a kong, or keep it in hand for a chow.

    this.determineStrategy();
    return tile;
  },
  // add a tile (claimed, for instance)
  claim: function(tile, bid) {
    this.hand.add(tile);
    this.play(tile, Tiles.getClaimType(bid), bid);
    this.determineStrategy();
  },
  // discard a specific tile (action intiated by user) or pick one (tile==undef, automated discard)
  discard: function(sendDiscard) {
    var player = this,
        hand = this.hand;

    // autoplay
    if(this.computer) {
      tile = hand.pickDiscard(this.computer);
      if(this.computer && (tile === Constants.NOTILE || tile === Constants.WIN)) {
        return setTimeout(function() { sendDiscard(player, tile); }, 1);
      }
      this.determineStrategy();
      return setTimeout(function() { sendDiscard(player, tile); }, 1);
    }

    // human player
    var dialog = document.createElement("div");
    document.getElementById("playerClaim").appendChild(dialog);

    var reset = function() {
      dialog.parentNode.removeChild(dialog);
      hand.concealed.tiles.forEach(function(tile) {
        tile.onclick = tile.oldclick;
      });
    };

    hand.concealed.tiles.forEach(function(tile) {
      tile.oldclick = tile.onclick;
      tile.onclick = function() {
        reset();
        // send this tile as discard to the game loop
        setTimeout(function() {
          hand.concealed.remove(tile);
          sendDiscard(player, tile);
        }, 1);
        return false;
      };
    });

    // TODO: add kong-claim button

    dialog.setAttribute("class", "discard dialog");
    var button = document.createElement("button");
    button.innerHTML = "Win";
    button.onclick = function() {
      reset();
      setTimeout(function() {
        hand.concealed.remove(tile);
        sendDiscard(player, Constants.NOTHING);
      }, 1);
    };
    dialog.appendChild(button);
  },
  // play a set of tiles, moving them from concealed to the open tile bank
  play: function(tile, setType, origin) { return this.hand.play(tile, setType, origin); },
  // reveal the player's hand
  reveal: function() { this.hand.reveal(); },
  // sort the player's hand
  sort: function() { this.hand.sort(); },
  // determine the play strategy
  determineStrategy: function(wall) { return this.hand.determineStrategy(wall); },
  // are we looking for this tile?
  lookingFor: function(tile) { return this.hand.lookingFor(tile); },
  // bid on a tile
  bid: function(tile, sendBid, bidInterval) {
    if(this.computer) {
      sendBid(this, this.lookingFor(tile));
    } else {
      var player = this;
      // generate a dialog for the user to click through
      // FIXME: the code path that gets this bid actually treats
      //        the bid as a "I have this" rather than "I need the
      //        tile for .." indicator.
      var dialog = document.createElement("div");
      dialog.setAttribute("class", "bid dialog");
      var options = [Constants.NOTHING, Constants.PAIR, Constants.CHOW, Constants.PUNG, Constants.KONG];
      options.forEach(function(claim) {
        var button = document.createElement("button");
        button.innerHTML = Constants.setNames[claim];
        button.onclick = function() {
          dialog.parentNode.removeChild(dialog);
          sendBid(player, {
            inhand: Tiles.getClaimReason(claim),
            claimType: claim
          });
        };
        dialog.appendChild(button);
      });
      document.getElementById("playerClaim").appendChild(dialog);
      if(bidInterval) {
        setTimeout(function() {
          if(dialog.parentNode) {
            dialog.parentNode.removeChild(dialog);
            sendBid(player, {
              inhand: Constants.NOTHING,
              claimType: Constants.NOTHING
            });
          }
        }, bidInterval);
      }
    }
  },
  // highlight player as "current player" (HTML)
  highlight: function() { if(this.el) { this.el.classList.add("highlight"); }},
  // unhighlight player as no longer being "current player" (HTML)
  unhighlight: function() { if(this.el) { this.el.classList.remove("highlight"); }},
  // this playeras HTML element
  asHTMLElement: function() {
    if(!this.el) {
      var div = document.createElement("div");
      div.setAttribute("class", "player");
      div.setAttribute("data-name", this.name);
      div.appendChild(this.hand.asHTMLElement());
      this.el = div; }
    return this.el;
  }
};

Player.prototype.constructor = Player;
