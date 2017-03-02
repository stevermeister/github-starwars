(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
const Game_1 = require("./Game");
class App {
    constructor(options) {
        let $svg = options.svg;
        App.initToolbar($svg);
        new Game_1.Game({ el: $svg, score: document.querySelector(".score-game") });
        document.addEventListener("keypress", (event) => {
            if (event.keyCode === 13) {
                event.preventDefault();
                lib_1.EventEmitter.trigger('start game');
            }
        });
    }
    static initToolbar(svg) {
        let toolbar = document.createElement('div');
        toolbar.innerHTML = `<h3 style="text-align: left; margin-left: 50px; float: left" class="score-game">Score: 0</h3>
				<div  style="float: left; background: #eee; line-height: 40px; margin-left: 50px; padding: 0 20px;">
					<strong style="color: #ff7978">Enter-</strong>Start Game 
					<strong style="color: #ff7978">F-</strong>Fire  
					<strong style="color: #ff7978">Num 8-</strong>Up  
					<strong style="color: #ff7978">Num 5-</strong>Down
					<strong style="color: #ff7978">Num 4-</strong>Left
					<strong style="color: #ff7978">Num 6-</strong>Right
				</div>
			</HTMLDivElement>`;
        toolbar.style.cssText = `
		    position: absolute;
		    top: -50px;
		    width: 100%;
		    background: #fff;
        `;
        svg.parentNode.style.position = 'relative';
        svg.parentNode.appendChild(toolbar);
    }
}
exports.App = App;

},{"./Game":3,"./lib":16}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
const constants_1 = require("./constants");
const Point_1 = require("./entities/Point");
class EndGame {
    constructor() {
        lib_1.EventEmitter.on('stop game', (data) => {
            lib_1.EventEmitter.trigger("update field of game", { text: this._endOfTheGame(data.type) });
        });
    }
    _endOfTheGame(endEventType) {
        let endGameText;
        let currentResultText;
        currentResultText = endEventType === 'lose' ? constants_1.END_GAME_TEXT.GAME_OVER_TEXT : constants_1.END_GAME_TEXT.WIN_TEXT;
        endGameText = currentResultText
            .map((item) => new Point_1.Point(item))
            .sort(() => Math.random() - 0.5);
        return endGameText;
    }
}
exports.EndGame = EndGame;

},{"./constants":7,"./entities/Point":11,"./lib":16}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
const Processor_1 = require("./Processor");
const GameField_1 = require("./GameField");
const constants_1 = require("./constants");
const EndGame_1 = require("./EndGame");
class Game {
    constructor(options) {
        this._scoreElement = options.score;
        this._shootTime = performance.now();
        this._initGameComponents(options);
        this.checkScore = this.checkScore.bind(this);
        lib_1.EventEmitter.on("update score", this.checkScore);
        document.addEventListener('keypress', this.checkMove.bind(this));
    }
    _initGameComponents(options) {
        this._dataField = new GameField_1.GameField({
            list: options.el.querySelectorAll('rect')
        });
        new Processor_1.Processor({
            dataField: this._dataField
        });
        new EndGame_1.EndGame();
    }
    checkScore(data) {
        this._scoreElement.innerHTML = "Score: " + data.score;
    }
    checkMove(e) {
        e.preventDefault();
        let { right, left, down, up, fire } = constants_1.KEYBOARDS_CODE;
        let code = e.keyCode;
        if (code !== fire && code !== up && code !== down && code !== right && code !== left)
            return;
        switch (code) {
            case fire: {
                let now = performance.now();
                if ((now - this._shootTime) / constants_1.SHIP.TIME_OF_DELAY_SHOTTING >= 1) {
                    this._shootTime = now;
                    lib_1.EventEmitter.trigger('fire');
                }
                break;
            }
            case up: {
                lib_1.EventEmitter.trigger('move', { direction: "up" });
                break;
            }
            case right: {
                lib_1.EventEmitter.trigger('move', { direction: "right" });
                break;
            }
            case left: {
                lib_1.EventEmitter.trigger('move', { direction: "left" });
                break;
            }
            case down: {
                lib_1.EventEmitter.trigger('move', { direction: "down" });
                break;
            }
        }
    }
}
exports.Game = Game;

},{"./EndGame":2,"./GameField":4,"./Processor":5,"./constants":7,"./lib":16}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
class GameField {
    constructor(options) {
        this._dataField = this._initData(options.list);
    }
    _initData(rectList) {
        let result = [];
        for (let j = 0; j < rectList.length; j++) {
            result.push({
                el: rectList[j],
                index: j
            });
        }
        return result;
    }
    render(currentState) {
        this._clearData();
        let currentField = this._checkVisiblePositions(currentState);
        this._dataField.forEach((elem) => {
            currentField.forEach((item) => {
                if (elem.index === item.x * constants_1.FIELD_SIZE.columnLength + item.y) {
                    elem.el.style.fill = item.color;
                }
            });
        });
    }
    /*public endRender(currentState: Point[]): void {
        let timer: number;

        this._clearData();
        currentState.forEach((item) => {
            this._dataField.forEach((elem) => {
                timer = setInterval(() => {
                        if (elem.index === item.x * FIELD_SIZE.columnLength + item.y) {
                            (elem.el as HTMLElement).style.fill = item.color;
                        }
                }, 10);
            });

        });
        clearInterval(timer);
    }*/
    endRender(currentState) {
        let self = this;
        let index = 0;
        this._clearData();
        setTimeout(function run() {
            let item = currentState[index];
            self._dataField.forEach(elem => {
                if (elem.index === item.x * constants_1.FIELD_SIZE.columnLength + item.y) {
                    elem.el.style.fill = item.color;
                }
            });
            index++;
            if (index !== currentState.length)
                setTimeout(run.bind(this), 10);
        }.bind(this), 10);
    }
    _clearData() {
        this._dataField.forEach((elem) => {
            elem.el.style.fill = '#eee';
        });
    }
    getLenghtofData() {
        return this._dataField.length;
    }
    _checkVisiblePositions(currentState) {
        return currentState.filter(point => point.x >= constants_1.FIELD_SIZE.leftX && point.x <= constants_1.FIELD_SIZE.rightX && point.y >= constants_1.FIELD_SIZE.topY && point.y <= constants_1.FIELD_SIZE.bottomY);
    }
}
exports.GameField = GameField;

},{"./constants":7}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
const index_1 = require("./entities/index");
const ProcessorForState_1 = require("./ProcessorForState");
const constants_1 = require("./constants");
class Processor {
    constructor(options) {
        this._isStopGame = false;
        this._energyTypes = [];
        this._score = 0;
        this._energyParams = {};
        Object.keys(constants_1.START_ENERGY_PARAMS).forEach(key => {
            this._energyParams[key] = Object.assign({}, constants_1.START_ENERGY_PARAMS[key]);
            this._energyTypes.push(key);
        });
        //this._timeDelayShooting = throttle(this._shot.bind(this, 'spaceshipBullet'), SHIP.TIME_OF_DELAY_SHOTTING);
        this._dataField = options.dataField;
        this._lengthOfField = this._dataField.getLenghtofData();
        this._processorState = new ProcessorForState_1.ProcessorForState({ types: this._energyTypes });
        lib_1.EventEmitter.on('fire', () => {
            if (!this._isStopGame)
                this._shot('spaceshipBullet');
        });
        lib_1.EventEmitter.on('move', (data) => {
            this._energyParams.spaceship.direction = constants_1.SHIP.SPACE_SHIP_DIRECTION[data.direction];
        });
        lib_1.EventEmitter.on('start game', () => {
            //prepare game to start
            this._prepareGameFieldToStart();
            //start
            this._startProcess();
        });
        lib_1.EventEmitter.on("update field of game", (data) => {
            this._dataField.endRender(data.text);
            this._isStopGame = true;
        });
    }
    _prepareGameFieldToStart() {
        this._dataField.render([]);
        lib_1.EventEmitter.trigger("update score", { score: 0 }); //reset score
        this._energyParams["enemy"].duration = constants_1.START_ENERGY_PARAMS.enemy.duration;
        this._score = 0;
        this._processorState.clear(); //delete all entities on field
        clearInterval(this._timer); //stop all enemy
        if (this._isStopGame)
            this._isStopGame = false;
    }
    _startProcess() {
        this._spaceShip = this._createSpaceShip();
        this._timer = this._generateEvil();
        this._processorState.add({
            type: 'spaceship',
            instance: this._spaceShip
        });
        let self = this;
        requestAnimationFrame(function __animateLoop() {
            if (self._isStopGame)
                return;
            let { moved, all } = self._moveAllEntities();
            self._draw(all);
            self._prepareNextStep(all, moved);
            self._energyParams.spaceship.direction = { x: 0, y: 0 };
            requestAnimationFrame(__animateLoop);
        });
    }
    _createSpaceShip() {
        return new index_1.Spaceship({
            colaider: constants_1.SHIP.START_SHIP_POSITION.map((item) => {
                return new index_1.Point(item);
            })
        });
    }
    _createEnemyShip() {
        let { x, y } = this._generateColaider();
        return new index_1.Enemyship({ colaider: [
                new index_1.Point({ type: 'body', x: x, y: y, color: "green" }),
                new index_1.Point({ type: 'body', x: x + 1, y: y, color: "green" })
            ] });
    }
    _generateEvil() {
        let timer = setInterval(() => {
            this._processorState.add({
                type: 'enemy',
                instance: this._createEnemyShip()
            });
        }, 1000);
        return timer;
    }
    _prepareForStarOfDeath() {
        clearInterval(this._timer);
        this._processorState.clearFotStarOfDeath();
        this._generateStarOfDeath();
        this._timer = setInterval(() => {
            this._shot("enemyBullet");
        }, 800);
    }
    _moveAllEntities() {
        let entities = this._processorState.get();
        let movedEntities = {};
        this._energyTypes.forEach(key => {
            if (key == "spaceship") {
                let tailPosition = this._spaceShip.colaider.reduce((min, item) => min.x < item.x ? min : item);
                let gunPosition = [];
                this._spaceShip.colaider.forEach((item) => {
                    if (item.type === 'gun')
                        gunPosition.push(item);
                });
                let y = this._energyParams.spaceship.direction.y;
                let x = this._energyParams.spaceship.direction.x;
                for (let i = 0; i < gunPosition.length; i++) {
                    if ((gunPosition[i].y === constants_1.FIELD_SIZE.bottomY && y > 0)
                        || (gunPosition[i].y === constants_1.FIELD_SIZE.topY && y < 0)
                        || (tailPosition.x === constants_1.FIELD_SIZE.leftX && x < 0)
                        || (gunPosition[i].x === constants_1.FIELD_SIZE.rightX && x > 0)) {
                        return;
                    }
                }
            }
            entities[key].forEach(entity => {
                let moved = entity.move(this._energyParams[key]);
                if (moved) {
                    movedEntities[key] ? movedEntities[key].push(entity) : movedEntities[key] = [entity];
                }
            });
        });
        return {
            moved: movedEntities,
            all: entities
        };
    }
    _checkCriticalPoint(key, entity, entities) {
        switch (key) {
            case "spaceship": {
                this.checkCrash(entities['enemy'], entity);
                this.checkCrash(entities['enemyBullet'], entity);
                this.checkCrash(entities['starOfDeath'], entity);
                if (entity.removed) {
                    this._settingsToStopGame();
                    this._resultOfAction("lose");
                }
                break;
            }
            case "spaceshipBullet": {
                this.checkCrash(entities['enemy'], entity);
                this.checkCrash(entities['enemyBullet'], entity);
                if (entity.removed) {
                    this._resultOfAction("kill");
                    return;
                }
                entities['starOfDeath'].forEach(item => {
                    if (item.checkPosition(entity.colaider)) {
                        entity.removed = true;
                    }
                    if (entity.checkPosition(item.getAimColider())) {
                        this._resultOfAction("win");
                    }
                });
                if (entity.colaider.x > constants_1.FIELD_SIZE.rightX)
                    entity.removed = true;
                break;
            }
            case "enemy": {
                this.checkCrash(entities['spaceshipBullet'], entity);
                this.checkCrash(entities['spaceship'], entity);
                if (entity.removed) {
                    this._resultOfAction("kill");
                    return;
                }
                if (this._spaceShip.removed) {
                    this._resultOfAction("lose");
                }
                let isInField = entity.colaider.filter(point => point.x > constants_1.FIELD_SIZE.leftX);
                if (!isInField.length)
                    entity.removed = true;
                break;
            }
            case "enemyBullet": {
                this.checkCrash(entities['spaceshipBullet'], entity);
                this.checkCrash(entities['spaceship'], entity);
                if (entity.colaider.x < constants_1.FIELD_SIZE.leftX)
                    entity.removed = true;
                break;
            }
            case "starOfDeath": {
                this.checkCrash(entities['spaceship'], entity);
                if (entity.getGunCordinates().x < constants_1.FIELD_SIZE.leftX)
                    entity.removed = true;
                entities['spaceshipBullet'].forEach(bullet => {
                    if (bullet.checkPosition(entity.colaider)) {
                        bullet.removed = true;
                    }
                    if (bullet.checkPosition(entity.getAimColider())) {
                        this._resultOfAction("win");
                    }
                });
            }
        }
    }
    _resultOfAction(type) {
        switch (type) {
            case "lose": {
                lib_1.EventEmitter.trigger("stop game", { type: "lose" });
                break;
            }
            case "win": {
                lib_1.EventEmitter.trigger('stop game', { type: 'win' });
                break;
            }
            case "kill": {
                this._checkScore();
            }
        }
    }
    checkCrash(entities, currentEntity) {
        entities.forEach(entity => {
            if (entity.checkPosition(currentEntity.colaider)) {
                entity.removed = true;
                currentEntity.removed = true;
            }
        });
    }
    _draw(arr) {
        let current = [];
        this._energyTypes.forEach(entityType => {
            arr[entityType].forEach(item => {
                current.push(item.colaider);
            });
        });
        let result = lib_1.concatAll(current);
        this._dataField.render(result);
    }
    _prepareNextStep(all, moved) {
        this._energyTypes.forEach(entityType => {
            if (moved[entityType]) {
                moved[entityType].forEach(entity => {
                    this._checkCriticalPoint(entityType, entity, all);
                });
            }
        });
        this._updateState(all);
    }
    _settingsToStopGame() {
        clearInterval(this._timer);
        this._processorState.clear();
        this._isStopGame = true;
    }
    _updateState(all) {
        let newState = {};
        this._energyTypes.forEach(type => {
            newState[type] = all[type].filter(entity => !entity.removed);
        });
        this._processorState.update(newState);
    }
    _shot(type) {
        switch (type) {
            case 'spaceshipBullet': {
                this._spaceShip.getGunCordinates().forEach((item) => {
                    let colaider = {
                        x: item.x + 1,
                        y: item.y,
                        color: "#f00",
                        type: "body"
                    };
                    this._processorState.add({
                        type: 'spaceshipBullet',
                        instance: new index_1.Bullet({ colaider: [new index_1.Point(colaider)] })
                    });
                });
                break;
            }
            case 'enemyBullet': {
                this._starOfDeath.getGunCordinates().forEach((item) => {
                    let colaider = {
                        x: item.x - 2,
                        y: item.y,
                        color: "#eecb0f",
                        type: "body"
                    };
                    this._processorState.add({
                        type: 'enemyBullet',
                        instance: new index_1.Bullet({ colaider: [new index_1.Point(colaider)] })
                    });
                });
                break;
            }
        }
    }
    _generateColaider() {
        let evilXStartPoint = constants_1.FIELD_SIZE.rightX;
        let lastColumnLength = constants_1.FIELD_SIZE.maxLength - this._lengthOfField;
        let evilYStartPoint = Math.round(Math.random() * (constants_1.FIELD_SIZE.bottomY - constants_1.FIELD_SIZE.topY) + constants_1.FIELD_SIZE.topY);
        if (evilYStartPoint >= lastColumnLength)
            evilXStartPoint--;
        return { x: evilXStartPoint, y: evilYStartPoint };
    }
    _generateStarOfDeath() {
        this._starOfDeath = new index_1.StarOfDeath({
            colaider: constants_1.STAR_OF_DEATH_POSITION.map((item) => {
                return new index_1.Point(item);
            })
        });
        this._processorState.add({
            type: 'starOfDeath',
            instance: this._starOfDeath
        });
    }
    _checkScore() {
        this._score += 10;
        console.log(this._score);
        lib_1.EventEmitter.trigger('update score', { score: this._score });
        if (this._score === 600) {
            this._prepareForStarOfDeath();
        }
        else if (this._score % 100 === 0) {
            let currentSpeed = this._energyParams.enemy.duration;
            this._energyParams.enemy.duration = currentSpeed * this._changeDifficulty(this._score);
        }
    }
    _changeDifficulty(score) {
        return (1 - Math.floor(score / 100) / 10);
    }
}
exports.Processor = Processor;

},{"./ProcessorForState":6,"./constants":7,"./entities/index":14,"./lib":16}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProcessorForState {
    constructor(options) {
        this._currentState = {};
        options.types.forEach(type => {
            this._currentState[type] = [];
        });
    }
    add(params) {
        this._currentState[params.type].push(params.instance);
    }
    get() {
        return this._currentState;
    }
    update(newstate) {
        this._currentState = newstate;
    }
    clear() {
        Object.keys(this._currentState).forEach(type => {
            this._currentState[type] = [];
        });
    }
    clearFotStarOfDeath() {
        Object.keys(this._currentState).forEach(type => {
            if (type != "starOfDeath" && type != "spaceship")
                this._currentState[type] = [];
        });
    }
}
exports.ProcessorForState = ProcessorForState;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const KEYBOARDS_CODE = {
    right: 54,
    left: 52,
    down: 53,
    up: 56,
    fire: 102 // f
};
exports.KEYBOARDS_CODE = KEYBOARDS_CODE;
const FIELD_SIZE = {
    leftX: 0,
    rightX: 52,
    topY: 0,
    bottomY: 6,
    columnLength: 7,
    maxLength: 370
};
exports.FIELD_SIZE = FIELD_SIZE;
const START_ENERGY_PARAMS = {
    'enemy': {
        direction: { x: -1, y: 0 },
        duration: 200
    },
    'spaceshipBullet': {
        direction: { x: 1, y: 0 },
        duration: 60
    },
    'enemyBullet': {
        direction: { x: -1, y: 0 },
        duration: 70
    },
    'spaceship': {
        direction: { x: 0, y: 0 },
        duration: 0
    },
    'starOfDeath': {
        direction: { x: -1, y: 0 },
        duration: 500
    }
};
exports.START_ENERGY_PARAMS = START_ENERGY_PARAMS;
const SHIP = {
    START_SHIP_POSITION: [
        { type: 'body', x: 0, y: 2, color: '#00f' },
        { type: 'body', x: 0, y: 3, color: '#00f' },
        { type: 'body', x: 0, y: 4, color: '#00f' },
        { type: 'gun', x: 1, y: 3, color: '#00f' }
    ],
    SPACE_SHIP_DIRECTION: {
        right: { x: 1, y: 0 },
        left: { x: -1, y: 0 },
        down: { x: 0, y: 1 },
        up: { x: 0, y: -1 }
    },
    TIME_OF_DELAY_SHOTTING: 500
};
exports.SHIP = SHIP;
const END_GAME_TEXT = {
    GAME_OVER_TEXT: [
        { x: 1, y: 0, color: 'green', type: 'body' },
        { x: 2, y: 0, color: 'green', type: 'body' },
        { x: 3, y: 0, color: 'green', type: 'body' },
        { x: 9, y: 0, color: 'green', type: 'body' },
        { x: 14, y: 0, color: 'green', type: 'body' },
        { x: 18, y: 0, color: 'green', type: 'body' },
        { x: 20, y: 0, color: 'green', type: 'body' },
        { x: 21, y: 0, color: 'green', type: 'body' },
        { x: 22, y: 0, color: 'green', type: 'body' },
        { x: 27, y: 0, color: 'green', type: 'body' },
        { x: 28, y: 0, color: 'green', type: 'body' },
        { x: 29, y: 0, color: 'green', type: 'body' },
        { x: 32, y: 0, color: 'green', type: 'body' },
        { x: 36, y: 0, color: 'green', type: 'body' },
        { x: 38, y: 0, color: 'green', type: 'body' },
        { x: 39, y: 0, color: 'green', type: 'body' },
        { x: 40, y: 0, color: 'green', type: 'body' },
        { x: 42, y: 0, color: 'green', type: 'body' },
        { x: 43, y: 0, color: 'green', type: 'body' },
        { x: 44, y: 0, color: 'green', type: 'body' },
        { x: 1, y: 1, color: 'green', type: 'body' },
        { x: 8, y: 1, color: 'green', type: 'body' },
        { x: 10, y: 1, color: 'green', type: 'body' },
        { x: 14, y: 1, color: 'green', type: 'body' },
        { x: 15, y: 1, color: 'green', type: 'body' },
        { x: 17, y: 1, color: 'green', type: 'body' },
        { x: 18, y: 1, color: 'green', type: 'body' },
        { x: 20, y: 1, color: 'green', type: 'body' },
        { x: 26, y: 1, color: 'green', type: 'body' },
        { x: 30, y: 1, color: 'green', type: 'body' },
        { x: 32, y: 1, color: 'green', type: 'body' },
        { x: 36, y: 1, color: 'green', type: 'body' },
        { x: 38, y: 1, color: 'green', type: 'body' },
        { x: 42, y: 1, color: 'green', type: 'body' },
        { x: 45, y: 1, color: 'green', type: 'body' },
        { x: 1, y: 2, color: 'green', type: 'body' },
        { x: 8, y: 2, color: 'green', type: 'body' },
        { x: 10, y: 2, color: 'green', type: 'body' },
        { x: 14, y: 2, color: 'green', type: 'body' },
        { x: 16, y: 2, color: 'green', type: 'body' },
        { x: 18, y: 2, color: 'green', type: 'body' },
        { x: 20, y: 2, color: 'green', type: 'body' },
        { x: 26, y: 2, color: 'green', type: 'body' },
        { x: 30, y: 2, color: 'green', type: 'body' },
        { x: 32, y: 2, color: 'green', type: 'body' },
        { x: 36, y: 2, color: 'green', type: 'body' },
        { x: 38, y: 2, color: 'green', type: 'body' },
        { x: 42, y: 2, color: 'green', type: 'body' },
        { x: 45, y: 2, color: 'green', type: 'body' },
        { x: 1, y: 3, color: 'green', type: 'body' },
        { x: 3, y: 3, color: 'green', type: 'body' },
        { x: 4, y: 3, color: 'green', type: 'body' },
        { x: 7, y: 3, color: 'green', type: 'body' },
        { x: 11, y: 3, color: 'green', type: 'body' },
        { x: 14, y: 3, color: 'green', type: 'body' },
        { x: 18, y: 3, color: 'green', type: 'body' },
        { x: 20, y: 3, color: 'green', type: 'body' },
        { x: 21, y: 3, color: 'green', type: 'body' },
        { x: 22, y: 3, color: 'green', type: 'body' },
        { x: 26, y: 3, color: 'green', type: 'body' },
        { x: 30, y: 3, color: 'green', type: 'body' },
        { x: 32, y: 3, color: 'green', type: 'body' },
        { x: 36, y: 3, color: 'green', type: 'body' },
        { x: 38, y: 3, color: 'green', type: 'body' },
        { x: 39, y: 3, color: 'green', type: 'body' },
        { x: 40, y: 3, color: 'green', type: 'body' },
        { x: 42, y: 3, color: 'green', type: 'body' },
        { x: 43, y: 3, color: 'green', type: 'body' },
        { x: 44, y: 3, color: 'green', type: 'body' },
        { x: 1, y: 4, color: 'green', type: 'body' },
        { x: 4, y: 4, color: 'green', type: 'body' },
        { x: 7, y: 4, color: 'green', type: 'body' },
        { x: 8, y: 4, color: 'green', type: 'body' },
        { x: 9, y: 4, color: 'green', type: 'body' },
        { x: 10, y: 4, color: 'green', type: 'body' },
        { x: 11, y: 4, color: 'green', type: 'body' },
        { x: 14, y: 4, color: 'green', type: 'body' },
        { x: 18, y: 4, color: 'green', type: 'body' },
        { x: 20, y: 4, color: 'green', type: 'body' },
        { x: 26, y: 4, color: 'green', type: 'body' },
        { x: 30, y: 4, color: 'green', type: 'body' },
        { x: 32, y: 4, color: 'green', type: 'body' },
        { x: 36, y: 4, color: 'green', type: 'body' },
        { x: 38, y: 4, color: 'green', type: 'body' },
        { x: 42, y: 4, color: 'green', type: 'body' },
        { x: 43, y: 4, color: 'green', type: 'body' },
        { x: 1, y: 5, color: 'green', type: 'body' },
        { x: 4, y: 5, color: 'green', type: 'body' },
        { x: 6, y: 5, color: 'green', type: 'body' },
        { x: 12, y: 5, color: 'green', type: 'body' },
        { x: 14, y: 5, color: 'green', type: 'body' },
        { x: 18, y: 5, color: 'green', type: 'body' },
        { x: 20, y: 5, color: 'green', type: 'body' },
        { x: 26, y: 5, color: 'green', type: 'body' },
        { x: 30, y: 5, color: 'green', type: 'body' },
        { x: 33, y: 5, color: 'green', type: 'body' },
        { x: 35, y: 5, color: 'green', type: 'body' },
        { x: 38, y: 5, color: 'green', type: 'body' },
        { x: 42, y: 5, color: 'green', type: 'body' },
        { x: 44, y: 5, color: 'green', type: 'body' },
        { x: 1, y: 6, color: 'green', type: 'body' },
        { x: 2, y: 6, color: 'green', type: 'body' },
        { x: 3, y: 6, color: 'green', type: 'body' },
        { x: 4, y: 6, color: 'green', type: 'body' },
        { x: 6, y: 6, color: 'green', type: 'body' },
        { x: 12, y: 6, color: 'green', type: 'body' },
        { x: 14, y: 6, color: 'green', type: 'body' },
        { x: 18, y: 6, color: 'green', type: 'body' },
        { x: 20, y: 6, color: 'green', type: 'body' },
        { x: 21, y: 6, color: 'green', type: 'body' },
        { x: 22, y: 6, color: 'green', type: 'body' },
        { x: 27, y: 6, color: 'green', type: 'body' },
        { x: 28, y: 6, color: 'green', type: 'body' },
        { x: 29, y: 6, color: 'green', type: 'body' },
        { x: 34, y: 6, color: 'green', type: 'body' },
        { x: 38, y: 6, color: 'green', type: 'body' },
        { x: 39, y: 6, color: 'green', type: 'body' },
        { x: 40, y: 6, color: 'green', type: 'body' },
        { x: 42, y: 6, color: 'green', type: 'body' },
        { x: 45, y: 6, color: 'green', type: 'body' },
        { x: 47, y: 6, color: 'green', type: 'body' },
        { x: 49, y: 6, color: 'green', type: 'body' },
        { x: 51, y: 6, color: 'green', type: 'body' }
    ],
    WIN_TEXT: [
        { x: 2, y: 0, color: 'green', type: 'body' },
        { x: 6, y: 0, color: 'green', type: 'body' },
        { x: 9, y: 0, color: 'green', type: 'body' },
        { x: 10, y: 0, color: 'green', type: 'body' },
        { x: 11, y: 0, color: 'green', type: 'body' },
        { x: 14, y: 0, color: 'green', type: 'body' },
        { x: 18, y: 0, color: 'green', type: 'body' },
        { x: 23, y: 0, color: 'green', type: 'body' },
        { x: 26, y: 0, color: 'green', type: 'body' },
        { x: 29, y: 0, color: 'green', type: 'body' },
        { x: 31, y: 0, color: 'green', type: 'body' },
        { x: 32, y: 0, color: 'green', type: 'body' },
        { x: 33, y: 0, color: 'green', type: 'body' },
        { x: 34, y: 0, color: 'green', type: 'body' },
        { x: 35, y: 0, color: 'green', type: 'body' },
        { x: 37, y: 0, color: 'green', type: 'body' },
        { x: 43, y: 0, color: 'green', type: 'body' },
        { x: 46, y: 0, color: 'green', type: 'body' },
        { x: 48, y: 0, color: 'green', type: 'body' },
        { x: 50, y: 0, color: 'green', type: 'body' },
        { x: 2, y: 1, color: 'green', type: 'body' },
        { x: 6, y: 1, color: 'green', type: 'body' },
        { x: 8, y: 1, color: 'green', type: 'body' },
        { x: 12, y: 1, color: 'green', type: 'body' },
        { x: 14, y: 1, color: 'green', type: 'body' },
        { x: 18, y: 1, color: 'green', type: 'body' },
        { x: 23, y: 1, color: 'green', type: 'body' },
        { x: 26, y: 1, color: 'green', type: 'body' },
        { x: 29, y: 1, color: 'green', type: 'body' },
        { x: 33, y: 1, color: 'green', type: 'body' },
        { x: 37, y: 1, color: 'green', type: 'body' },
        { x: 38, y: 1, color: 'green', type: 'body' },
        { x: 43, y: 1, color: 'green', type: 'body' },
        { x: 46, y: 1, color: 'green', type: 'body' },
        { x: 48, y: 1, color: 'green', type: 'body' },
        { x: 50, y: 1, color: 'green', type: 'body' },
        { x: 3, y: 2, color: 'green', type: 'body' },
        { x: 5, y: 2, color: 'green', type: 'body' },
        { x: 8, y: 2, color: 'green', type: 'body' },
        { x: 12, y: 2, color: 'green', type: 'body' },
        { x: 14, y: 2, color: 'green', type: 'body' },
        { x: 18, y: 2, color: 'green', type: 'body' },
        { x: 23, y: 2, color: 'green', type: 'body' },
        { x: 26, y: 2, color: 'green', type: 'body' },
        { x: 29, y: 2, color: 'green', type: 'body' },
        { x: 33, y: 2, color: 'green', type: 'body' },
        { x: 37, y: 2, color: 'green', type: 'body' },
        { x: 39, y: 2, color: 'green', type: 'body' },
        { x: 43, y: 2, color: 'green', type: 'body' },
        { x: 46, y: 2, color: 'green', type: 'body' },
        { x: 48, y: 2, color: 'green', type: 'body' },
        { x: 50, y: 2, color: 'green', type: 'body' },
        { x: 4, y: 3, color: 'green', type: 'body' },
        { x: 8, y: 3, color: 'green', type: 'body' },
        { x: 12, y: 3, color: 'green', type: 'body' },
        { x: 14, y: 3, color: 'green', type: 'body' },
        { x: 18, y: 3, color: 'green', type: 'body' },
        { x: 23, y: 3, color: 'green', type: 'body' },
        { x: 26, y: 3, color: 'green', type: 'body' },
        { x: 29, y: 3, color: 'green', type: 'body' },
        { x: 33, y: 3, color: 'green', type: 'body' },
        { x: 37, y: 3, color: 'green', type: 'body' },
        { x: 40, y: 3, color: 'green', type: 'body' },
        { x: 43, y: 3, color: 'green', type: 'body' },
        { x: 46, y: 3, color: 'green', type: 'body' },
        { x: 48, y: 3, color: 'green', type: 'body' },
        { x: 50, y: 3, color: 'green', type: 'body' },
        { x: 4, y: 4, color: 'green', type: 'body' },
        { x: 8, y: 4, color: 'green', type: 'body' },
        { x: 12, y: 4, color: 'green', type: 'body' },
        { x: 14, y: 4, color: 'green', type: 'body' },
        { x: 18, y: 4, color: 'green', type: 'body' },
        { x: 23, y: 4, color: 'green', type: 'body' },
        { x: 26, y: 4, color: 'green', type: 'body' },
        { x: 29, y: 4, color: 'green', type: 'body' },
        { x: 33, y: 4, color: 'green', type: 'body' },
        { x: 37, y: 4, color: 'green', type: 'body' },
        { x: 41, y: 4, color: 'green', type: 'body' },
        { x: 43, y: 4, color: 'green', type: 'body' },
        { x: 46, y: 4, color: 'green', type: 'body' },
        { x: 48, y: 4, color: 'green', type: 'body' },
        { x: 50, y: 4, color: 'green', type: 'body' },
        { x: 4, y: 5, color: 'green', type: 'body' },
        { x: 8, y: 5, color: 'green', type: 'body' },
        { x: 12, y: 5, color: 'green', type: 'body' },
        { x: 15, y: 5, color: 'green', type: 'body' },
        { x: 17, y: 5, color: 'green', type: 'body' },
        { x: 18, y: 5, color: 'green', type: 'body' },
        { x: 24, y: 5, color: 'green', type: 'body' },
        { x: 26, y: 5, color: 'green', type: 'body' },
        { x: 28, y: 5, color: 'green', type: 'body' },
        { x: 33, y: 5, color: 'green', type: 'body' },
        { x: 37, y: 5, color: 'green', type: 'body' },
        { x: 42, y: 5, color: 'green', type: 'body' },
        { x: 43, y: 5, color: 'green', type: 'body' },
        { x: 4, y: 6, color: 'green', type: 'body' },
        { x: 9, y: 6, color: 'green', type: 'body' },
        { x: 10, y: 6, color: 'green', type: 'body' },
        { x: 11, y: 6, color: 'green', type: 'body' },
        { x: 16, y: 6, color: 'green', type: 'body' },
        { x: 18, y: 6, color: 'green', type: 'body' },
        { x: 19, y: 6, color: 'green', type: 'body' },
        { x: 25, y: 6, color: 'green', type: 'body' },
        { x: 27, y: 6, color: 'green', type: 'body' },
        { x: 31, y: 6, color: 'green', type: 'body' },
        { x: 32, y: 6, color: 'green', type: 'body' },
        { x: 33, y: 6, color: 'green', type: 'body' },
        { x: 34, y: 6, color: 'green', type: 'body' },
        { x: 35, y: 6, color: 'green', type: 'body' },
        { x: 37, y: 6, color: 'green', type: 'body' },
        { x: 43, y: 6, color: 'green', type: 'body' },
        { x: 46, y: 6, color: 'green', type: 'body' },
        { x: 48, y: 6, color: 'green', type: 'body' },
        { x: 50, y: 6, color: 'green', type: 'body' }
    ]
};
exports.END_GAME_TEXT = END_GAME_TEXT;
const STAR_OF_DEATH_POSITION = [
    { type: 'body', x: 54, y: 1, color: 'black' },
    { type: 'body', x: 55, y: 1, color: 'black' },
    { type: 'body', x: 53, y: 2, color: 'black' },
    { type: 'body', x: 54, y: 2, color: 'black' },
    { type: 'body', x: 55, y: 2, color: 'black' },
    { type: 'body', x: 56, y: 2, color: 'black' },
    { type: 'body', x: 52, y: 3, color: 'black' },
    { type: 'body', x: 53, y: 3, color: 'black' },
    { type: 'body', x: 54, y: 3, color: 'black' },
    { type: 'body', x: 55, y: 3, color: 'black' },
    { type: 'body', x: 56, y: 3, color: 'black' },
    { type: 'gun', x: 57, y: 3, color: 'black' },
    { type: 'body', x: 53, y: 4, color: 'black' },
    { type: 'body', x: 54, y: 4, color: 'black' },
    { type: 'body', x: 55, y: 4, color: 'black' },
    { type: 'body', x: 56, y: 4, color: 'black' },
    { type: 'body', x: 54, y: 5, color: 'black' },
    { type: 'body', x: 55, y: 5, color: 'black' }
];
exports.STAR_OF_DEATH_POSITION = STAR_OF_DEATH_POSITION;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Energy_1 = require("./Energy");
class Bullet extends Energy_1.Energy {
    constructor(options) {
        super(options);
    }
}
exports.Bullet = Bullet;

},{"./Energy":10}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Energy_1 = require("./Energy");
class Enemyship extends Energy_1.Energy {
    constructor(options) {
        super(options);
    }
}
exports.Enemyship = Enemyship;

},{"./Energy":10}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Energy {
    constructor(options) {
        this.colaider = options.colaider;
        this._time = performance.now();
        this.removed = false;
    }
    move(params) {
        let { direction, duration } = params;
        let timeNow = performance.now();
        if (((timeNow - this._time) / duration) < 1)
            return;
        this.colaider.forEach(point => point.movePoint(direction));
        this._time = timeNow;
        return true;
    }
    checkPosition(colaider) {
        let res = false;
        colaider.forEach(point1 => {
            this.colaider.forEach(point2 => {
                if (point1.isSame(point2))
                    res = true;
            });
        });
        return res;
    }
}
exports.Energy = Energy;

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Point {
    constructor(options) {
        this.type = options.type;
        this.x = options.x;
        this.y = options.y;
        this.color = options.color;
    }
    isSame(colaider) {
        return this.x === colaider.x && this.y === colaider.y;
    }
    movePoint(direction) {
        this.x += direction.x;
        this.y += direction.y;
    }
}
exports.Point = Point;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Energy_1 = require("./Energy");
class Spaceship extends Energy_1.Energy {
    constructor(options) {
        super(options);
    }
    getGunCordinates() {
        return this.colaider.filter((item) => {
            return item.type === 'gun';
        });
    }
}
exports.Spaceship = Spaceship;

},{"./Energy":10}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Energy_1 = require("./Energy");
class StarOfDeath extends Energy_1.Energy {
    constructor(options) {
        super(options);
        this._initAim();
    }
    _initAim() {
        setTimeout(function run() {
            this._generateAim(this.colaider);
            setTimeout(run.bind(this), 400);
        }.bind(this), 400);
    }
    _generateAim(starOfDeathColaider) {
        let aimCoords = this._generateAimColaider(starOfDeathColaider);
        starOfDeathColaider.forEach((item) => {
            if (item.type === 'aim') {
                item.type = 'body';
                item.color = "#000";
            }
            if (item.x === aimCoords.x && item.y === aimCoords.y) {
                item.color = "#f00";
                item.type = 'aim';
            }
        });
    }
    _generateAimColaider(starOfDeathColaider) {
        let bottomPointY = starOfDeathColaider.reduce((max, item) => max.y > item.y ? max : item);
        let topPointY = starOfDeathColaider.reduce((min, item) => min.y < item.y ? min : item);
        let aimY = Math.round(Math.random() * (bottomPointY.y - topPointY.y) + topPointY.y);
        let aimX = starOfDeathColaider.filter((item) => item.y === aimY)
            .reduce((min, item) => min.x < item.x ? min : item)
            .x;
        return { x: aimX, y: aimY };
    }
    getGunCordinates() {
        return this.colaider.filter((item) => {
            return item.type === 'gun';
        });
    }
    getAimColider() {
        return this.colaider.filter(item => item.type === 'aim');
    }
}
exports.StarOfDeath = StarOfDeath;

},{"./Energy":10}],14:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./Point"));
__export(require("./Spaceship"));
__export(require("./Bullet"));
__export(require("./Energy"));
__export(require("./Enemyship"));
__export(require("./StarOfDeath"));

},{"./Bullet":8,"./Enemyship":9,"./Energy":10,"./Point":11,"./Spaceship":12,"./StarOfDeath":13}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("./App");
let app = new App_1.App({
    svg: document.querySelector('.js-calendar-graph-svg')
});

},{"./App":1}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let EventEmitter = {
    "subscribers": {},
    "on": function on(event, cb) {
        let eventType = event || 'default';
        if (!this.subscribers[eventType]) {
            this.subscribers[eventType] = [];
        }
        this.subscribers[eventType].push(cb);
    },
    "off": function off(event, cb) {
        if (this.subscribers[event]) {
            this.subscribers[event] = this.subscribers[event].filter(function (item) {
                return cb !== item;
            });
        }
        else {
            console.error(event + ' not found!');
        }
    },
    "trigger": function trigger(event, options = null) {
        let sub = this.subscribers[event];
        if (sub) {
            for (let i = 0, len = sub.length; i < len; i++) {
                sub[i](options);
            }
        }
        else {
            console.log('EE.trigger: not found subscribers for ' + event + ' event');
        }
    },
    "offAll": function offAll(event) {
        if (this.subscribers[event]) {
            this.subscribers[event] = [];
        }
    }
};
exports.EventEmitter = EventEmitter;
function throttle(func, ms) {
    let state = false, arg = null, context = null;
    return function time() {
        if (state) {
            arg = arguments;
            context = this;
            return;
        }
        state = true;
        func.call(this);
        setTimeout(() => {
            state = false;
            if (arg) {
                time.call(context);
                context = null;
                arg = null;
            }
        }, ms);
    };
}
exports.throttle = throttle;
function concatAll(array) {
    let results = [];
    array.forEach(function (subArray) {
        results.push.apply(results, subArray);
    });
    return results;
}
exports.concatAll = concatAll;

},{}]},{},[15])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9BcHAudHMiLCJhcHAvc2NyaXB0cy9FbmRHYW1lLnRzIiwiYXBwL3NjcmlwdHMvR2FtZS50cyIsImFwcC9zY3JpcHRzL0dhbWVGaWVsZC50cyIsImFwcC9zY3JpcHRzL1Byb2Nlc3Nvci50cyIsImFwcC9zY3JpcHRzL1Byb2Nlc3NvckZvclN0YXRlLnRzIiwiYXBwL3NjcmlwdHMvY29uc3RhbnRzLnRzIiwiYXBwL3NjcmlwdHMvZW50aXRpZXMvQnVsbGV0LnRzIiwiYXBwL3NjcmlwdHMvZW50aXRpZXMvRW5lbXlzaGlwLnRzIiwiYXBwL3NjcmlwdHMvZW50aXRpZXMvRW5lcmd5LnRzIiwiYXBwL3NjcmlwdHMvZW50aXRpZXMvUG9pbnQudHMiLCJhcHAvc2NyaXB0cy9lbnRpdGllcy9TcGFjZXNoaXAudHMiLCJhcHAvc2NyaXB0cy9lbnRpdGllcy9TdGFyT2ZEZWF0aC50cyIsImFwcC9zY3JpcHRzL2VudGl0aWVzL2luZGV4LnRzIiwiYXBwL3NjcmlwdHMvaW5kZXgudHMiLCJhcHAvc2NyaXB0cy9saWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLCtCQUFxQztBQUNyQyxpQ0FBOEI7QUFFOUI7SUFFQyxZQUFZLE9BQXVCO1FBQ2xDLElBQUksSUFBSSxHQUFZLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFFaEMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV0QixJQUFJLFdBQUksQ0FBQyxFQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBRW5FLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLO1lBQzNDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FB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RSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDMUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzFDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDMUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzFDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMxQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDMUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMxQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMxQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDMUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMxQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDMUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMxQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMxQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDMUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMxQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDMUMsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7S0FFOUM7SUFDRCxRQUFRLEVBQUc7UUFDUCxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDMUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMxQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMxQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDMUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzFDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDMUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMxQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMxQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMxQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMxQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMxQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDMUMsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztRQUMzQyxFQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUM7UUFDM0MsRUFBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDO1FBQzNDLEVBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQztLQUU5QztDQUNKLENBQUM7QUF1QjZCLHNDQUFhO0FBckI1QyxNQUFNLHNCQUFzQixHQUFHO0lBQzNCLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQztJQUM1QyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUM7SUFDNUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDO0lBQzVDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQztJQUM1QyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUM7SUFDNUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDO0lBQzVDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQztJQUM1QyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUM7SUFDNUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDO0lBQzVDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQztJQUM1QyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUM7SUFDNUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFDO0lBQzNDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBQztJQUM1QyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUM7SUFDNUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFF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bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tIFwiLi9saWJcIjtcbmltcG9ydCB7IEdhbWUgfSBmcm9tIFwiLi9HYW1lXCI7XG5cbmNsYXNzIEFwcHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiB7c3ZnOiBFbGVtZW50fSl7XG5cdFx0bGV0ICRzdmc6IEVsZW1lbnQgPSBvcHRpb25zLnN2ZztcblxuXHRcdEFwcC5pbml0VG9vbGJhcigkc3ZnKTtcblxuXHRcdG5ldyBHYW1lKHtlbDogJHN2Zywgc2NvcmU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuc2NvcmUtZ2FtZVwiKX0pO1xuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChldmVudCkgPT4ge1xuXHRcdFx0aWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdEV2ZW50RW1pdHRlci50cmlnZ2VyKCdzdGFydCBnYW1lJyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRzdGF0aWMgaW5pdFRvb2xiYXIoc3ZnOkVsZW1lbnQpOnZvaWQge1xuXHRcdGxldCB0b29sYmFyOkhUTUxEaXZFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0dG9vbGJhci5pbm5lckhUTUwgPSBgPGgzIHN0eWxlPVwidGV4dC1hbGlnbjogbGVmdDsgbWFyZ2luLWxlZnQ6IDUwcHg7IGZsb2F0OiBsZWZ0XCIgY2xhc3M9XCJzY29yZS1nYW1lXCI+U2NvcmU6IDA8L2gzPlxuXHRcdFx0XHQ8ZGl2ICBzdHlsZT1cImZsb2F0OiBsZWZ0OyBiYWNrZ3JvdW5kOiAjZWVlOyBsaW5lLWhlaWdodDogNDBweDsgbWFyZ2luLWxlZnQ6IDUwcHg7IHBhZGRpbmc6IDAgMjBweDtcIj5cblx0XHRcdFx0XHQ8c3Ryb25nIHN0eWxlPVwiY29sb3I6ICNmZjc5NzhcIj5FbnRlci08L3N0cm9uZz5TdGFydCBHYW1lIFxuXHRcdFx0XHRcdDxzdHJvbmcgc3R5bGU9XCJjb2xvcjogI2ZmNzk3OFwiPkYtPC9zdHJvbmc+RmlyZSAgXG5cdFx0XHRcdFx0PHN0cm9uZyBzdHlsZT1cImNvbG9yOiAjZmY3OTc4XCI+TnVtIDgtPC9zdHJvbmc+VXAgIFxuXHRcdFx0XHRcdDxzdHJvbmcgc3R5bGU9XCJjb2xvcjogI2ZmNzk3OFwiPk51bSA1LTwvc3Ryb25nPkRvd25cblx0XHRcdFx0XHQ8c3Ryb25nIHN0eWxlPVwiY29sb3I6ICNmZjc5NzhcIj5OdW0gNC08L3N0cm9uZz5MZWZ0XG5cdFx0XHRcdFx0PHN0cm9uZyBzdHlsZT1cImNvbG9yOiAjZmY3OTc4XCI+TnVtIDYtPC9zdHJvbmc+UmlnaHRcblx0XHRcdFx0PC9kaXY+XG5cdFx0XHQ8L0hUTUxEaXZFbGVtZW50PmA7XG5cblx0XHR0b29sYmFyLnN0eWxlLmNzc1RleHQgPSBgXG5cdFx0ICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcblx0XHQgICAgdG9wOiAtNTBweDtcblx0XHQgICAgd2lkdGg6IDEwMCU7XG5cdFx0ICAgIGJhY2tncm91bmQ6ICNmZmY7XG4gICAgICAgIGA7XG5cdFx0KHN2Zy5wYXJlbnROb2RlIGFzIEhUTUxFbGVtZW50KS5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG5cdFx0c3ZnLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodG9vbGJhcik7XG5cblx0fVxuXG59XG5leHBvcnQgeyBBcHAgfTsiLCJpbXBvcnQgeyBFdmVudEVtaXR0ZXJ9IGZyb20gXCIuL2xpYlwiO1xuaW1wb3J0IHsgRU5EX0dBTUVfVEVYVCB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi9lbnRpdGllcy9Qb2ludFwiO1xuaW1wb3J0ICB7IFRDb2xhaWRlciB9IGZyb20gXCIuL3R5cGVzL2dsb2JhbFwiO1xuXG5jbGFzcyBFbmRHYW1lIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBFdmVudEVtaXR0ZXIub24oJ3N0b3AgZ2FtZScsIChkYXRhOiB7dHlwZTogc3RyaW5nfSkgPT4ge1xuICAgICAgICAgICAgRXZlbnRFbWl0dGVyLnRyaWdnZXIoXCJ1cGRhdGUgZmllbGQgb2YgZ2FtZVwiLCB7dGV4dDogdGhpcy5fZW5kT2ZUaGVHYW1lKGRhdGEudHlwZSl9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgX2VuZE9mVGhlR2FtZShlbmRFdmVudFR5cGU6IHN0cmluZyk6IFBvaW50W10ge1xuICAgICAgICBsZXQgZW5kR2FtZVRleHQ6IFBvaW50W107XG4gICAgICAgIGxldCBjdXJyZW50UmVzdWx0VGV4dDogVENvbGFpZGVyW107XG5cbiAgICAgICAgY3VycmVudFJlc3VsdFRleHQgPSAgZW5kRXZlbnRUeXBlID09PSAnbG9zZScgPyAgRU5EX0dBTUVfVEVYVC5HQU1FX09WRVJfVEVYVCA6IEVORF9HQU1FX1RFWFQuV0lOX1RFWFQ7XG4gICAgICAgIGVuZEdhbWVUZXh0ID0gY3VycmVudFJlc3VsdFRleHRcbiAgICAgICAgICAgIC5tYXAoKGl0ZW0pID0+IG5ldyBQb2ludChpdGVtKSApXG4gICAgICAgICAgICAuc29ydCggKCkgPT4gIE1hdGgucmFuZG9tKCkgLSAwLjUgKTtcblxuICAgICAgICByZXR1cm4gZW5kR2FtZVRleHQ7XG4gICAgfVxufVxuXG5leHBvcnQgeyBFbmRHYW1lIH07XG5cbiIsImltcG9ydCB7IEV2ZW50RW1pdHRlcn0gZnJvbSBcIi4vbGliXCI7XG5pbXBvcnQgeyBQcm9jZXNzb3IgfSBmcm9tIFwiLi9Qcm9jZXNzb3JcIjtcbmltcG9ydCB7IEdhbWVGaWVsZCB9IGZyb20gXCIuL0dhbWVGaWVsZFwiO1xuaW1wb3J0IHsgS0VZQk9BUkRTX0NPREUsIFNISVAgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IEVuZEdhbWUgfSBmcm9tIFwiLi9FbmRHYW1lXCI7XG5cbmNsYXNzIEdhbWUge1xuXG4gICAgcHJpdmF0ZSBfZGF0YUZpZWxkOiBHYW1lRmllbGQ7XG4gICAgcHJpdmF0ZSBfc2NvcmVFbGVtZW50OiBFbGVtZW50O1xuICAgIHByaXZhdGUgX3Nob290VGltZTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge2VsOiBFbGVtZW50LCBzY29yZTogRWxlbWVudH0pIHtcblxuICAgICAgICB0aGlzLl9zY29yZUVsZW1lbnQgPSBvcHRpb25zLnNjb3JlO1xuICAgICAgICB0aGlzLl9zaG9vdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgdGhpcy5faW5pdEdhbWVDb21wb25lbnRzKG9wdGlvbnMpO1xuXG5cbiAgICAgICAgdGhpcy5jaGVja1Njb3JlID0gdGhpcy5jaGVja1Njb3JlLmJpbmQodGhpcyk7XG5cblxuICAgICAgICBFdmVudEVtaXR0ZXIub24oXCJ1cGRhdGUgc2NvcmVcIiwgIHRoaXMuY2hlY2tTY29yZSk7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgdGhpcy5jaGVja01vdmUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIF9pbml0R2FtZUNvbXBvbmVudHMob3B0aW9uczoge2VsOiBFbGVtZW50fSkge1xuXG4gICAgICAgIHRoaXMuX2RhdGFGaWVsZCA9IG5ldyBHYW1lRmllbGQoe1xuICAgICAgICAgICAgbGlzdDogb3B0aW9ucy5lbC5xdWVyeVNlbGVjdG9yQWxsKCdyZWN0JylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3IFByb2Nlc3Nvcih7XG4gICAgICAgICAgICBkYXRhRmllbGQ6IHRoaXMuX2RhdGFGaWVsZFxuICAgICAgICB9KTtcblxuICAgICAgICBuZXcgRW5kR2FtZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjaGVja1Njb3JlKGRhdGE6IHtzY29yZTpudW1iZXJ9KTogdm9pZHtcbiAgICAgICAgdGhpcy5fc2NvcmVFbGVtZW50LmlubmVySFRNTCA9IFwiU2NvcmU6IFwiKyBkYXRhLnNjb3JlO1xuICAgIH1cblxuXG4gICAgcHVibGljIGNoZWNrTW92ZShlOktleWJvYXJkRXZlbnQpOnZvaWQge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgbGV0IHsgcmlnaHQsIGxlZnQsIGRvd24sIHVwLCBmaXJlfSA9IEtFWUJPQVJEU19DT0RFO1xuXG4gICAgICAgIGxldCBjb2RlOiBudW1iZXIgPSBlLmtleUNvZGU7XG4gICAgICAgIGlmIChjb2RlICE9PSBmaXJlICYmIGNvZGUgIT09IHVwICYmIGNvZGUgIT09IGRvd24gJiYgY29kZSAhPT0gcmlnaHQgJiYgY29kZSAhPT0gbGVmdCkgcmV0dXJuO1xuXG4gICAgICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgICAgICAgY2FzZSBmaXJlOiB7XG4gICAgICAgICAgICAgICAgbGV0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgICAgICAgIGlmKCAobm93IC0gdGhpcy5fc2hvb3RUaW1lKSAvIFNISVAuVElNRV9PRl9ERUxBWV9TSE9UVElORyA+PSAxKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2hvb3RUaW1lID0gbm93O1xuICAgICAgICAgICAgICAgICAgICBFdmVudEVtaXR0ZXIudHJpZ2dlcignZmlyZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgdXA6IHtcbiAgICAgICAgICAgICAgICBFdmVudEVtaXR0ZXIudHJpZ2dlcignbW92ZScsIHsgZGlyZWN0aW9uOiBcInVwXCJ9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgcmlnaHQ6IHtcbiAgICAgICAgICAgICAgICBFdmVudEVtaXR0ZXIudHJpZ2dlcignbW92ZScsIHsgZGlyZWN0aW9uOiBcInJpZ2h0XCJ9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgbGVmdDoge1xuICAgICAgICAgICAgICAgIEV2ZW50RW1pdHRlci50cmlnZ2VyKCdtb3ZlJywgeyBkaXJlY3Rpb246IFwibGVmdFwifSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIGRvd246IHtcbiAgICAgICAgICAgICAgICBFdmVudEVtaXR0ZXIudHJpZ2dlcignbW92ZScsIHsgZGlyZWN0aW9uOiBcImRvd25cIn0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG59XG5cbmV4cG9ydCB7IEdhbWUgfTsiLCJpbXBvcnQgeyBUR2FtZUZpZWxkIH0gZnJvbSBcIi4vdHlwZXMvZ2xvYmFsXCJcbmltcG9ydCB7IFBvaW50IH0gZnJvbSAgXCIuL2VudGl0aWVzL1BvaW50XCI7XG5pbXBvcnQgIHsgRklFTERfU0laRSB9IGZyb20gXCIuL2NvbnN0YW50c1wiO1xuXG5jbGFzcyBHYW1lRmllbGQge1xuXG4gICAgcHJpdmF0ZSBfZGF0YUZpZWxkOiBUR2FtZUZpZWxkW107XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOnsgbGlzdDogTm9kZUxpc3RPZjxFbGVtZW50Pn0pIHtcbiAgICAgICAgdGhpcy5fZGF0YUZpZWxkID0gdGhpcy5faW5pdERhdGEob3B0aW9ucy5saXN0KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9pbml0RGF0YShyZWN0TGlzdDogTm9kZUxpc3RPZjxFbGVtZW50Pik6IFRHYW1lRmllbGRbXSB7XG4gICAgICAgIGxldCByZXN1bHQ6IGFueVtdID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCByZWN0TGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICAgICAgICAgIGVsOiByZWN0TGlzdFtqXSxcbiAgICAgICAgICAgICAgICBpbmRleDogalxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyByZW5kZXIoY3VycmVudFN0YXRlOiBQb2ludFtdKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2NsZWFyRGF0YSgpO1xuICAgICAgICBsZXQgY3VycmVudEZpZWxkID0gdGhpcy5fY2hlY2tWaXNpYmxlUG9zaXRpb25zKGN1cnJlbnRTdGF0ZSk7XG5cbiAgICAgICAgdGhpcy5fZGF0YUZpZWxkLmZvckVhY2goKGVsZW0pID0+IHtcbiAgICAgICAgICAgIGN1cnJlbnRGaWVsZC5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW0uaW5kZXggPT09IGl0ZW0ueCAqIEZJRUxEX1NJWkUuY29sdW1uTGVuZ3RoICsgaXRlbS55KSB7XG4gICAgICAgICAgICAgICAgICAgIChlbGVtLmVsIGFzIEhUTUxFbGVtZW50KS5zdHlsZS5maWxsID0gaXRlbS5jb2xvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLypwdWJsaWMgZW5kUmVuZGVyKGN1cnJlbnRTdGF0ZTogUG9pbnRbXSk6IHZvaWQge1xuICAgICAgICBsZXQgdGltZXI6IG51bWJlcjtcblxuICAgICAgICB0aGlzLl9jbGVhckRhdGEoKTtcbiAgICAgICAgY3VycmVudFN0YXRlLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGFGaWVsZC5mb3JFYWNoKChlbGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgdGltZXIgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxlbS5pbmRleCA9PT0gaXRlbS54ICogRklFTERfU0laRS5jb2x1bW5MZW5ndGggKyBpdGVtLnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZWxlbS5lbCBhcyBIVE1MRWxlbWVudCkuc3R5bGUuZmlsbCA9IGl0ZW0uY29sb3I7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSk7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGltZXIpO1xuICAgIH0qL1xuXG5cbiAgICBwdWJsaWMgZW5kUmVuZGVyKGN1cnJlbnRTdGF0ZTogUG9pbnRbXSk6IHZvaWQge1xuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICAgIGxldCBpbmRleCA9IDA7XG5cbiAgICAgICAgdGhpcy5fY2xlYXJEYXRhKCk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gcnVuKCkge1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSBjdXJyZW50U3RhdGVbaW5kZXhdO1xuICAgICAgICAgICAgc2VsZi5fZGF0YUZpZWxkLmZvckVhY2goZWxlbSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVsZW0uaW5kZXggPT09IGl0ZW0ueCAqIEZJRUxEX1NJWkUuY29sdW1uTGVuZ3RoICsgaXRlbS55KSB7XG4gICAgICAgICAgICAgICAgICAgIChlbGVtLmVsIGFzIEhUTUxFbGVtZW50KS5zdHlsZS5maWxsID0gaXRlbS5jb2xvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICBpZihpbmRleCAhPT0gY3VycmVudFN0YXRlLmxlbmd0aClzZXRUaW1lb3V0KHJ1bi5iaW5kKHRoaXMpLCAxMCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSwgMTApO1xuXG4gICAgfVxuXG5cbiAgICBwcml2YXRlIF9jbGVhckRhdGEoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2RhdGFGaWVsZC5mb3JFYWNoKChlbGVtKSA9PiB7XG4gICAgICAgICAgICAoZWxlbS5lbCBhcyBIVE1MRWxlbWVudCkuc3R5bGUuZmlsbCA9ICcjZWVlJztcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldExlbmdodG9mRGF0YSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YUZpZWxkLmxlbmd0aDtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9jaGVja1Zpc2libGVQb3NpdGlvbnMoY3VycmVudFN0YXRlOiBQb2ludFtdKTogUG9pbnRbXXsgLy9maWx0ZXIgZXZlcnkgaXRlbXMgdGhhdCBkbyBub3QgaW4gZmllbGRcbiAgICAgICAgcmV0dXJuICBjdXJyZW50U3RhdGUuZmlsdGVyKHBvaW50ID0+IHBvaW50LnggPj0gRklFTERfU0laRS5sZWZ0WCAmJiBwb2ludC54IDw9IEZJRUxEX1NJWkUucmlnaHRYICYmIHBvaW50LnkgPj0gRklFTERfU0laRS50b3BZICYmIHBvaW50LnkgPD0gRklFTERfU0laRS5ib3R0b21ZKTtcbiAgICB9XG59XG5cbmV4cG9ydCB7IEdhbWVGaWVsZCB9OyIsImltcG9ydCB7IEV2ZW50RW1pdHRlciwgY29uY2F0QWxsLCB0aHJvdHRsZX0gZnJvbSBcIi4vbGliXCI7XG5pbXBvcnQgeyBHYW1lRmllbGQgfSBmcm9tIFwiLi9HYW1lRmllbGRcIjtcbmltcG9ydCB7U3BhY2VzaGlwLCBCdWxsZXQsIEVuZW15c2hpcCwgU3Rhck9mRGVhdGgsIFBvaW50IH0gZnJvbSAgXCIuL2VudGl0aWVzL2luZGV4XCI7XG5pbXBvcnQgeyBQcm9jZXNzb3JGb3JTdGF0ZSB9IGZyb20gXCIuL1Byb2Nlc3NvckZvclN0YXRlXCI7XG5pbXBvcnQgeyBTSElQLCBTVEFSVF9FTkVSR1lfUEFSQU1TLCBTVEFSX09GX0RFQVRIX1BPU0lUSU9OLCBGSUVMRF9TSVpFIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0ICB7IFRDb2xhaWRlciwgVERpcmVjdGlvbiB9IGZyb20gXCIuL3R5cGVzL2dsb2JhbFwiO1xuXG5jbGFzcyBQcm9jZXNzb3Ige1xuXHRwcml2YXRlIF9kYXRhRmllbGQ6IEdhbWVGaWVsZDtcblx0cHJpdmF0ZSBfcHJvY2Vzc29yU3RhdGU6IFByb2Nlc3NvckZvclN0YXRlO1xuXHRwcml2YXRlIF9zcGFjZVNoaXA6IFNwYWNlc2hpcDtcblx0cHJpdmF0ZSBfc3Rhck9mRGVhdGg6IFN0YXJPZkRlYXRoO1xuXG5cdHByaXZhdGUgX2lzU3RvcEdhbWU6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfZW5lcmd5UGFyYW1zO1xuXHRwcml2YXRlIF9lbmVyZ3lUeXBlczogc3RyaW5nW10gPSBbXTtcblx0cHJpdmF0ZSBfdGltZURlbGF5U2hvb3Rpbmc6IEZ1bmN0aW9uO1xuXHRwcml2YXRlIF90aW1lcjogbnVtYmVyO1xuXHRwcml2YXRlIF9sZW5ndGhPZkZpZWxkOiBudW1iZXI7XG5cdHByaXZhdGUgX3Njb3JlOm51bWJlciA9IDA7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczoge2RhdGFGaWVsZDogR2FtZUZpZWxkfSkge1xuXG5cdFx0dGhpcy5fZW5lcmd5UGFyYW1zID0ge307XG5cdFx0T2JqZWN0LmtleXMoU1RBUlRfRU5FUkdZX1BBUkFNUykuZm9yRWFjaChrZXkgPT4ge1xuXHRcdFx0dGhpcy5fZW5lcmd5UGFyYW1zW2tleV0gPSBPYmplY3QuYXNzaWduKHt9LCBTVEFSVF9FTkVSR1lfUEFSQU1TW2tleV0pO1xuXHRcdFx0dGhpcy5fZW5lcmd5VHlwZXMucHVzaChrZXkpO1xuXHRcdH0pO1xuXHRcdC8vdGhpcy5fdGltZURlbGF5U2hvb3RpbmcgPSB0aHJvdHRsZSh0aGlzLl9zaG90LmJpbmQodGhpcywgJ3NwYWNlc2hpcEJ1bGxldCcpLCBTSElQLlRJTUVfT0ZfREVMQVlfU0hPVFRJTkcpO1xuXG5cblx0XHR0aGlzLl9kYXRhRmllbGQgPSBvcHRpb25zLmRhdGFGaWVsZDtcblx0XHR0aGlzLl9sZW5ndGhPZkZpZWxkID0gdGhpcy5fZGF0YUZpZWxkLmdldExlbmdodG9mRGF0YSgpO1xuXHRcdHRoaXMuX3Byb2Nlc3NvclN0YXRlID0gbmV3IFByb2Nlc3NvckZvclN0YXRlKHsgdHlwZXM6IHRoaXMuX2VuZXJneVR5cGVzXHR9KTtcblxuXHRcdEV2ZW50RW1pdHRlci5vbignZmlyZScsICgpID0+ICB7XG5cdFx0XHRpZiAoIXRoaXMuX2lzU3RvcEdhbWUpXG5cdFx0XHRcdHRoaXMuX3Nob3QoJ3NwYWNlc2hpcEJ1bGxldCcpO1xuXHRcdH0pO1xuXHRcdEV2ZW50RW1pdHRlci5vbignbW92ZScsIChkYXRhKSA9PiB7XG5cdFx0XHR0aGlzLl9lbmVyZ3lQYXJhbXMuc3BhY2VzaGlwLmRpcmVjdGlvbiA9IFNISVAuU1BBQ0VfU0hJUF9ESVJFQ1RJT05bZGF0YS5kaXJlY3Rpb25dO1xuXHRcdH0gKTtcblxuXHRcdEV2ZW50RW1pdHRlci5vbignc3RhcnQgZ2FtZScsICgpID0+IHtcblx0XHRcdC8vcHJlcGFyZSBnYW1lIHRvIHN0YXJ0XG5cdFx0XHR0aGlzLl9wcmVwYXJlR2FtZUZpZWxkVG9TdGFydCgpO1xuXHRcdFx0Ly9zdGFydFxuXHRcdFx0dGhpcy5fc3RhcnRQcm9jZXNzKCk7XG5cdFx0fSk7XG5cblx0XHRFdmVudEVtaXR0ZXIub24oXCJ1cGRhdGUgZmllbGQgb2YgZ2FtZVwiLCAoZGF0YSkgPT4ge1xuXHRcdFx0dGhpcy5fZGF0YUZpZWxkLmVuZFJlbmRlcihkYXRhLnRleHQpO1xuXHRcdFx0dGhpcy5faXNTdG9wR2FtZSA9IHRydWU7XG5cdFx0fSk7XG5cblx0fVxuXG5cdHByaXZhdGUgX3ByZXBhcmVHYW1lRmllbGRUb1N0YXJ0KCk6IHZvaWQge1xuXHRcdHRoaXMuX2RhdGFGaWVsZC5yZW5kZXIoW10pO1xuXHRcdEV2ZW50RW1pdHRlci50cmlnZ2VyKFwidXBkYXRlIHNjb3JlXCIsIHtzY29yZTogMH0pOyBcdC8vcmVzZXQgc2NvcmVcblxuXG5cdFx0dGhpcy5fZW5lcmd5UGFyYW1zW1wiZW5lbXlcIl0uZHVyYXRpb24gPSBTVEFSVF9FTkVSR1lfUEFSQU1TLmVuZW15LmR1cmF0aW9uO1xuXHRcdHRoaXMuX3Njb3JlID0gMDtcblxuXHRcdHRoaXMuX3Byb2Nlc3NvclN0YXRlLmNsZWFyKCk7ICBcdC8vZGVsZXRlIGFsbCBlbnRpdGllcyBvbiBmaWVsZFxuXHRcdGNsZWFySW50ZXJ2YWwodGhpcy5fdGltZXIpO1x0XHQvL3N0b3AgYWxsIGVuZW15XG5cdFx0aWYgKHRoaXMuX2lzU3RvcEdhbWUpIHRoaXMuX2lzU3RvcEdhbWUgPSBmYWxzZTtcblx0fVxuXG5cdHByaXZhdGUgX3N0YXJ0UHJvY2VzcygpOiB2b2lkIHtcblx0XHR0aGlzLl9zcGFjZVNoaXAgPSB0aGlzLl9jcmVhdGVTcGFjZVNoaXAoKTtcblxuXHRcdHRoaXMuX3RpbWVyID0gdGhpcy5fZ2VuZXJhdGVFdmlsKCk7XG5cblx0XHR0aGlzLl9wcm9jZXNzb3JTdGF0ZS5hZGQoe1xuXHRcdFx0dHlwZTogJ3NwYWNlc2hpcCcsXG5cdFx0XHRpbnN0YW5jZTogdGhpcy5fc3BhY2VTaGlwXG5cdFx0fSk7XG5cblx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uIF9fYW5pbWF0ZUxvb3AoKSB7XG5cdFx0XHRpZihzZWxmLl9pc1N0b3BHYW1lKSByZXR1cm47XG5cdFx0XHRsZXQgeyBtb3ZlZCwgYWxsIH0gPSBzZWxmLl9tb3ZlQWxsRW50aXRpZXMoKTtcblx0XHRcdHNlbGYuX2RyYXcoYWxsKTtcblx0XHRcdHNlbGYuX3ByZXBhcmVOZXh0U3RlcChhbGwsIG1vdmVkKTtcblx0XHRcdHNlbGYuX2VuZXJneVBhcmFtcy5zcGFjZXNoaXAuZGlyZWN0aW9uID0ge3g6IDAsIHk6IDB9O1xuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKF9fYW5pbWF0ZUxvb3ApO1xuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBfY3JlYXRlU3BhY2VTaGlwKCk6IFNwYWNlc2hpcCB7XG5cdFx0cmV0dXJuIG5ldyBTcGFjZXNoaXAoe1xuXHRcdFx0Y29sYWlkZXI6IFNISVAuU1RBUlRfU0hJUF9QT1NJVElPTi5tYXAoKGl0ZW0pID0+IHtcblx0XHRcdFx0cmV0dXJuIG5ldyBQb2ludChpdGVtKTtcblx0XHRcdH0pXG5cdFx0fSk7XG5cdH1cblxuXHRwcml2YXRlIF9jcmVhdGVFbmVteVNoaXAoKTogRW5lbXlzaGlwIHtcblx0XHRsZXQge3gsIHl9ID0gdGhpcy5fZ2VuZXJhdGVDb2xhaWRlcigpO1xuXHRcdHJldHVybiBuZXcgRW5lbXlzaGlwKHtjb2xhaWRlcjogW1xuXHRcdFx0bmV3IFBvaW50KHsgdHlwZTogJ2JvZHknLCB4OiB4LCB5OiB5LCBjb2xvcjogXCJncmVlblwifSksXG5cdFx0XHRuZXcgUG9pbnQoeyB0eXBlOiAnYm9keScsIHg6IHggKyAxLCB5OiB5LCBjb2xvcjogXCJncmVlblwifSlcblx0XHRdfSlcblx0fVxuXG5cdHByaXZhdGUgX2dlbmVyYXRlRXZpbCgpOiBudW1iZXIge1xuXHRcdGxldCB0aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcblx0XHRcdHRoaXMuX3Byb2Nlc3NvclN0YXRlLmFkZCh7XG5cdFx0XHRcdHR5cGU6ICdlbmVteScsXG5cdFx0XHRcdGluc3RhbmNlOiB0aGlzLl9jcmVhdGVFbmVteVNoaXAoKVxuXHRcdFx0fSk7XG5cdFx0fSwgMTAwMCk7XG5cdFx0cmV0dXJuIHRpbWVyO1xuXHR9XG5cblx0cHJpdmF0ZSBfcHJlcGFyZUZvclN0YXJPZkRlYXRoKCk6IHZvaWQge1xuXHRcdGNsZWFySW50ZXJ2YWwodGhpcy5fdGltZXIpO1xuXHRcdHRoaXMuX3Byb2Nlc3NvclN0YXRlLmNsZWFyRm90U3Rhck9mRGVhdGgoKTtcblx0XHR0aGlzLl9nZW5lcmF0ZVN0YXJPZkRlYXRoKCk7XG5cblx0XHR0aGlzLl90aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcblx0XHRcdHRoaXMuX3Nob3QoXCJlbmVteUJ1bGxldFwiKTtcblx0XHR9LCA4MDApO1xuXHR9XG5cblxuXHRwcml2YXRlIF9tb3ZlQWxsRW50aXRpZXMoKTogYW55IHtcblx0XHRsZXQgZW50aXRpZXM6IGFueSA9IHRoaXMuX3Byb2Nlc3NvclN0YXRlLmdldCgpO1xuXHRcdGxldCBtb3ZlZEVudGl0aWVzOiBhbnkgID0ge307XG5cblx0XHR0aGlzLl9lbmVyZ3lUeXBlcy5mb3JFYWNoKCBrZXkgPT4ge1xuXHRcdFx0aWYgKGtleSA9PSBcInNwYWNlc2hpcFwiKSB7XG5cblx0XHRcdFx0bGV0IHRhaWxQb3NpdGlvbiA9IHRoaXMuX3NwYWNlU2hpcC5jb2xhaWRlci5yZWR1Y2UoKG1pbiwgaXRlbSkgPT4gIG1pbi54IDwgaXRlbS54ID8gbWluIDogaXRlbSApO1xuXHRcdFx0XHRsZXQgZ3VuUG9zaXRpb24gPSBbXTtcblxuXHRcdFx0XHR0aGlzLl9zcGFjZVNoaXAuY29sYWlkZXIuZm9yRWFjaCgoaXRlbSkgPT4ge1xuXHRcdFx0XHRcdGlmIChpdGVtLnR5cGUgPT09ICdndW4nKSBndW5Qb3NpdGlvbi5wdXNoKGl0ZW0pO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRsZXQgeSA9IHRoaXMuX2VuZXJneVBhcmFtcy5zcGFjZXNoaXAuZGlyZWN0aW9uLnk7XG5cdFx0XHRcdGxldCB4ID0gdGhpcy5fZW5lcmd5UGFyYW1zLnNwYWNlc2hpcC5kaXJlY3Rpb24ueDtcblxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGd1blBvc2l0aW9uLmxlbmd0aDsgaSsrKXtcblx0XHRcdFx0XHRpZiAoKGd1blBvc2l0aW9uW2ldLnkgPT09IEZJRUxEX1NJWkUuYm90dG9tWSAmJiB5ID4gMClcblx0XHRcdFx0XHRcdHx8IChndW5Qb3NpdGlvbltpXS55ID09PSBGSUVMRF9TSVpFLnRvcFkgJiYgeSA8IDApXG5cdFx0XHRcdFx0XHR8fCAodGFpbFBvc2l0aW9uLnggPT09IEZJRUxEX1NJWkUubGVmdFggJiYgeCA8IDApXG5cdFx0XHRcdFx0XHR8fCAoZ3VuUG9zaXRpb25baV0ueCA9PT0gRklFTERfU0laRS5yaWdodFggJiYgeCA+IDApKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbnRpdGllc1trZXldLmZvckVhY2goIGVudGl0eSA9PiB7XG5cdFx0XHRcdGxldCBtb3ZlZCA9IGVudGl0eS5tb3ZlKHRoaXMuX2VuZXJneVBhcmFtc1trZXldKTtcblxuXHRcdFx0XHRpZihtb3ZlZCkge1xuXHRcdFx0XHRcdG1vdmVkRW50aXRpZXNba2V5XSA/IG1vdmVkRW50aXRpZXNba2V5XS5wdXNoKGVudGl0eSkgOiBtb3ZlZEVudGl0aWVzW2tleV0gPSBbZW50aXR5XTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0bW92ZWQ6IG1vdmVkRW50aXRpZXMsXG5cdFx0XHRhbGw6IGVudGl0aWVzXG5cdFx0fTtcblx0fVxuXG5cblx0cHJpdmF0ZSBfY2hlY2tDcml0aWNhbFBvaW50KGtleTogc3RyaW5nLCBlbnRpdHksIGVudGl0aWVzKTogdm9pZCB7XG5cdFx0c3dpdGNoIChrZXkpIHtcblx0XHRcdGNhc2UgXCJzcGFjZXNoaXBcIjoge1xuXHRcdFx0XHR0aGlzLmNoZWNrQ3Jhc2goZW50aXRpZXNbJ2VuZW15J10sIGVudGl0eSk7XG5cdFx0XHRcdHRoaXMuY2hlY2tDcmFzaChlbnRpdGllc1snZW5lbXlCdWxsZXQnXSwgZW50aXR5KTtcblx0XHRcdFx0dGhpcy5jaGVja0NyYXNoKGVudGl0aWVzWydzdGFyT2ZEZWF0aCddLCBlbnRpdHkpO1xuXG5cdFx0XHRcdGlmIChlbnRpdHkucmVtb3ZlZCkge1xuXHRcdFx0XHRcdHRoaXMuX3NldHRpbmdzVG9TdG9wR2FtZSgpO1xuXHRcdFx0XHRcdHRoaXMuX3Jlc3VsdE9mQWN0aW9uKFwibG9zZVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdFx0Y2FzZSBcInNwYWNlc2hpcEJ1bGxldFwiOiB7XG5cdFx0XHRcdHRoaXMuY2hlY2tDcmFzaChlbnRpdGllc1snZW5lbXknXSwgZW50aXR5KTtcblx0XHRcdFx0dGhpcy5jaGVja0NyYXNoKGVudGl0aWVzWydlbmVteUJ1bGxldCddLCBlbnRpdHkpO1xuXG5cdFx0XHRcdGlmKGVudGl0eS5yZW1vdmVkKSB7XG5cdFx0XHRcdFx0dGhpcy5fcmVzdWx0T2ZBY3Rpb24oXCJraWxsXCIpO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbnRpdGllc1snc3Rhck9mRGVhdGgnXS5mb3JFYWNoKGl0ZW0gPT4ge1xuXHRcdFx0XHRcdGlmIChpdGVtLmNoZWNrUG9zaXRpb24oZW50aXR5LmNvbGFpZGVyKSkge1xuXHRcdFx0XHRcdFx0ZW50aXR5LnJlbW92ZWQgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIGVudGl0eS5jaGVja1Bvc2l0aW9uKGl0ZW0uZ2V0QWltQ29saWRlcigpICkgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLl9yZXN1bHRPZkFjdGlvbihcIndpblwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChlbnRpdHkuY29sYWlkZXIueCA+IEZJRUxEX1NJWkUucmlnaHRYKSBlbnRpdHkucmVtb3ZlZCA9IHRydWU7XG5cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cblx0XHRcdGNhc2UgXCJlbmVteVwiOiB7XG5cdFx0XHRcdHRoaXMuY2hlY2tDcmFzaChlbnRpdGllc1snc3BhY2VzaGlwQnVsbGV0J10sIGVudGl0eSk7XG5cdFx0XHRcdHRoaXMuY2hlY2tDcmFzaChlbnRpdGllc1snc3BhY2VzaGlwJ10sIGVudGl0eSk7XG5cblx0XHRcdFx0aWYoZW50aXR5LnJlbW92ZWQpIHtcblx0XHRcdFx0XHR0aGlzLl9yZXN1bHRPZkFjdGlvbihcImtpbGxcIik7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKHRoaXMuX3NwYWNlU2hpcC5yZW1vdmVkKXtcblx0XHRcdFx0XHR0aGlzLl9yZXN1bHRPZkFjdGlvbihcImxvc2VcIik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgaXNJbkZpZWxkID0gZW50aXR5LmNvbGFpZGVyLmZpbHRlciggcG9pbnQgPT4gcG9pbnQueCA+IEZJRUxEX1NJWkUubGVmdFgpO1xuXHRcdFx0XHRpZighaXNJbkZpZWxkLmxlbmd0aCkgZW50aXR5LnJlbW92ZWQgPSB0cnVlO1xuXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXG5cdFx0XHRjYXNlIFwiZW5lbXlCdWxsZXRcIjoge1xuXHRcdFx0XHR0aGlzLmNoZWNrQ3Jhc2goZW50aXRpZXNbJ3NwYWNlc2hpcEJ1bGxldCddLCBlbnRpdHkpO1xuXHRcdFx0XHR0aGlzLmNoZWNrQ3Jhc2goZW50aXRpZXNbJ3NwYWNlc2hpcCddLCBlbnRpdHkpO1xuXG5cdFx0XHRcdGlmIChlbnRpdHkuY29sYWlkZXIueCA8IEZJRUxEX1NJWkUubGVmdFggKSBlbnRpdHkucmVtb3ZlZCA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXG5cdFx0XHRjYXNlIFwic3Rhck9mRGVhdGhcIjoge1xuXHRcdFx0XHR0aGlzLmNoZWNrQ3Jhc2goZW50aXRpZXNbJ3NwYWNlc2hpcCddLCBlbnRpdHkpO1xuXG5cdFx0XHRcdGlmIChlbnRpdHkuZ2V0R3VuQ29yZGluYXRlcygpLnggPCBGSUVMRF9TSVpFLmxlZnRYICkgZW50aXR5LnJlbW92ZWQgPSB0cnVlO1xuXHRcdFx0XHRlbnRpdGllc1snc3BhY2VzaGlwQnVsbGV0J10uZm9yRWFjaChidWxsZXQgPT4ge1xuXHRcdFx0XHRcdGlmIChidWxsZXQuY2hlY2tQb3NpdGlvbihlbnRpdHkuY29sYWlkZXIpKSB7XG5cdFx0XHRcdFx0XHRidWxsZXQucmVtb3ZlZCA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCBidWxsZXQuY2hlY2tQb3NpdGlvbihlbnRpdHkuZ2V0QWltQ29saWRlcigpICkgKSB7XG5cdFx0XHRcdFx0XHR0aGlzLl9yZXN1bHRPZkFjdGlvbihcIndpblwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblxuXHRwcml2YXRlIF9yZXN1bHRPZkFjdGlvbih0eXBlOnN0cmluZyk6IHZvaWQge1xuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Y2FzZSBcImxvc2VcIjoge1xuXHRcdFx0XHRFdmVudEVtaXR0ZXIudHJpZ2dlcihcInN0b3AgZ2FtZVwiLCB7IHR5cGU6IFwibG9zZVwiIH0pO1xuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdFx0Y2FzZSBcIndpblwiOiB7XG5cdFx0XHRcdEV2ZW50RW1pdHRlci50cmlnZ2VyKCdzdG9wIGdhbWUnLCB7dHlwZTogJ3dpbid9KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRjYXNlIFwia2lsbFwiOiB7XG5cdFx0XHRcdHRoaXMuX2NoZWNrU2NvcmUoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXG5cdHB1YmxpYyBjaGVja0NyYXNoKGVudGl0aWVzLCBjdXJyZW50RW50aXR5KSB7XG5cdFx0ZW50aXRpZXMuZm9yRWFjaChlbnRpdHkgPT4ge1xuXHRcdFx0aWYgKGVudGl0eS5jaGVja1Bvc2l0aW9uKGN1cnJlbnRFbnRpdHkuY29sYWlkZXIpKSB7XG5cdFx0XHRcdGVudGl0eS5yZW1vdmVkID0gdHJ1ZTtcblx0XHRcdFx0Y3VycmVudEVudGl0eS5yZW1vdmVkID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cblxuXHRwcml2YXRlIF9kcmF3KGFycjphbnkpOiB2b2lkIHtcblx0XHRsZXQgY3VycmVudDogVENvbGFpZGVyW10gPSBbXTtcblx0XHR0aGlzLl9lbmVyZ3lUeXBlcy5mb3JFYWNoKGVudGl0eVR5cGUgPT4ge1xuXHRcdFx0YXJyW2VudGl0eVR5cGVdLmZvckVhY2goIGl0ZW0gPT4ge1xuXHRcdFx0XHRjdXJyZW50LnB1c2goaXRlbS5jb2xhaWRlcik7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHRsZXQgcmVzdWx0ID0gY29uY2F0QWxsKGN1cnJlbnQpO1xuXHRcdHRoaXMuX2RhdGFGaWVsZC5yZW5kZXIocmVzdWx0KTtcblx0fVxuXG5cblx0cHJpdmF0ZSBfcHJlcGFyZU5leHRTdGVwKGFsbCwgbW92ZWQpOiB2b2lkIHtcblx0XHR0aGlzLl9lbmVyZ3lUeXBlcy5mb3JFYWNoKCBlbnRpdHlUeXBlID0+IHtcblx0XHRcdGlmKG1vdmVkW2VudGl0eVR5cGVdKXtcblx0XHRcdFx0bW92ZWRbZW50aXR5VHlwZV0uZm9yRWFjaChlbnRpdHkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX2NoZWNrQ3JpdGljYWxQb2ludChlbnRpdHlUeXBlLCBlbnRpdHksIGFsbCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHRoaXMuX3VwZGF0ZVN0YXRlKGFsbCk7XG5cdH1cblxuXHRwcml2YXRlIF9zZXR0aW5nc1RvU3RvcEdhbWUoKTogdm9pZCB7XG5cdFx0Y2xlYXJJbnRlcnZhbCh0aGlzLl90aW1lcik7XG5cdFx0dGhpcy5fcHJvY2Vzc29yU3RhdGUuY2xlYXIoKTtcblx0XHR0aGlzLl9pc1N0b3BHYW1lID0gdHJ1ZTtcblx0fVxuXG5cblx0cHJpdmF0ZSBfdXBkYXRlU3RhdGUoYWxsKTogdm9pZHtcblx0XHRsZXQgbmV3U3RhdGU6IGFueSA9IHt9O1xuXHRcdHRoaXMuX2VuZXJneVR5cGVzLmZvckVhY2goIHR5cGUgPT4ge1xuXHRcdFx0bmV3U3RhdGVbdHlwZV0gPSBhbGxbdHlwZV0uZmlsdGVyKCBlbnRpdHkgPT4gIWVudGl0eS5yZW1vdmVkICk7XG5cdFx0fSApO1xuXHRcdHRoaXMuX3Byb2Nlc3NvclN0YXRlLnVwZGF0ZShuZXdTdGF0ZSk7XG5cdH1cblxuXHRwcml2YXRlIF9zaG90KHR5cGU6IHN0cmluZyk6IHZvaWQge1xuXHRcdHN3aXRjaCAodHlwZSkge1xuXHRcdFx0Y2FzZSAnc3BhY2VzaGlwQnVsbGV0Jzoge1xuXHRcdFx0XHR0aGlzLl9zcGFjZVNoaXAuZ2V0R3VuQ29yZGluYXRlcygpLmZvckVhY2goKGl0ZW0pID0+IHtcblx0XHRcdFx0XHRsZXQgY29sYWlkZXI6IFRDb2xhaWRlciA9IHtcblx0XHRcdFx0XHRcdHg6IGl0ZW0ueCArIDEsXG5cdFx0XHRcdFx0XHR5OiBpdGVtLnksXG5cdFx0XHRcdFx0XHRjb2xvcjogXCIjZjAwXCIsXG5cdFx0XHRcdFx0XHR0eXBlOiBcImJvZHlcIlxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHR0aGlzLl9wcm9jZXNzb3JTdGF0ZS5hZGQoe1xuXHRcdFx0XHRcdFx0dHlwZTogJ3NwYWNlc2hpcEJ1bGxldCcsXG5cdFx0XHRcdFx0XHRpbnN0YW5jZTogbmV3IEJ1bGxldCh7Y29sYWlkZXI6IFtuZXcgUG9pbnQoY29sYWlkZXIpXX0pXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXG5cdFx0XHRjYXNlICdlbmVteUJ1bGxldCc6IHtcblx0XHRcdFx0dGhpcy5fc3Rhck9mRGVhdGguZ2V0R3VuQ29yZGluYXRlcygpLmZvckVhY2goKGl0ZW0pID0+IHtcblx0XHRcdFx0XHRsZXQgY29sYWlkZXI6IFRDb2xhaWRlciA9IHtcblx0XHRcdFx0XHRcdHg6IGl0ZW0ueCAtIDIsXG5cdFx0XHRcdFx0XHR5OiBpdGVtLnksXG5cdFx0XHRcdFx0XHRjb2xvcjogXCIjZWVjYjBmXCIsXG5cdFx0XHRcdFx0XHR0eXBlOiBcImJvZHlcIlxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0dGhpcy5fcHJvY2Vzc29yU3RhdGUuYWRkKHtcblx0XHRcdFx0XHRcdHR5cGU6ICdlbmVteUJ1bGxldCcsXG5cdFx0XHRcdFx0XHRpbnN0YW5jZTogbmV3IEJ1bGxldCh7Y29sYWlkZXI6IFtuZXcgUG9pbnQoY29sYWlkZXIpXX0pXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXG5cdHByaXZhdGUgX2dlbmVyYXRlQ29sYWlkZXIoKTogVERpcmVjdGlvbntcblx0XHRsZXQgZXZpbFhTdGFydFBvaW50ID0gRklFTERfU0laRS5yaWdodFg7XG5cdFx0bGV0IGxhc3RDb2x1bW5MZW5ndGggPSBGSUVMRF9TSVpFLm1heExlbmd0aCAtIHRoaXMuX2xlbmd0aE9mRmllbGQ7XG5cdFx0bGV0IGV2aWxZU3RhcnRQb2ludCA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIChGSUVMRF9TSVpFLmJvdHRvbVkgLSBGSUVMRF9TSVpFLnRvcFkpICsgRklFTERfU0laRS50b3BZKTtcblxuXHRcdGlmIChldmlsWVN0YXJ0UG9pbnQgPj0gbGFzdENvbHVtbkxlbmd0aCkgZXZpbFhTdGFydFBvaW50LS07XG5cblx0XHRyZXR1cm4ge3g6IGV2aWxYU3RhcnRQb2ludCwgeTogZXZpbFlTdGFydFBvaW50fTtcblx0fVxuXG5cdHByaXZhdGUgX2dlbmVyYXRlU3Rhck9mRGVhdGgoKTp2b2lkIHtcblx0XHR0aGlzLl9zdGFyT2ZEZWF0aCA9IG5ldyBTdGFyT2ZEZWF0aCh7XG5cdFx0XHRjb2xhaWRlcjogU1RBUl9PRl9ERUFUSF9QT1NJVElPTi5tYXAoKGl0ZW0pID0+IHtcblx0XHRcdFx0cmV0dXJuIG5ldyBQb2ludChpdGVtKTtcblx0XHRcdH0pXG5cdFx0fSk7XG5cblx0XHR0aGlzLl9wcm9jZXNzb3JTdGF0ZS5hZGQoe1xuXHRcdFx0dHlwZTogJ3N0YXJPZkRlYXRoJyxcblx0XHRcdGluc3RhbmNlOiB0aGlzLl9zdGFyT2ZEZWF0aFxuXHRcdH0pO1xuXHR9XG5cblx0cHJpdmF0ZSBfY2hlY2tTY29yZSgpe1xuXHRcdHRoaXMuX3Njb3JlICs9IDEwO1xuXHRcdGNvbnNvbGUubG9nKHRoaXMuX3Njb3JlKTtcblx0XHRFdmVudEVtaXR0ZXIudHJpZ2dlcigndXBkYXRlIHNjb3JlJywge3Njb3JlOiB0aGlzLl9zY29yZX0pO1xuXHRcdGlmKHRoaXMuX3Njb3JlID09PSA2MDApe1xuXHRcdFx0dGhpcy5fcHJlcGFyZUZvclN0YXJPZkRlYXRoKCk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9zY29yZSAlIDEwMCA9PT0gMCkge1xuXHRcdFx0bGV0IGN1cnJlbnRTcGVlZCA9IHRoaXMuX2VuZXJneVBhcmFtcy5lbmVteS5kdXJhdGlvbjtcblx0XHRcdHRoaXMuX2VuZXJneVBhcmFtcy5lbmVteS5kdXJhdGlvbiA9ICBjdXJyZW50U3BlZWQgKiB0aGlzLl9jaGFuZ2VEaWZmaWN1bHR5KHRoaXMuX3Njb3JlKTtcblxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgX2NoYW5nZURpZmZpY3VsdHkoc2NvcmU6bnVtYmVyKTpudW1iZXIge1xuXHRcdHJldHVybiAoMSAtIE1hdGguZmxvb3IoIHNjb3JlIC8gMTAwICkgLyAxMCk7XG5cdH1cbn1cblxuZXhwb3J0IHsgUHJvY2Vzc29yIH07IiwiY2xhc3MgUHJvY2Vzc29yRm9yU3RhdGV7XG5cbiAgICBwcml2YXRlIF9jdXJyZW50U3RhdGU6IGFueSA9IHt9O1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge3R5cGVzOiBzdHJpbmdbXX0pIHtcbiAgICAgICAgb3B0aW9ucy50eXBlcy5mb3JFYWNoKHR5cGUgPT4ge1xuICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlW3R5cGVdID0gW107XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGQocGFyYW1zOiB7dHlwZTogc3RyaW5nLCBpbnN0YW5jZTogYW55fSk6IHZvaWR7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRTdGF0ZVtwYXJhbXMudHlwZV0ucHVzaChwYXJhbXMuaW5zdGFuY2UpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQoKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRTdGF0ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdXBkYXRlKG5ld3N0YXRlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlID0gbmV3c3RhdGU7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLl9jdXJyZW50U3RhdGUpLmZvckVhY2godHlwZSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50U3RhdGVbdHlwZV0gPSBbXTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyRm90U3Rhck9mRGVhdGgoKTogdm9pZCB7XG4gICAgICAgIE9iamVjdC5rZXlzKHRoaXMuX2N1cnJlbnRTdGF0ZSkuZm9yRWFjaCh0eXBlID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlICE9IFwic3Rhck9mRGVhdGhcIiAmJiB0eXBlICE9IFwic3BhY2VzaGlwXCIpXG4gICAgICAgICAgICAgICAgdGhpcy5fY3VycmVudFN0YXRlW3R5cGVdID0gW107XG4gICAgICAgIH0pO1xuICAgIH1cblxufVxuXG5leHBvcnQgeyBQcm9jZXNzb3JGb3JTdGF0ZSB9OyIsImNvbnN0IEtFWUJPQVJEU19DT0RFID0ge1xuICAgIHJpZ2h0OiA1NCwgLy8gbnVtcGFkIDZcbiAgICBsZWZ0OiA1MiwgLy8gbnVtcGFkIDRcbiAgICBkb3duOiA1MywgLy8gbnVtcGFkIDhcbiAgICB1cDogNTYsIC8vIG51bXBhZCA4XG4gICAgZmlyZTogMTAyIC8vIGZcbn07XG5cbmNvbnN0IEZJRUxEX1NJWkUgPSB7XG4gICAgbGVmdFg6IDAsXG4gICAgcmlnaHRYOiA1MixcbiAgICB0b3BZOiAwLFxuICAgIGJvdHRvbVk6IDYsXG4gICAgY29sdW1uTGVuZ3RoOiA3LFxuICAgIG1heExlbmd0aDogMzcwXG59O1xuXG5jb25zdCBTVEFSVF9FTkVSR1lfUEFSQU1TID0ge1xuICAgICdlbmVteSc6IHtcbiAgICAgICAgZGlyZWN0aW9uOiB7IHg6IC0xLCB5OiAwIH0sXG4gICAgICAgIGR1cmF0aW9uOiAyMDBcbiAgICB9LFxuICAgICdzcGFjZXNoaXBCdWxsZXQnOiB7XG4gICAgICAgIGRpcmVjdGlvbjogeyB4OiAxLCB5OiAwIH0sXG4gICAgICAgIGR1cmF0aW9uOiA2MFxuICAgIH0sXG4gICAgJ2VuZW15QnVsbGV0Jzoge1xuICAgICAgICBkaXJlY3Rpb246IHsgeDogLTEsIHk6IDAgfSxcbiAgICAgICAgZHVyYXRpb246IDcwXG4gICAgfSxcbiAgICAnc3BhY2VzaGlwJzp7XG4gICAgICAgIGRpcmVjdGlvbjoge3g6IDAsIHk6IDB9LFxuICAgICAgICBkdXJhdGlvbjogMFxuICAgIH0sXG4gICAgJ3N0YXJPZkRlYXRoJzoge1xuICAgICAgICBkaXJlY3Rpb246IHsgeDogLTEsIHk6IDAgfSxcbiAgICAgICAgZHVyYXRpb246IDUwMFxuICAgIH1cbn07XG5cbmNvbnN0IFNISVAgPSB7XG4gICAgU1RBUlRfU0hJUF9QT1NJVElPTiA6IFtcbiAgICAgICAgeyB0eXBlOiAnYm9keScsIHg6MCwgeTogMiwgY29sb3I6ICcjMDBmJyB9LFxuICAgICAgICB7IHR5cGU6ICdib2R5JywgeDowLCB5OiAzLCBjb2xvcjogJyMwMGYnIH0sXG4gICAgICAgIHsgdHlwZTogJ2JvZHknLCB4OjAsIHk6IDQsIGNvbG9yOiAnIzAwZicgfSxcbiAgICAgICAgeyB0eXBlOiAnZ3VuJywgeDoxLCB5OiAzLCBjb2xvcjogJyMwMGYnIH1cbiAgICBdLFxuICAgIFNQQUNFX1NISVBfRElSRUNUSU9OIDoge1xuICAgICAgICByaWdodDogeyB4OiAxLCB5OjAgfSxcbiAgICAgICAgbGVmdDogeyB4OiAtMSwgeTogMCB9LFxuICAgICAgICBkb3duOiB7IHg6IDAsIHk6IDEgfSxcbiAgICAgICAgdXA6IHsgeDogMCwgeTogLTEgfVxuICAgIH0sXG4gICAgVElNRV9PRl9ERUxBWV9TSE9UVElORyA6IDUwMFxufTtcblxuY29uc3QgRU5EX0dBTUVfVEVYVCA9IHtcbiAgICBHQU1FX09WRVJfVEVYVCA6IFtcbiAgICAgICAge3g6IDEsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMiwgeTogMCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzLCB5OiAwLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDksIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTQsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTgsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjAsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjEsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjIsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjcsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjgsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjksIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzIsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzYsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzgsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzksIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDAsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDIsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDMsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDQsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMSwgeTogMSwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA4LCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDEwLCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDE0LCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDE1LCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDE3LCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDE4LCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDIwLCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDI2LCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDMwLCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDMyLCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDM2LCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDM4LCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQyLCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQ1LCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDEsIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogOCwgeTogMiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxMCwgeTogMiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxNCwgeTogMiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxNiwgeTogMiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxOCwgeTogMiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAyMCwgeTogMiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAyNiwgeTogMiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzMCwgeTogMiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzMiwgeTogMiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzNiwgeTogMiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzOCwgeTogMiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA0MiwgeTogMiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA0NSwgeTogMiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDMsIHk6IDMsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNCwgeTogMywgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA3LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDExLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDE0LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDE4LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDIwLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDIxLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDIyLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDI2LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDMwLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDMyLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDM2LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDM4LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDM5LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQwLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQyLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQzLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQ0LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDEsIHk6IDQsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNCwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA3LCB5OiA0LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDgsIHk6IDQsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogOSwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxMCwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxMSwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxNCwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxOCwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAyMCwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAyNiwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzMCwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzMiwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzNiwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzOCwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA0MiwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA0MywgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxLCB5OiA1LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQsIHk6IDUsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNiwgeTogNSwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxMiwgeTogNSwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxNCwgeTogNSwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxOCwgeTogNSwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAyMCwgeTogNSwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAyNiwgeTogNSwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzMCwgeTogNSwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzMywgeTogNSwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzNSwgeTogNSwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzOCwgeTogNSwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA0MiwgeTogNSwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA0NCwgeTogNSwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxLCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDIsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMywgeTogNiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA0LCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDYsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTIsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTQsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTgsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjAsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjEsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjIsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjcsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjgsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjksIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzQsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzgsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzksIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDAsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDIsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDUsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDcsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDksIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNTEsIHk6IDYsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9XG5cbiAgICBdLFxuICAgIFdJTl9URVhUIDogW1xuICAgICAgICB7eDogMiwgeTogMCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA2LCB5OiAwLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDksIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTAsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTEsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTQsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTgsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjMsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjYsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjksIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzEsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzIsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzMsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzQsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzUsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzcsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDMsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDYsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDgsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNTAsIHk6IDAsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMiwgeTogMSwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA2LCB5OiAxLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDgsIHk6IDEsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTIsIHk6IDEsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTQsIHk6IDEsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTgsIHk6IDEsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjMsIHk6IDEsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjYsIHk6IDEsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjksIHk6IDEsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzMsIHk6IDEsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzcsIHk6IDEsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzgsIHk6IDEsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDMsIHk6IDEsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDYsIHk6IDEsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDgsIHk6IDEsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNTAsIHk6IDEsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMywgeTogMiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA1LCB5OiAyLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDgsIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTIsIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTQsIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTgsIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjMsIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjYsIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjksIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzMsIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzcsIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzksIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDMsIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDYsIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDgsIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNTAsIHk6IDIsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNCwgeTogMywgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA4LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDEyLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDE0LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDE4LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDIzLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDI2LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDI5LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDMzLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDM3LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQwLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQzLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQ2LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQ4LCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDUwLCB5OiAzLCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQsIHk6IDQsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogOCwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxMiwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxNCwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAxOCwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAyMywgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAyNiwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAyOSwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzMywgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiAzNywgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA0MSwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA0MywgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA0NiwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA0OCwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA1MCwgeTogNCwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA0LCB5OiA1LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDgsIHk6IDUsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTIsIHk6IDUsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTUsIHk6IDUsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTcsIHk6IDUsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMTgsIHk6IDUsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjQsIHk6IDUsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjYsIHk6IDUsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMjgsIHk6IDUsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzMsIHk6IDUsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogMzcsIHk6IDUsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDIsIHk6IDUsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNDMsIHk6IDUsIGNvbG9yOiAnZ3JlZW4nLCB0eXBlOiAnYm9keSd9LFxuICAgICAgICB7eDogNCwgeTogNiwgY29sb3I6ICdncmVlbicsIHR5cGU6ICdib2R5J30sXG4gICAgICAgIHt4OiA5LCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDEwLCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDExLCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDE2LCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDE4LCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDE5LCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDI1LCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDI3LCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDMxLCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDMyLCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDMzLCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDM0LCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDM1LCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDM3LCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQzLCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQ2LCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDQ4LCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfSxcbiAgICAgICAge3g6IDUwLCB5OiA2LCBjb2xvcjogJ2dyZWVuJywgdHlwZTogJ2JvZHknfVxuXG4gICAgXVxufTtcblxuY29uc3QgU1RBUl9PRl9ERUFUSF9QT1NJVElPTiA9IFtcbiAgICB7IHR5cGU6ICdib2R5JywgeDogNTQsIHk6IDEsIGNvbG9yOiAnYmxhY2snfSxcbiAgICB7IHR5cGU6ICdib2R5JywgeDogNTUsIHk6IDEsIGNvbG9yOiAnYmxhY2snfSxcbiAgICB7IHR5cGU6ICdib2R5JywgeDogNTMsIHk6IDIsIGNvbG9yOiAnYmxhY2snfSxcbiAgICB7IHR5cGU6ICdib2R5JywgeDogNTQsIHk6IDIsIGNvbG9yOiAnYmxhY2snfSxcbiAgICB7IHR5cGU6ICdib2R5JywgeDogNTUsIHk6IDIsIGNvbG9yOiAnYmxhY2snfSxcbiAgICB7IHR5cGU6ICdib2R5JywgeDogNTYsIHk6IDIsIGNvbG9yOiAnYmxhY2snfSxcbiAgICB7IHR5cGU6ICdib2R5JywgeDogNTIsIHk6IDMsIGNvbG9yOiAnYmxhY2snfSxcbiAgICB7IHR5cGU6ICdib2R5JywgeDogNTMsIHk6IDMsIGNvbG9yOiAnYmxhY2snfSxcbiAgICB7IHR5cGU6ICdib2R5JywgeDogNTQsIHk6IDMsIGNvbG9yOiAnYmxhY2snfSxcbiAgICB7IHR5cGU6ICdib2R5JywgeDogNTUsIHk6IDMsIGNvbG9yOiAnYmxhY2snfSxcbiAgICB7IHR5cGU6ICdib2R5JywgeDogNTYsIHk6IDMsIGNvbG9yOiAnYmxhY2snfSxcbiAgICB7IHR5cGU6ICdndW4nLCB4OiA1NywgeTogMywgY29sb3I6ICdibGFjayd9LFxuICAgIHsgdHlwZTogJ2JvZHknLCB4OiA1MywgeTogNCwgY29sb3I6ICdibGFjayd9LFxuICAgIHsgdHlwZTogJ2JvZHknLCB4OiA1NCwgeTogNCwgY29sb3I6ICdibGFjayd9LFxuICAgIHsgdHlwZTogJ2JvZHknLCB4OiA1NSwgeTogNCwgY29sb3I6ICdibGFjayd9LFxuICAgIHsgdHlwZTogJ2JvZHknLCB4OiA1NiwgeTogNCwgY29sb3I6ICdibGFjayd9LFxuICAgIHsgdHlwZTogJ2JvZHknLCB4OiA1NCwgeTogNSwgY29sb3I6ICdibGFjayd9LFxuICAgIHsgdHlwZTogJ2JvZHknLCB4OiA1NSwgeTogNSwgY29sb3I6ICdibGFjayd9XG5dO1xuXG5leHBvcnQgeyBLRVlCT0FSRFNfQ09ERSwgU0hJUCwgRU5EX0dBTUVfVEVYVCwgU1RBUl9PRl9ERUFUSF9QT1NJVElPTiwgU1RBUlRfRU5FUkdZX1BBUkFNUywgRklFTERfU0laRSB9OyIsImltcG9ydCB7IEVuZXJneSB9IGZyb20gXCIuL0VuZXJneVwiO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi9Qb2ludFwiO1xuXG5jbGFzcyBCdWxsZXQgZXh0ZW5kcyBFbmVyZ3kge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHtjb2xhaWRlcjogUG9pbnRbXX0pIHtcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBCdWxsZXQgfTsiLCJpbXBvcnQgeyBFbmVyZ3kgfSBmcm9tIFwiLi9FbmVyZ3lcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4vUG9pbnRcIjtcblxuY2xhc3MgRW5lbXlzaGlwIGV4dGVuZHMgRW5lcmd5e1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHtjb2xhaWRlcjogUG9pbnRbXX0pIHtcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XG4gICAgfVxufVxuXG5leHBvcnQgeyBFbmVteXNoaXAgfTsiLCJpbXBvcnQgeyBURGlyZWN0aW9uIH0gZnJvbSBcIi4uL3R5cGVzL2dsb2JhbFwiO1xuaW1wb3J0IHsgUG9pbnQgfSBmcm9tIFwiLi9Qb2ludFwiO1xuXG5jbGFzcyBFbmVyZ3kge1xuICAgIHB1YmxpYyBjb2xhaWRlcjogUG9pbnRbXTtcbiAgICBwdWJsaWMgcmVtb3ZlZDogYm9vbGVhbjtcblxuICAgIHByb3RlY3RlZCBfdGltZTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogeyBjb2xhaWRlcjogUG9pbnRbXSB9KSB7XG4gICAgICAgIHRoaXMuY29sYWlkZXIgPSBvcHRpb25zLmNvbGFpZGVyO1xuICAgICAgICB0aGlzLl90aW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHRoaXMucmVtb3ZlZCA9IGZhbHNlO1xuICAgIH1cblxuXG4gICAgcHVibGljIG1vdmUoIHBhcmFtczogeyBkaXJlY3Rpb246IFREaXJlY3Rpb24sIGR1cmF0aW9uOiBudW1iZXIgfSApOiBib29sZWFuIHtcbiAgICAgICAgbGV0IHsgZGlyZWN0aW9uLCBkdXJhdGlvbiB9ID0gcGFyYW1zO1xuICAgICAgICBsZXQgdGltZU5vdzogbnVtYmVyID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgICAgICAgaWYgKCAoICggdGltZU5vdyAtIHRoaXMuX3RpbWUgKSAvIGR1cmF0aW9uKSA8IDEgKSByZXR1cm47XG4gICAgICAgIHRoaXMuY29sYWlkZXIuZm9yRWFjaCggcG9pbnQgPT4gcG9pbnQubW92ZVBvaW50KCBkaXJlY3Rpb24gKSApO1xuICAgICAgICB0aGlzLl90aW1lID0gdGltZU5vdztcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2hlY2tQb3NpdGlvbihjb2xhaWRlcjogUG9pbnRbXSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgcmVzOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgIGNvbGFpZGVyLmZvckVhY2goIHBvaW50MSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbGFpZGVyLmZvckVhY2gocG9pbnQyID0+IHtcbiAgICAgICAgICAgICAgICBpZiggcG9pbnQxLmlzU2FtZShwb2ludDIpICkgcmVzID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbn1cblxuZXhwb3J0IHsgRW5lcmd5IH07XG4iLCJpbXBvcnQgeyBURGlyZWN0aW9uLCBUQ29sYWlkZXIgfSBmcm9tIFwiLi4vdHlwZXMvZ2xvYmFsXCI7XG5cbmNsYXNzIFBvaW50IHtcblxuICAgIHB1YmxpYyB4Om51bWJlcjtcbiAgICBwdWJsaWMgdHlwZTogc3RyaW5nO1xuICAgIHB1YmxpYyB5Om51bWJlcjtcbiAgICBwdWJsaWMgY29sb3I6c3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogVENvbGFpZGVyKXtcbiAgICAgICAgdGhpcy50eXBlID0gb3B0aW9ucy50eXBlO1xuICAgICAgICB0aGlzLnggPSBvcHRpb25zLng7XG4gICAgICAgIHRoaXMueSA9IG9wdGlvbnMueTtcbiAgICAgICAgdGhpcy5jb2xvciA9IG9wdGlvbnMuY29sb3I7XG4gICAgfVxuXG4gICAgaXNTYW1lKGNvbGFpZGVyOiBQb2ludCkge1xuICAgICAgICByZXR1cm4gdGhpcy54ID09PSBjb2xhaWRlci54ICYmIHRoaXMueSA9PT0gY29sYWlkZXIueTtcbiAgICB9XG5cbiAgICBtb3ZlUG9pbnQoZGlyZWN0aW9uOiBURGlyZWN0aW9uKTogdm9pZCB7XG4gICAgICAgIHRoaXMueCArPSBkaXJlY3Rpb24ueDtcbiAgICAgICAgdGhpcy55ICs9IGRpcmVjdGlvbi55O1xuICAgIH1cblxuXG59XG5cbmV4cG9ydCB7IFBvaW50IH07IiwiaW1wb3J0IHsgRW5lcmd5IH0gZnJvbSBcIi4vRW5lcmd5XCI7XG5pbXBvcnQgeyBQb2ludCB9IGZyb20gXCIuL1BvaW50XCI7XG5cbmNsYXNzIFNwYWNlc2hpcCBleHRlbmRzIEVuZXJneXtcblxuXHRjb25zdHJ1Y3RvciAoIG9wdGlvbnM6IHsgY29sYWlkZXI6IFBvaW50W10gfSApIHtcblx0XHRzdXBlcihvcHRpb25zKTtcblxuXHR9XG5cblx0cHVibGljIGdldEd1bkNvcmRpbmF0ZXMoKTogUG9pbnRbXSB7XG5cdFx0cmV0dXJuIHRoaXMuY29sYWlkZXIuZmlsdGVyKChpdGVtKSA9PiB7XG5cdFx0XHRyZXR1cm4gaXRlbS50eXBlID09PSAnZ3VuJzt9KTtcblx0fVxufVxuXG5leHBvcnQgeyBTcGFjZXNoaXAgfTsiLCJpbXBvcnQgeyBFbmVyZ3kgfSBmcm9tIFwiLi9FbmVyZ3lcIjtcbmltcG9ydCB7IFBvaW50IH0gZnJvbSBcIi4vUG9pbnRcIjtcbmltcG9ydCB7VERpcmVjdGlvbn0gZnJvbSBcIi4uL3R5cGVzL2dsb2JhbFwiO1xuXG5jbGFzcyBTdGFyT2ZEZWF0aCBleHRlbmRzIEVuZXJneSB7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7IGNvbGFpZGVyOiBQb2ludFtdIH0pIHtcblxuICAgICAgICBzdXBlcihvcHRpb25zKTtcblxuICAgICAgICB0aGlzLl9pbml0QWltKCk7XG4gICAgfVxuXG4gICAgX2luaXRBaW0oKTogdm9pZCB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gcnVuKCkge1xuICAgICAgICAgICAgdGhpcy5fZ2VuZXJhdGVBaW0odGhpcy5jb2xhaWRlcik7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHJ1bi5iaW5kKHRoaXMpLCA0MDApO1xuICAgICAgICB9LmJpbmQodGhpcyksIDQwMCk7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIF9nZW5lcmF0ZUFpbShzdGFyT2ZEZWF0aENvbGFpZGVyOiBQb2ludFtdKSB7XG4gICAgICAgIGxldCBhaW1Db29yZHM6IFREaXJlY3Rpb24gPSB0aGlzLl9nZW5lcmF0ZUFpbUNvbGFpZGVyKHN0YXJPZkRlYXRoQ29sYWlkZXIpO1xuXG4gICAgICAgIHN0YXJPZkRlYXRoQ29sYWlkZXIuZm9yRWFjaCggKGl0ZW06IFBvaW50KSA9PiB7XG4gICAgICAgICAgICBpZihpdGVtLnR5cGUgPT09ICdhaW0nKSB7XG4gICAgICAgICAgICAgICAgaXRlbS50eXBlID0gJ2JvZHknO1xuICAgICAgICAgICAgICAgIGl0ZW0uY29sb3IgPSBcIiMwMDBcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICggaXRlbS54ID09PSBhaW1Db29yZHMueCAmJiBpdGVtLnkgPT09IGFpbUNvb3Jkcy55ICkge1xuICAgICAgICAgICAgICAgIGl0ZW0uY29sb3IgPSBcIiNmMDBcIjtcbiAgICAgICAgICAgICAgICBpdGVtLnR5cGUgPSAnYWltJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIF9nZW5lcmF0ZUFpbUNvbGFpZGVyKHN0YXJPZkRlYXRoQ29sYWlkZXI6IFBvaW50W10pOiBURGlyZWN0aW9uIHtcblxuICAgICAgICBsZXQgYm90dG9tUG9pbnRZID0gc3Rhck9mRGVhdGhDb2xhaWRlci5yZWR1Y2UoKG1heCwgaXRlbSkgPT4gIG1heC55ID4gaXRlbS55ID8gbWF4IDogaXRlbSApO1xuICAgICAgICBsZXQgdG9wUG9pbnRZID0gc3Rhck9mRGVhdGhDb2xhaWRlci5yZWR1Y2UoKG1pbiwgaXRlbSkgPT4gIG1pbi55IDwgaXRlbS55ID8gbWluIDogaXRlbSApO1xuXG4gICAgICAgIGxldCBhaW1ZID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogKGJvdHRvbVBvaW50WS55IC0gdG9wUG9pbnRZLnkpICsgdG9wUG9pbnRZLnkpO1xuXG4gICAgICAgIGxldCBhaW1YID0gc3Rhck9mRGVhdGhDb2xhaWRlci5maWx0ZXIoKGl0ZW0pID0+ICBpdGVtLnkgPT09IGFpbVkpXG4gICAgICAgICAgICAucmVkdWNlKChtaW4sIGl0ZW0pID0+IG1pbi54IDwgaXRlbS54ID8gbWluIDogaXRlbSlcbiAgICAgICAgICAgIC54O1xuXG4gICAgICAgIHJldHVybiB7IHg6IGFpbVgsIHk6IGFpbVkgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0R3VuQ29yZGluYXRlcygpOiBQb2ludFtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sYWlkZXIuZmlsdGVyKChpdGVtKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS50eXBlID09PSAnZ3VuJzt9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0QWltQ29saWRlcigpOiBQb2ludFtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sYWlkZXIuZmlsdGVyKGl0ZW0gPT4gaXRlbS50eXBlID09PSAnYWltJyApO1xuICAgIH1cbn1cblxuZXhwb3J0IHsgU3Rhck9mRGVhdGggfVxuIiwiXG5leHBvcnQgKiBmcm9tIFwiLi9Qb2ludFwiO1xuZXhwb3J0ICogZnJvbSBcIi4vU3BhY2VzaGlwXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9CdWxsZXRcIjtcbmV4cG9ydCAqIGZyb20gXCIuL0VuZXJneVwiO1xuZXhwb3J0ICogZnJvbSBcIi4vRW5lbXlzaGlwXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9TdGFyT2ZEZWF0aFwiOyIsImltcG9ydCB7QXBwfSBmcm9tIFwiLi9BcHBcIjtcblxubGV0IGFwcCA9IG5ldyBBcHAoe1xuICAgIHN2ZzogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhbGVuZGFyLWdyYXBoLXN2ZycpXG59KTtcbiIsImxldCBFdmVudEVtaXR0ZXIgPSB7XG5cblx0XCJzdWJzY3JpYmVyc1wiOiB7fSxcblxuXHRcIm9uXCI6IGZ1bmN0aW9uIG9uKGV2ZW50OiBzdHJpbmcsIGNiOiBGdW5jdGlvbikge1xuXHRcdGxldCBldmVudFR5cGUgPSBldmVudCB8fCAnZGVmYXVsdCc7XG5cdFx0aWYgKCF0aGlzLnN1YnNjcmliZXJzW2V2ZW50VHlwZV0pIHtcblx0XHRcdHRoaXMuc3Vic2NyaWJlcnNbZXZlbnRUeXBlXSA9IFtdO1xuXHRcdH1cblx0XHR0aGlzLnN1YnNjcmliZXJzW2V2ZW50VHlwZV0ucHVzaChjYik7XG5cdH0sXG5cblx0XCJvZmZcIjogZnVuY3Rpb24gb2ZmKGV2ZW50OiBzdHJpbmcsIGNiOiBGdW5jdGlvbikge1xuXHRcdGlmICh0aGlzLnN1YnNjcmliZXJzW2V2ZW50XSkge1xuXHRcdFx0dGhpcy5zdWJzY3JpYmVyc1tldmVudF0gPSB0aGlzLnN1YnNjcmliZXJzW2V2ZW50XS5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHRcdFx0cmV0dXJuIGNiICE9PSBpdGVtO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZXZlbnQgKyAnIG5vdCBmb3VuZCEnKTtcblx0XHR9XG5cdH0sXG5cblx0XCJ0cmlnZ2VyXCI6IGZ1bmN0aW9uIHRyaWdnZXIoZXZlbnQ6c3RyaW5nLCBvcHRpb25zID0gbnVsbCkge1xuXG5cdFx0bGV0IHN1YiA9IHRoaXMuc3Vic2NyaWJlcnNbZXZlbnRdO1xuXG5cdFx0aWYgKHN1Yikge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDAsIGxlbiA9IHN1Yi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0XHRzdWJbaV0ob3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUubG9nKCdFRS50cmlnZ2VyOiBub3QgZm91bmQgc3Vic2NyaWJlcnMgZm9yICcgKyBldmVudCArICcgZXZlbnQnKTtcblx0XHR9XG5cdH0sXG5cblx0IFwib2ZmQWxsXCI6IGZ1bmN0aW9uIG9mZkFsbChldmVudDogc3RyaW5nKSB7XG5cdFx0IGlmICh0aGlzLnN1YnNjcmliZXJzW2V2ZW50XSkge1xuXHRcdFx0IHRoaXMuc3Vic2NyaWJlcnNbZXZlbnRdID0gW107XG5cdFx0IH1cblx0IH1cbn07XG5cbmZ1bmN0aW9uICB0aHJvdHRsZShmdW5jOkZ1bmN0aW9uLCBtczpudW1iZXIpOkZ1bmN0aW9uIHtcblx0bGV0IHN0YXRlOmJvb2xlYW4gPSBmYWxzZSxcblx0XHRhcmc6YW55ID0gbnVsbCxcblx0XHRjb250ZXh0OmFueSA9IG51bGw7XG5cblx0cmV0dXJuIGZ1bmN0aW9uIHRpbWUoKSB7XG5cdFx0aWYgKHN0YXRlKSB7XG5cdFx0XHRhcmcgPSBhcmd1bWVudHM7XG5cdFx0XHRjb250ZXh0ID0gdGhpcztcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0c3RhdGUgPSB0cnVlO1xuXHRcdGZ1bmMuY2FsbCh0aGlzKTtcblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHN0YXRlID0gZmFsc2U7XG5cdFx0XHRpZiAoYXJnKSB7XG5cdFx0XHRcdHRpbWUuY2FsbChjb250ZXh0KTtcblx0XHRcdFx0Y29udGV4dCA9IG51bGw7XG5cdFx0XHRcdGFyZyA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fSwgbXMpO1xuXHR9XG59XG5cbmZ1bmN0aW9uICBjb25jYXRBbGwoYXJyYXk6YW55W10pIHtcblx0bGV0IHJlc3VsdHMgPSBbXTtcblx0YXJyYXkuZm9yRWFjaChmdW5jdGlvbihzdWJBcnJheSkge1xuXHRcdHJlc3VsdHMucHVzaC5hcHBseShyZXN1bHRzLCBzdWJBcnJheSk7XG5cdH0pO1xuXHRyZXR1cm4gcmVzdWx0cztcbn1cblxuZXhwb3J0IHsgRXZlbnRFbWl0dGVyLCB0aHJvdHRsZSwgY29uY2F0QWxsIH07Il19
