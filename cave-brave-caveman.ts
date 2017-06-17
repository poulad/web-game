// File:            cave-brave-caveman.ts
// Author:          Poulad Ashraf pour
// Modified By:     Poulad Ashraf pour
// Last Modified:   2017-06-17
// Description:     Contains ICaveMan interface for Cave Brave game

namespace CaveBrave {
    /**
     * Cave brave game hero, the CaveMan
     * This is used in the {CaveBrave.Game} class for controlling the movements on stage
     */
    export interface ICaveMan {
        bitmap: createjs.Bitmap,
        isOnMove: boolean,
        row: number,
        col: number,
    }
}
