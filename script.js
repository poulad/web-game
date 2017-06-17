// File:            script.ts
// Author:          Poulad Ashraf pour
// Modified By:     Poulad Ashraf pour
// Last Modified:   2017-06-17
// Description:     Starting the game on page load event
/**
 * Initializes the game after page load.
 * Game starts after a very short delay to ensure assets are loaded
 */
function init() {
    var canvas = document.getElementById("canvas");
    var game = new CaveBrave.Game(canvas);
    setTimeout(function () { return game.start(); }, 500);
}
window.addEventListener("load", init);
//# sourceMappingURL=script.js.map