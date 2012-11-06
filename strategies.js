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



var Strategies = {
  pick: function(wall, concealedTiles, declaredSets) {
    var concealedTiles = concealedTiles.toTileNumbers();
    var declaredSets = declaredSets.toTileNumbers();
    var strategy = Generator.generate(concealedTiles, declaredSets); // {required, discard}
    return strategy;
  }
};
