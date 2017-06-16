import DisplayObject = createjs.DisplayObject;
import Bitmap = createjs.Bitmap;
import Ease = createjs.Ease;
let canvas: HTMLCanvasElement;
let stage: createjs.Stage;
let tileLength: number;
let queue: createjs.LoadQueue;
let cache: any = {};

enum Tile {
    Free, // Available for move
    Wall, // Non-available for move
    Dest, // Destination - wheel
    Init, // starting point
    Dino, // Dino attacks -> Death
    Bats, // Bats take you to initial point
}

const worldMap: Tile[][] = [
    [Tile.Wall, Tile.Dino, Tile.Wall, Tile.Wall, Tile.Bats, Tile.Free],
    [Tile.Free, Tile.Free, Tile.Free, Tile.Free, Tile.Free, Tile.Free],
    [Tile.Free, Tile.Wall, Tile.Free, Tile.Wall, Tile.Dest, Tile.Free],
    [Tile.Wall, Tile.Free, Tile.Free, Tile.Free, Tile.Bats, Tile.Free],
    [Tile.Init, Tile.Free, Tile.Wall, Tile.Free, Tile.Free, Tile.Free],
    [Tile.Free, Tile.Free, Tile.Wall, Tile.Wall, Tile.Free, Tile.Dino],
];

let gameObjects: createjs.Bitmap[][][];

interface ICaveMan {
    bitmap: createjs.Bitmap,
    isOnMove: boolean,
    row: number,
    col: number,
}
let caveman = <ICaveMan> {};

function handleTick() {
    stage.update();
}

function gameFinished(isWin: boolean) {
    window.removeEventListener("keydown", handleKeyDown);
    let text: createjs.Text;
    if (isWin) {
        text = new createjs.Text(`CAVEMAN FOUND THE WHEEL!`, 'sans-serif', 'lime');
    } else {
        text = new createjs.Text(`R.I.P CAVEMAN`, 'sans-serif', 'red');
    }

    let rect = new createjs.Shape();
    rect.graphics
        .beginFill(`rgba(20, 20, 20, .7)`)
        .drawRect(0, 0,
            text.getMeasuredWidth(),
            text.getMeasuredHeight());

    text.scaleX = text.scaleY = (canvas.width - 80) / text.getMeasuredWidth();
    rect.scaleX = rect.scaleY = (text.scaleX + .4);

    rect.x = text.x = 30;
    rect.y = text.y = tileLength * .7;

    stage.addChild(rect);
    stage.addChild(text);

    canvas.addEventListener(`click`, startGame);

    setTimeout(() => alert(`Click on the canvas to start a new game`), 2000);
}

function moveCavemanTo(newRow: number, newCol: number) {
    let easeFunction = Ease.linear;
    let tweenTime = 350;

    switch (worldMap[newRow][newCol]) {
        case Tile.Wall:
            console.warn(`Caveman cannot pass the wall!`);
            break;
        case Tile.Bats:
            caveman.row = cache.initCell[0];
            caveman.col = cache.initCell[1];
            easeFunction = Ease.bounceInOut;
            tweenTime = 900;
            console.warn(`Bats scared him. He ran away to the cave entrance.`);
            break;
        case Tile.Dino:
            gameFinished(false);
            break;
        case Tile.Dest:
            gameFinished(true);
            break;
        default:
            caveman.row = newRow;
            caveman.col = newCol;
            break;
    }

    window.removeEventListener("keydown", handleKeyDown);
    createjs.Tween
        .get(caveman.bitmap)
        .to({
            x: tileLength * caveman.col,
            y: tileLength * caveman.row,
        }, tweenTime, easeFunction)
        .call(() => {
            window.addEventListener("keydown", handleKeyDown);
        });

    if (worldMap[newRow][newCol] !== Tile.Init) {
        stage.removeChild(gameObjects[newRow][newCol][1]);
    }
}

function handleKeyDown(e: KeyboardEvent) {
    let newRow = caveman.row;
    let newCol = caveman.col;

    switch (e.keyCode) {
        case 37: // Left arrow
            if (0 < caveman.col) {
                newCol -= 1;
            }
            break;
        case 38: // Up arrow
            if (caveman.row > 0) {
                newRow -= 1;
            }
            break;
        case 39: // Right arrow
            if (caveman.col < (worldMap[caveman.row].length - 1)) {
                newCol += 1;
            }
            break;
        case 40: // South arrow
            if (caveman.row < (worldMap.length - 1)) {
                newRow += 1;
            }
            break;
    }

    if (newRow !== caveman.row || newCol !== caveman.col) {
        moveCavemanTo(newRow, newCol);
    }
}

function getCached(id: string): createjs.Bitmap {
    if (cache.hasOwnProperty(id)) {
        return cache[id].clone();
    } else {
        let obj = new createjs.Bitmap(queue.getResult(id));
        cache[id] = obj;
        return obj;
    }
}

