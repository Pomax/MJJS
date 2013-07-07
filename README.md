Writing a Mahjong A.I.
----------------------

The game of Mahjong is a four-player game of chance-based tactics.

There are 144 tiles, distributed as:

- "bamboo" suit, numbers 1 through 9,
- "characters", or "numbers" suit, numbers 1 through 9,
- "dots", or "circles" suit, numbers 1 through 9,
- "winds" east (東/E), south (南/S), west (西/W), north (北/N),
- "dragons" green (發/F), red (中/C), white (<blank>/P).

This is a total of 34 tiles, with four of each tile available, giving 136 playing tiles.
In addition to these tiles there are also eight "bonus" tiles

- "seasons" spring, summer, fall, winter,
- "flowers" plum, orchid, chrysanthemum, bamboo.

These tiles are not part of play patterns, but are used as additional points.

Players try to form a winning "hand" typically consisting of a combination of four "sets":

- "chow" or "seung": three consecutive numbered tiles of the same suit,
- "pair": two identical tiles,
- "pung" or "pong": three identical tiles,
- "kong": four identical tiles.

The generic game algorithm is relatively straight forward:

A game consists of 4 "rounds", cycling through each "wind direction",
with each round consisting of (at least) 4 "hands", again cycling through
each "wind direction".

The game starts at the round for "east", with each player assigned his
or her own "wind". The first player to start the game is player "east".

After every "hand" is played, the winds rotate so that either:

  i) the player representing "east" becomes "south", "south" becomes "west", etc.

or

  ii) the player representing "east" becomes "north", "south" becomes "east", etc.

(this depends on the rule set. The concept of rotation is universal, however).

When the player who started as "east" becomes "east" again, the "wind of the
round" is changed. The happens three times, giving the following minimal play
table:

        P1  P2  P3  P4  round
        --  --  --  --  -----
     1   E   S   W   N    E
     2   S   W   N   E    E
     3   W   N   E   S    E
     4   N   E   S   W    E

P1, who started as east, becomes east again, so the "round" wind advances:

     5   E   S   W   N    S
     6   S   W   N   E    S
     7   W   N   E   S    S
     8   N   E   S   W    S

And again:

     9   E   S   W   N    W
    10   S   W   N   E    W
    11   W   N   E   S    W
    12   N   E   S   W    W

And one final time:

    13   E   S   W   N    N
    14   S   W   N   E    N
    15   W   N   E   S    N
    16   N   E   S   W    N

The game is done when P1 would otherwise become east a fifth time.

Typically, there are additional rules which may lead to hands being "repeated"
either when the player who represents "east" wins, or when a hand is drawn.

Typically, all players receive additional points for using "wind of the round"
tiles, as well as for using "player wind" tiles.


The tiles are arranged face-down in a random permutation.
every player is issued 13 tiles from this set.
Any bonus tiles are taken out of the players tiles, revealed, and replaced with a new tile.

a game turn consists of a player:

  1) drawing a face-down tile
     - if the drawn tile is a bonus tile, it is taken out of the player's hand, revealed, and replaced with a new tile.
  2) evaluating whether their 13 tiles + the draw tile constitutes a winning pattern
    - if it does, the player declares a win.
    - if it does not, or if they player does not wish to declare a win, they must chose a tile to discard.
      this tile is "discarded" from the hand, and gets revealed to all players.

When a discard is made, an interrupt may occur in the form of any of the other players "claiming" the tile.
The rules for claiming are simple. A tile may be claimed if it can be used by a player to:

  a) form a chow, but ONLY by the player whose turn it would normally be if no one claimed the tile.
     - the tiles forming the chow must be revealed, and can no longer be used to form other patterns
  b) form a pung.
     - the tiles forming the pung must be revealed, and can no longer be used to form other patterns
  c) form a kong.
     - the tiles forming the kong must be revealed, and can no longer be used to form other patterns
     - as forming a kong takes away two tiles, for one tile claimed, the player is issued a supplement tile from the set of unplayed tiles.
  d) win, by forming a pair, chow, or pung.
     - the set that is formed with this tile must be revealed.

If a tile is claimed by a player, it becomes their turn, and the claim replaces the "draw" step of their turn.
If a tile is not claimed, the next player goes through their turn steps.
If multiple claims are made, who gets the tile depends on what they need it for. In ascending priority: win, kong/pung, chow.

