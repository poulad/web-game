var DisplayObject = createjs.DisplayObject;
var Bitmap = createjs.Bitmap;
var Ease = createjs.Ease;
var canvas;
var stage;
var tileLength;
var queue;
var cache = {};
var Tile;
(function (Tile) {
    Tile[Tile["Free"] = 0] = "Free";
    Tile[Tile["Wall"] = 1] = "Wall";
    Tile[Tile["Dest"] = 2] = "Dest";
    Tile[Tile["Init"] = 3] = "Init";
    Tile[Tile["Dino"] = 4] = "Dino";
    Tile[Tile["Bats"] = 5] = "Bats";
})(Tile || (Tile = {}));
var worldMap = [
    [Tile.Wall, Tile.Dino, Tile.Wall, Tile.Wall, Tile.Bats, Tile.Free],
    [Tile.Free, Tile.Free, Tile.Free, Tile.Free, Tile.Free, Tile.Free],
    [Tile.Free, Tile.Wall, Tile.Free, Tile.Wall, Tile.Dest, Tile.Free],
    [Tile.Wall, Tile.Free, Tile.Free, Tile.Free, Tile.Bats, Tile.Free],
    [Tile.Init, Tile.Free, Tile.Wall, Tile.Free, Tile.Free, Tile.Free],
    [Tile.Free, Tile.Free, Tile.Wall, Tile.Wall, Tile.Free, Tile.Dino],
];
var gameObjects;
var caveman = {};
function handleTick() {
    stage.update();
}
function gameFinished(isWin) {
    window.removeEventListener("keydown", handleKeyDown);
    var text;
    if (isWin) {
        text = new createjs.Text("CAVEMAN FOUND THE WHEEL!", 'sans-serif', 'lime');
    }
    else {
        text = new createjs.Text("R.I.P CAVEMAN", 'sans-serif', 'red');
    }
    var rect = new createjs.Shape();
    rect.graphics
        .beginFill("rgba(20, 20, 20, .7)")
        .drawRect(0, 0, text.getMeasuredWidth(), text.getMeasuredHeight());
    text.scaleX = text.scaleY = (canvas.width - 80) / text.getMeasuredWidth();
    rect.scaleX = rect.scaleY = (text.scaleX + .4);
    rect.x = text.x = 30;
    rect.y = text.y = tileLength * .7;
    stage.addChild(rect);
    stage.addChild(text);
    canvas.addEventListener("click", startGame);
    setTimeout(function () { return alert("Click on the canvas to start a new game"); }, 2000);
}
function moveCavemanTo(newRow, newCol) {
    var easeFunction = Ease.linear;
    var tweenTime = 350;
    switch (worldMap[newRow][newCol]) {
        case Tile.Wall:
            var wallMsg = "Caveman cannot pass the wall!";
            console.warn(wallMsg);
            var wallText_1 = new createjs.Text(wallMsg, "bold 20px Arial", 'yellow');
            wallText_1.x = 10;
            wallText_1.y = canvas.height - wallText_1.getMeasuredLineHeight() - 10;
            stage.addChild(wallText_1);
            setTimeout(function () {
                stage.removeChild(wallText_1);
            }, 1000);
            break;
        case Tile.Bats:
            caveman.row = cache.initCell[0];
            caveman.col = cache.initCell[1];
            easeFunction = Ease.bounceInOut;
            tweenTime = 900;
            var batsMsg = "Bats scared him. He ran away to the cave entrance.";
            console.warn(batsMsg);
            var batsText_1 = new createjs.Text(batsMsg, "bold 20px Arial", 'orange');
            batsText_1.x = 10;
            batsText_1.y = canvas.height - batsText_1.getMeasuredLineHeight() - 10;
            stage.addChild(batsText_1);
            setTimeout(function () {
                stage.removeChild(batsText_1);
            }, 2000);
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
        .call(function () {
        window.addEventListener("keydown", handleKeyDown);
    });
    if (worldMap[newRow][newCol] !== Tile.Init) {
        stage.removeChild(gameObjects[newRow][newCol][1]);
    }
}
function handleKeyDown(e) {
    var newRow = caveman.row;
    var newCol = caveman.col;
    switch (e.keyCode) {
        case 37: // Left arrow
        case 65:
            if (0 < caveman.col) {
                newCol -= 1;
            }
            break;
        case 38: // Up arrow
        case 87:
            if (caveman.row > 0) {
                newRow -= 1;
            }
            break;
        case 39: // Right arrow
        case 68:
            if (caveman.col < (worldMap[caveman.row].length - 1)) {
                newCol += 1;
            }
            break;
        case 40: // South arrow
        case 83:
            if (caveman.row < (worldMap.length - 1)) {
                newRow += 1;
            }
            break;
    }
    if (newRow !== caveman.row || newCol !== caveman.col) {
        moveCavemanTo(newRow, newCol);
    }
}
function getCached(id) {
    if (cache.hasOwnProperty(id)) {
        return cache[id].clone();
    }
    else {
        var obj = new createjs.Bitmap(queue.getResult(id));
        cache[id] = obj;
        return obj;
    }
}
function drawBitmapsAtCell(tileType, row, col) {
    var img1Src;
    var img2Src = null;
    var obj1;
    var obj2;
    switch (tileType) {
        case Tile.Free:
            img1Src = "footprint.png";
            break;
        case Tile.Wall:
            img1Src = "wall.jpg";
            break;
        case Tile.Init:
            img1Src = "cave.svg";
            img2Src = "caveman.svg";
            break;
        case Tile.Bats:
            img1Src = "bat.svg";
            break;
        case Tile.Dino:
            img1Src = "dino.svg";
            break;
        case Tile.Dest:
            img1Src = "wheel.svg";
            break;
    }
    img1Src = img1Src || "fog.svg";
    img2Src = img2Src || "fog.svg";
    obj1 = getCached(img1Src);
    obj2 = getCached(img2Src);
    var scaleFactor = tileLength / 200;
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
    for (var i = 0; i < worldMap.length; i++) {
        for (var j = 0; j < worldMap[i].length; j++) {
            var tileType = worldMap[i][j];
            var objs = drawBitmapsAtCell(tileType, i, j);
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
    canvas.removeEventListener("click", startGame);
    stage.removeAllChildren();
    gameObjects = new Array(worldMap.length);
    for (var i = 0; i < worldMap.length; i++) {
        gameObjects[i] = new Array(worldMap[i].length);
        for (var j = 0; j < gameObjects[i].length; j++) {
            gameObjects[i][j] = new Array(2);
        }
    }
    drawGameObjects();
    stage.setChildIndex(caveman.bitmap, stage.getNumChildren() - 1);
    window.addEventListener("keydown", handleKeyDown);
}
function drawGameMenu() {
    queue = new createjs.LoadQueue();
    queue.loadManifest([
        { id: "cave.svg", src: "assets/cave.svg", type: createjs.LoadQueue.IMAGE },
        { id: "caveman.svg", src: "assets/caveman.svg", type: createjs.LoadQueue.IMAGE },
        { id: "wall.jpg", src: "assets/wall.jpg" },
        { id: "bat.svg", src: "assets/bat.svg", type: createjs.LoadQueue.IMAGE },
        { id: "fog.svg", src: "assets/fog.svg", type: createjs.LoadQueue.IMAGE },
        { id: "footprint.png", src: "assets/footprint.png" },
        { id: "dino.svg", src: "assets/dino.svg", type: createjs.LoadQueue.IMAGE },
        { id: "wheel.svg", src: "assets/wheel.svg", type: createjs.LoadQueue.IMAGE },
    ]);
    var caveBmp = new createjs.Bitmap("assets/cave.svg");
    var manBmp = new createjs.Bitmap("assets/caveman.svg");
    caveBmp.image.addEventListener("load", function (e) {
        caveBmp.scaleX = caveBmp.scaleY = (canvas.width - 20) / caveBmp.image.width;
        caveBmp.x = caveBmp.y = 10;
    });
    manBmp.image.addEventListener("load", function (v) {
        manBmp.scaleX = manBmp.scaleY = (canvas.width - 20) / caveBmp.image.width;
        manBmp.x = manBmp.y = 10;
    });
    var text = new createjs.Text("Click to enter the cave", "consolas", "yellow");
    text.scaleX = text.scaleY = (canvas.width - 40) / text.getMeasuredWidth();
    stage.addChild(caveBmp);
    stage.addChild(manBmp);
    stage.addChild(text);
    canvas.addEventListener("click", startGame);
}
function init() {
    canvas = document.getElementById("canvas");
    stage = new createjs.Stage(canvas);
    createjs.Ticker.addEventListener("tick", handleTick);
    createjs.Ticker.framerate = 60;
    tileLength = canvas.width / worldMap.length;
    drawGameMenu();
}
window.addEventListener("load", init);
//# sourceMappingURL=script.js.map