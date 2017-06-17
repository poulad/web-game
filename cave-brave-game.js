// File:            cave-brave-game.ts
// Author:          Poulad Ashraf pour
// Modified By:     Poulad Ashraf pour
// Last Modified:   2017-06-17
// Description:     Contains Cave Brave game type
var Stage = createjs.Stage;
var Ticker = createjs.Ticker;
var LoadQueue = createjs.LoadQueue;
var Ease = createjs.Ease;
var Bitmap = createjs.Bitmap;
var Tween = createjs.Tween;
var Shape = createjs.Shape;
var CaveBrave;
(function (CaveBrave) {
    /**
     * Manages a Cave Brave game within a canvas
     */
    var Game = (function () {
        /**
         * Constructs the game and loads necessary assets
         * @param _canvas Canvas element for drawing game object to
         */
        function Game(_canvas) {
            var _this = this;
            this._canvas = _canvas;
            this._caveman = {};
            this._cache = {};
            this._clickHandler = this.startGame.bind(this);
            this._keyHandler = this.handleKeyDown.bind(this);
            this._stage = new Stage(_canvas);
            Ticker.addEventListener("tick", function () {
                _this._stage.update();
            });
            Ticker.framerate = 60;
            this._tileLength = this._canvas.width / Game.WorldMap.length;
            this._queue = new createjs.LoadQueue();
            this._queue.loadManifest([
                { id: "cave.svg", src: "assets/cave.svg", type: createjs.LoadQueue.IMAGE },
                { id: "caveman.svg", src: "assets/caveman.svg", type: createjs.LoadQueue.IMAGE },
                { id: "wall.jpg", src: "assets/wall.jpg" },
                { id: "bat.svg", src: "assets/bat.svg", type: createjs.LoadQueue.IMAGE },
                { id: "fog.svg", src: "assets/fog.svg", type: createjs.LoadQueue.IMAGE },
                { id: "footprint.png", src: "assets/footprint.png" },
                { id: "dino.svg", src: "assets/dino.svg", type: createjs.LoadQueue.IMAGE },
                { id: "wheel.svg", src: "assets/wheel.svg", type: createjs.LoadQueue.IMAGE },
            ]);
        }
        /**
         * Starts the game menu
         */
        Game.prototype.start = function () {
            this.drawMenu();
            this._canvas.addEventListener("click", this._clickHandler);
        };
        /**
         * Draw game menu on the stage
         */
        Game.prototype.drawMenu = function () {
            var caveBmp = new Bitmap(this._queue.getResult("cave.svg"));
            var manBmp = new Bitmap(this._queue.getResult("caveman.svg"));
            caveBmp.scaleX = caveBmp.scaleY = (this._canvas.width - 20) / caveBmp.image.width;
            caveBmp.x = caveBmp.y = 10;
            manBmp.scaleX = manBmp.scaleY = (this._canvas.width - 20) / caveBmp.image.width;
            manBmp.x = manBmp.y = 10;
            var text = new createjs.Text("CLICK TO ENTER THE CAVE", "bold 16px arial", "yellow");
            text.scaleX = text.scaleY = (this._canvas.width - 40) / text.getMeasuredWidth();
            this._stage.addChild(caveBmp);
            this._stage.addChild(manBmp);
            this._stage.addChild(text);
        };
        /**
         * Populates the game stage according to the map and wires key event listeners
         */
        Game.prototype.startGame = function () {
            this._canvas.removeEventListener("click", this._clickHandler);
            this._stage.removeAllChildren();
            this._gameObjects = new Array(Game.WorldMap.length);
            for (var i = 0; i < Game.WorldMap.length; i++) {
                this._gameObjects[i] = new Array(Game.WorldMap[i].length);
                for (var j = 0; j < this._gameObjects[i].length; j++) {
                    this._gameObjects[i][j] = new Array(2);
                }
            }
            this.drawGameObjects();
            this._stage.setChildIndex(this._caveman.bitmap, this._stage.getNumChildren() - 1);
            window.addEventListener("keydown", this._keyHandler);
        };
        /**
         * Draws objects in cells based on the world map
         */
        Game.prototype.drawGameObjects = function () {
            for (var i = 0; i < Game.WorldMap.length; i++) {
                for (var j = 0; j < Game.WorldMap[i].length; j++) {
                    var tileType = Game.WorldMap[i][j];
                    var objs = this.drawBitmapsAtCell(tileType, i, j);
                    if (tileType === CaveBrave.Tile.Init) {
                        this._cache.initCell = [i, j];
                        this._caveman.row = i;
                        this._caveman.col = j;
                        this._caveman.bitmap = objs[1];
                    }
                }
            }
        };
        /**
         * Draws a game objects in a cell
         * Two objects are drawn in each cell and the second object (on top) is the FOG by default.
         * Objects are added to respective cell in `this._gameObjects` after drawing.
         * @param tileType Type of object to be drawn
         * @param row row number for cell
         * @param col column index for cell
         * @returns {createjs.Bitmap[]} Array of two objects drawn in that cell
         */
        Game.prototype.drawBitmapsAtCell = function (tileType, row, col) {
            var img1Src;
            var img2Src = null;
            var obj1;
            var obj2;
            switch (tileType) {
                case CaveBrave.Tile.Free:
                    img1Src = "footprint.png";
                    break;
                case CaveBrave.Tile.Wall:
                    img1Src = "wall.jpg";
                    break;
                case CaveBrave.Tile.Init:
                    img1Src = "cave.svg";
                    img2Src = "caveman.svg";
                    break;
                case CaveBrave.Tile.Bats:
                    img1Src = "bat.svg";
                    break;
                case CaveBrave.Tile.Dino:
                    img1Src = "dino.svg";
                    break;
                case CaveBrave.Tile.Dest:
                    img1Src = "wheel.svg";
                    break;
            }
            img1Src = img1Src || "fog.svg";
            img2Src = img2Src || "fog.svg";
            obj1 = this.getCachedBitmap(img1Src);
            obj2 = this.getCachedBitmap(img2Src);
            var scaleFactor = this._tileLength / 200;
            obj1.scaleX = scaleFactor;
            obj1.scaleY = scaleFactor;
            obj2.scaleX = scaleFactor;
            obj2.scaleY = scaleFactor;
            obj1.x = obj2.x = this._tileLength * col;
            obj1.y = obj2.y = this._tileLength * row;
            this._gameObjects[row][col][0] = obj1;
            this._gameObjects[row][col][1] = obj2;
            this._stage.addChild(obj1);
            this._stage.addChild(obj2);
            return this._gameObjects[row][col];
        };
        /**
         * Provides the Bitmap object from cache.
         * If bitmap is not already cached, first caches a new bitmap and then returns it.
         * @param id Key for the cached object
         * @returns {createjs.Bitmap} Bitmap object of cached object
         */
        Game.prototype.getCachedBitmap = function (id) {
            if (this._cache.hasOwnProperty(id)) {
                return this._cache[id].clone();
            }
            else {
                var obj = new Bitmap(this._queue.getResult(id));
                this._cache[id] = obj;
                return obj;
            }
        };
        /**
         * Handles key down events of the window and moves the caveman if any of the movement keys are pressed.
         * @param e Keyboard event
         */
        Game.prototype.handleKeyDown = function (e) {
            window.removeEventListener("keydown", this._keyHandler);
            var newRow = this._caveman.row;
            var newCol = this._caveman.col;
            switch (e.keyCode) {
                case 37: // Left arrow
                case 65:
                    if (0 < this._caveman.col) {
                        newCol -= 1;
                    }
                    break;
                case 38: // Up arrow
                case 87:
                    if (this._caveman.row > 0) {
                        newRow -= 1;
                    }
                    break;
                case 39: // Right arrow
                case 68:
                    if (this._caveman.col < (Game.WorldMap[this._caveman.row].length - 1)) {
                        newCol += 1;
                    }
                    break;
                case 40: // South arrow
                case 83:
                    if (this._caveman.row < (Game.WorldMap.length - 1)) {
                        newRow += 1;
                    }
                    break;
            }
            if (newRow !== this._caveman.row || newCol !== this._caveman.col) {
                this.moveCavemanTo(newRow, newCol);
            }
            else {
                window.addEventListener("keydown", this._keyHandler);
            }
        };
        /**
         * Moves caveman to a specified cell and finishes the game if the cell is a final cell
         * @param newRow Row index of new cell
         * @param newCol Column index of new cell
         */
        Game.prototype.moveCavemanTo = function (newRow, newCol) {
            var _this = this;
            var easeFunction = Ease.linear;
            var tweenTime = 350;
            switch (Game.WorldMap[newRow][newCol]) {
                case CaveBrave.Tile.Wall:
                    var wallMsg = "Caveman cannot pass the wall!";
                    console.warn(wallMsg);
                    var wallText_1 = new createjs.Text(wallMsg, "bold 20px Arial", 'yellow');
                    wallText_1.x = 10;
                    wallText_1.y = this._canvas.height - wallText_1.getMeasuredLineHeight() - 10;
                    this._stage.addChild(wallText_1);
                    setTimeout(function () {
                        _this._stage.removeChild(wallText_1);
                    }, 1000);
                    break;
                case CaveBrave.Tile.Bats:
                    this._caveman.row = this._cache.initCell[0];
                    this._caveman.col = this._cache.initCell[1];
                    easeFunction = Ease.bounceInOut;
                    tweenTime = 900;
                    var batsMsg = "Bats scared him. He ran away to the cave entrance.";
                    console.warn(batsMsg);
                    var batsText_1 = new createjs.Text(batsMsg, "bold 20px Arial", 'orange');
                    batsText_1.x = 10;
                    batsText_1.y = this._canvas.height - batsText_1.getMeasuredLineHeight() - 10;
                    this._stage.addChild(batsText_1);
                    setTimeout(function () {
                        _this._stage.removeChild(batsText_1);
                    }, 2000);
                    break;
                case CaveBrave.Tile.Dino:
                    if (Game.WorldMap[newRow][newCol] !== CaveBrave.Tile.Init) {
                        this._stage.removeChild(this._gameObjects[newRow][newCol][1]);
                    }
                    this.gameFinished(false);
                    return;
                case CaveBrave.Tile.Dest:
                    if (Game.WorldMap[newRow][newCol] !== CaveBrave.Tile.Init) {
                        this._stage.removeChild(this._gameObjects[newRow][newCol][1]);
                    }
                    this.gameFinished(true);
                    return;
                default:
                    this._caveman.row = newRow;
                    this._caveman.col = newCol;
                    break;
            }
            this._caveman.isOnMove = true;
            Tween.get(this._caveman.bitmap)
                .to({
                x: this._tileLength * this._caveman.col,
                y: this._tileLength * this._caveman.row,
            }, tweenTime, easeFunction)
                .call(function () {
                _this._caveman.isOnMove = false;
                window.addEventListener("keydown", _this._keyHandler);
            });
            if (Game.WorldMap[newRow][newCol] !== CaveBrave.Tile.Init) {
                this._stage.removeChild(this._gameObjects[newRow][newCol][1]);
            }
        };
        /**
         * Finishes the game by showing appropriate message
         * @param isWin Indicates whether user won the game or lost
         */
        Game.prototype.gameFinished = function (isWin) {
            var text;
            if (isWin) {
                text = new createjs.Text("CAVEMAN FOUND THE WHEEL!", 'sans-serif', 'lime');
            }
            else {
                text = new createjs.Text("R.I.P CAVEMAN", 'sans-serif', 'red');
            }
            var rect = new Shape();
            rect.graphics
                .beginFill("rgba(20, 20, 20, .7)")
                .drawRect(0, 0, text.getMeasuredWidth(), text.getMeasuredHeight());
            text.scaleX = text.scaleY = (this._canvas.width - 80) / text.getMeasuredWidth();
            rect.scaleX = rect.scaleY = (text.scaleX + .4);
            rect.x = text.x = 30;
            rect.y = text.y = this._tileLength * .7;
            this._stage.addChild(rect);
            this._stage.addChild(text);
            this._canvas.addEventListener("click", this._clickHandler);
            setTimeout(function () { return alert("Click on the canvas to start a new game"); }, 2000);
        };
        return Game;
    }());
    Game.WorldMap = [
        [CaveBrave.Tile.Wall, CaveBrave.Tile.Dino, CaveBrave.Tile.Wall, CaveBrave.Tile.Wall, CaveBrave.Tile.Bats, CaveBrave.Tile.Free],
        [CaveBrave.Tile.Free, CaveBrave.Tile.Free, CaveBrave.Tile.Free, CaveBrave.Tile.Free, CaveBrave.Tile.Free, CaveBrave.Tile.Free],
        [CaveBrave.Tile.Free, CaveBrave.Tile.Wall, CaveBrave.Tile.Free, CaveBrave.Tile.Wall, CaveBrave.Tile.Dest, CaveBrave.Tile.Free],
        [CaveBrave.Tile.Wall, CaveBrave.Tile.Free, CaveBrave.Tile.Free, CaveBrave.Tile.Free, CaveBrave.Tile.Bats, CaveBrave.Tile.Free],
        [CaveBrave.Tile.Init, CaveBrave.Tile.Free, CaveBrave.Tile.Wall, CaveBrave.Tile.Free, CaveBrave.Tile.Free, CaveBrave.Tile.Free],
        [CaveBrave.Tile.Free, CaveBrave.Tile.Free, CaveBrave.Tile.Wall, CaveBrave.Tile.Wall, CaveBrave.Tile.Free, CaveBrave.Tile.Dino],
    ];
    CaveBrave.Game = Game;
})(CaveBrave || (CaveBrave = {}));
//# sourceMappingURL=cave-brave-game.js.map