Game turns are played until the set of unplayed tiles ("the wall") is depleted.

  (most rule sets consider a small set of tiles at the end of the wall
  "unplayable tiles", leading to there being no more tiles available to
  draw, even if there is still some wall left)

If the wall is depleted before someone has formed a winning hand, the hand is considered
"drawn". Depending on the rule set, either the hand is replayed (the winds do not rotate),
or the next hand is played (the winds do rotate).


Scoring
-------

There are many different rule sets that assign different values to different
tile combinations, but there are a few general rules that can be observed.
Sets may or may not score points, but if they do they are ranked as follows,
lowest ranking set first:

  - pair
  - chow/seung
  - pung/pong
  - kong

Additionally, sets of specific tiles may score more than others. If scores
are assigned based on the "tile face" for a set, the following
rankings are typically observed:

  numeral < terminal number (1 or 9) < wind < scoring wind (i.e. own wind or wind of the round) or dragon

Additional points may be rewarded for different stages of "clean"liness,
refering to whether tiles form different suits are mixed

  fully mixed < single suit + honours (winds or dragons) < single suit < only honours

Additional points may also be rewarded for the type of sets that make up a hand (the
required pair is ommited in this ranking, but is found in all hands):

  a mix of chow and pong and/or kong < all chow < all pung < a mix of pung and kong < all kong

Finally, additional points may be rewarded for sets that have not been revealed
during play. The following ranking is typically observed:

  fully revealed < partially revealed < only the winning set revealed < fully concealed

In addition to these general scoring rules, most rule sets acknowledge "special"
or "limit" hands, which are patterns that do not follow the normal scoring rules.
Generally, these hands win a player the maximum number of points, or "limit",
that may be won on a single hand. There are two universal pattern that fall in this
category:

  a) "heavenly hand": the player who represents "east" has a winning pattern on his
     or her first drawn tile. This is the least statistically likely hand.

  b) "thirteen orphans": this hand consists of the a 1 and 9 tiles for each suit,
     as well as one of each winds and one of each dragon. This gives a player 13
     distinct tiles ("orphans"), and the hand is considered a winning hand if the 14th
     tile forms a pair with any of the orphans.

Usually a third "universal" pattern is acknowledged, called the "earthly" hand, where
a player not representing "east" can form a winning hand by claiming east's very first
discard. This hand is statistically as likely as the "heavenly" hand.


Tactics
-------

Playing to win is a trade-off between the statistical likelihood of reaching a winning
pattern and the number of points that pattern gets a player, weighed against the
likelihood that any of the other three players wins first.

statistical knowledge comes in the form of:
  - knowing how many tiles there are in total
  - knowing how many tiles are still available for play
  - knowing part of the set of unavailable tiles based on:
    - tiles revealed by other players as part of their "declared" hand
    - tiles discarded during play
    - tiles in a player's hand
  - knowing the size of the remaining set of unavailable tiles:
    - the number of concealed tiles in all other players' hands
  - knowing how many tiles other players will need to form a winning pattern based on their revealed tiles
  - knowing which tiles other players will need to form a winning pattern that scores more than or equal to a specific number of points.

In addition to this, guesses as to which tiles players are trying to get can be made based on:
  - the number of sets revealed during play
  - the type of sets revealed during play
  - the uniformity of sets revealed during play
  - the cleanliness of sets revealed during play
  - the type of tiles that are consistently discarded by a player

In order to win at Mahjong, players must use an adaptive strategy that takes into account
the strategy of the other players. As more hands are played, players must reevaluate the
importance of quick wins vs. point rewards vs. preventing others from winning based on
the points rewarded so far in the game.

This means that any A.I. player good enough to play on par with human players should
play with an adaptive strategy as well.

Locally, the important factors are:
  - how many different hands can I form with the tiles I currently have, given the statistical
    information about the availability of the tiles that would be required for these hands.
  - for each hand, how many tiles am I "away" from winning, and many points will I receive if I win
  - how far ahead or behind am I with respect to other players, and how easy is it to catch up, or be caught up on
  - how many more hands of play are left

As an obstacle for other players, the important factors are:
  - which hand(s) is the other player likely going for
  - for each of those hands, how many tiles do they still need, and how many points will this give them
  - how far ahead or behind am they with respect to other players, and how easy is it to them catch up, or be caught up on
  - how many more hands of play are left

(A successfull winning strategy will taking "forcing a draw" into account if it prevents a big win by another player)
