function init() {
    var canvas = document.getElementById("canvas");
    var game = new CaveBrave.Game(canvas);
    setTimeout(function () { return game.start(); }, 500);
}
window.addEventListener("load", init);
//# sourceMappingURL=script.js.map