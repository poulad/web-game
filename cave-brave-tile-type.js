// File:            cave-brave-tile-type.ts
// Author:          Poulad Ashraf pour
// Modified By:     Poulad Ashraf pour
// Last Modified:   2017-06-17
// Description:     Contains enum type for game tiles
var CaveBrave;
(function (CaveBrave) {
    /**
     * Holds type of cells in the game
     */
    var Tile;
    (function (Tile) {
        Tile[Tile["Init"] = 0] = "Init";
        Tile[Tile["Free"] = 1] = "Free";
        Tile[Tile["Wall"] = 2] = "Wall";
        Tile[Tile["Bats"] = 3] = "Bats";
        Tile[Tile["Dino"] = 4] = "Dino";
        Tile[Tile["Dest"] = 5] = "Dest";
    })(Tile = CaveBrave.Tile || (CaveBrave.Tile = {}));
})(CaveBrave || (CaveBrave = {}));
//# sourceMappingURL=cave-brave-tile-type.js.map