function drawBitmapsAtCell(tileType: Tile, row: number, col: number): Bitmap[] {
    let img1Src: string;
    let img2Src: string = null;

    let obj1: Bitmap;
    let obj2: Bitmap;

    switch (tileType) {
        case Tile.Free:
            img1Src = `footprint.png`;
            break;
        case Tile.Wall:
            img1Src = `wall.jpg`;
            break;
        case Tile.Init:
            img1Src = `cave.svg`;
            img2Src = `caveman.svg`;
            break;
        case Tile.Bats:
            img1Src = `bat.svg`;
            break;
        case Tile.Dino:
            img1Src = `dino.svg`;
            break;
        case Tile.Dest:
            img1Src = `wheel.svg`;
            break;
    }

    img1Src = img1Src || `fog.svg`;
    img2Src = img2Src || `fog.svg`;

    obj1 = getCached(img1Src);
    obj2 = getCached(img2Src);

    const scaleFactor = tileLength / 200;
    obj1.scaleX = scaleFactor;
    obj1.scaleY = scaleFactor;
    obj2.scaleX = scaleFactor;
    obj2.scaleY = scaleFactor;

    obj1.x = obj2.x = tileLength * col;
    obj1.y = obj2.y = tileLength * row;

    gameObjects[row][col][0] = obj1;
    gameObjects[row][col][1] = obj2;

    stage.addChild(obj1);
    stage.addChild(obj2);

    return gameObjects[row][col];
}

function drawGameObjects() {
    for (let i = 0; i < worldMap.length; i++) {
        for (let j = 0; j < worldMap[i].length; j++) {
            let tileType = worldMap[i][j];
            let objs = drawBitmapsAtCell(tileType, i, j);
            if (tileType === Tile.Init) {
                cache.initCell = [i, j];
                caveman.row = i;
                caveman.col = j;
                caveman.bitmap = objs[1];
            }
        }
    }
}

function startGame() {
    canvas.removeEventListener(`click`, startGame);
    stage.removeAllChildren();

    gameObjects = new Array(worldMap.length);
    for (let i = 0; i < worldMap.length; i++) {
        gameObjects[i] = new Array(worldMap[i].length);
        for (let j = 0; j < gameObjects[i].length; j++) {
            gameObjects[i][j] = new Array(2);
        }
    }
    drawGameObjects();

    stage.setChildIndex(caveman.bitmap, stage.getNumChildren() - 1);

    window.addEventListener("keydown", handleKeyDown);
}

function drawGameMenu(): void {
    queue = new createjs.LoadQueue();
    queue.loadManifest([
        {id: `cave.svg`, src: "assets/cave.svg", type: createjs.LoadQueue.IMAGE},
        {id: `caveman.svg`, src: "assets/caveman.svg", type: createjs.LoadQueue.IMAGE},
        {id: `wall.jpg`, src: "assets/wall.jpg"},
        {id: `bat.svg`, src: "assets/bat.svg", type: createjs.LoadQueue.IMAGE},
        {id: `fog.svg`, src: "assets/fog.svg", type: createjs.LoadQueue.IMAGE},
        {id: `footprint.png`, src: "assets/footprint.png"},
        {id: `dino.svg`, src: "assets/dino.svg", type: createjs.LoadQueue.IMAGE},
        {id: `wheel.svg`, src: "assets/wheel.svg", type: createjs.LoadQueue.IMAGE},
    ]);

    let caveBmp = new createjs.Bitmap(`assets/cave.svg`);
    let manBmp = new createjs.Bitmap(`assets/caveman.svg`);

    caveBmp.image.addEventListener(`load`, e => {
        caveBmp.scaleX = caveBmp.scaleY = (canvas.width - 20) / caveBmp.image.width;
        caveBmp.x = caveBmp.y = 10;
    });

    manBmp.image.addEventListener(`load`, v => {
        manBmp.scaleX = manBmp.scaleY = (canvas.width - 20) / caveBmp.image.width;
        manBmp.x = manBmp.y = 10;
    });

    let text = new createjs.Text(`Click to enter the cave`, `consolas`, `yellow`);

    text.scaleX = text.scaleY = (canvas.width - 40) / text.getMeasuredWidth();

    stage.addChild(caveBmp);
    stage.addChild(manBmp);
    stage.addChild(text);

    canvas.addEventListener(`click`, startGame);
}

function init() {
    canvas = <HTMLCanvasElement> document.getElementById(`canvas`);
    stage = new createjs.Stage(canvas);

    createjs.Ticker.addEventListener("tick", handleTick);
    createjs.Ticker.framerate = 60;

    tileLength = canvas.width / worldMap.length;

    drawGameMenu();
}

window.addEventListener(`load`, init);
