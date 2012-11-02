/**
 * Mahjong constants
 */
var Constants = {
  // very special values
  WAITINGFORSUPPLEMENTTILE: -10,
  NOTILE: -1,
  HANDSIZE: 14,

  // set types
  NOTHING:        -1,
  SINGLE:          0,
  CONNECTED:       1,
  PAIR:            2,
  GAPPED:          4,
  CHOW:            8,
  PUNG:           16,
  KONG:           32,
  CONCEALED_KONG: 64,
  SET:           128,
  REQUIRED:      256,
  WIN:           512,

  // numerals: 0-26 (simples: 1..7 % 9, terminals: 0 % 9 and 8 % 9)
  NUMERALS:     0,
  NUMMOD:       9,
  
  // bamboo suit: 0-8
  BAMBOOS:      0,
  BAMBOO_ONE:   0,
  BAMBOO_TWO:   1,
  BAMBOO_THREE: 2,
  BAMBOO_FOUR:  3,
  BAMBOO_FIVE:  4,
  BAMBOO_SIX:   5,
  BAMBOO_SEVEN: 6,
  BAMBOO_EIGHT: 7,
  BAMBOO_NINE:  8,
  
  // character suit: 9-17  
  CHARACTERS:       9,
  CHARACTER_ONE:    9,
  CHARACTER_TWO:   10,
  CHARACTER_THREE: 11,
  CHARACTER_FOUR:  12,
  CHARACTER_FIVE:  13,
  CHARACTER_SIX:   14,
  CHARACTER_SEVEN: 15,
  CHARACTER_EIGHT: 16,
  CHARACTER_NINE:  17,

  // dots suit: 18-26
  DOTS:      18,
  DOT_ONE:   18,
  DOT_TWO:   19,
  DOT_THREE: 20,
  DOT_FOUR:  21,
  DOT_FIVE:  22,
  DOT_SIX:   23,  
  DOT_SEVEN: 24,
  DOT_EIGHT: 25,
  DOT_NINE:  26,

  // honour: 27-33
  HONOURS:  27,

  // winds: 27-30
  WINDS: 27,
  EAST:  27,
  SOUTH: 28,
  WEST:  29,
  NORTH: 30,

  // dragons: 31-33  
  DRAGONS: 31,
  GREEN:   31,
  RED:     32,
  WHITE:   33,

  // bonus tiles: flowers: 34-37
  BONUS:         34,
  FLOWERS:       34,
  PLUM:          34,
  ORCHID:        35,
  CHRYSANTHEMUM: 36,
  BAMBOO:        37,
  
  // bonus tiles: seasons: 38-41
  SEASONS: 38,
  SPRING:  38,
  SUMMER:  39,
  FALL:    40,
  WINTER:  41,

  // there are 34 playtiles and eight bonus tiles
  PLAYTILES: 34,
  BONUSTILES: 8,
  
  // how many tiles in the dead wall?
  DEADWALL: 16,

  // universal numerical sorting function
  sortFunction: function(a,b) {
    return (a===b ? 0 : a < b ? -1 : 1); 
  },
};

// bind tile names
(function(Constants) {
  var tileNames = [];

  setBambooNames: (function(){
    tileNames[Constants.BAMBOO_ONE]   = "bamboo one";
    tileNames[Constants.BAMBOO_TWO]   = "bamboo two";
    tileNames[Constants.BAMBOO_THREE] = "bamboo three";
    tileNames[Constants.BAMBOO_FOUR]  = "bamboo four";
    tileNames[Constants.BAMBOO_FIVE]  = "bamboo five";
    tileNames[Constants.BAMBOO_SIX]   = "bamboo six";
    tileNames[Constants.BAMBOO_SEVEN] = "bamboo seven";
    tileNames[Constants.BAMBOO_EIGHT] = "bamboo eight";
    tileNames[Constants.BAMBOO_NINE]  = "bamboo nine";
    return true;
  }());

  setCharacterNames: (function(){
    tileNames[Constants.CHARACTER_ONE]   = "character one";
    tileNames[Constants.CHARACTER_TWO]   = "character two";
    tileNames[Constants.CHARACTER_THREE] = "character three";
    tileNames[Constants.CHARACTER_FOUR]  = "character four";
    tileNames[Constants.CHARACTER_FIVE]  = "character five";
    tileNames[Constants.CHARACTER_SIX]   = "character six";
    tileNames[Constants.CHARACTER_SEVEN] = "character seven";
    tileNames[Constants.CHARACTER_EIGHT] = "character eight";
    tileNames[Constants.CHARACTER_NINE]  = "character nine";
    return true;
  }());

  setDotNames: (function(){
    tileNames[Constants.DOT_ONE]   = "dots one";
    tileNames[Constants.DOT_TWO]   = "dots two";
    tileNames[Constants.DOT_THREE] = "dots three";
    tileNames[Constants.DOT_FOUR]  = "dots four";
    tileNames[Constants.DOT_FIVE]  = "dots five";
    tileNames[Constants.DOT_SIX]   = "dots six";
    tileNames[Constants.DOT_SEVEN] = "dots seven";
    tileNames[Constants.DOT_EIGHT] = "dots eight";
    tileNames[Constants.DOT_NINE]  = "dots nine";
    return true;
  }());    

  setWindNames: (function(){
    tileNames[Constants.EAST]  = "east";
    tileNames[Constants.SOUTH] = "south";
    tileNames[Constants.WEST]  = "west";
    tileNames[Constants.NORTH] = "north";
    return true;
  }());

  setDragonNames: (function(){
    tileNames[Constants.GREEN] = "green dragon";
    tileNames[Constants.RED]   = "red dragon";
    tileNames[Constants.WHITE] = "white dragon";
    return true;
  }());

  setFlowerNames: (function(){
    tileNames[Constants.PLUM]   = "east flower: plum";
    tileNames[Constants.ORCHID] = "south flower: orchid";
    tileNames[Constants.CHRYSANTHEMUM] = "west flower: chrysanthemum";
    tileNames[Constants.BAMBOO] = "north flower: bamboo";
    return true;
  }());

  setSeasonNames: (function(){
    tileNames[Constants.SPRING] = "east season: spring";
    tileNames[Constants.SUMMER] = "south season: summer";
    tileNames[Constants.FALL]   = "west season: fall";
    tileNames[Constants.WINTER] = "north season: winter";
    return true;
  }());
  
  Constants.tileNames = tileNames;
}(Constants));