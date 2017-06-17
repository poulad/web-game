function init() {
    let canvas = <HTMLCanvasElement> document.getElementById(`canvas`);

    let game = new CaveBrave.Game(canvas);

    setTimeout(() => game.start(), 500);
}

window.addEventListener(`load`, init);
