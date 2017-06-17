// File:            cave-brave-tile-type.ts
// Author:          Poulad Ashraf pour
// Modified By:     Poulad Ashraf pour
// Last Modified:   2017-06-17
// Description:     Contains enum type for game tiles

namespace CaveBrave {
    /**
     * Holds type of cells in the game
     */
    export enum Tile {
        Init, // starting point - cave entrance
        Free, // Available for move
        Wall, // Not available for move
        Bats, // 2nd dangerous cell - Bats take you to initial point
        Dino, // 1st dangerous cell - Dino attacks => Caveman dies
        Dest, // Destination - wheel
    }
}