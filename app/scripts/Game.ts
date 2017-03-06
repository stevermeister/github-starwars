import { EventEmitter} from "./lib";
import { Processor } from "./Processor";
import { GameField } from "./GameField";
import { KEYBOARDS_CODE, SHIP } from "./constants";
import { EndGame } from "./EndGame";

class Game {

    private _dataField: GameField;
    private _scoreElement: Element;
    private _shootTime: number;

    constructor(options: {el: Element, score: Element}) {

        this._scoreElement = options.score;
        this._shootTime = performance.now();
        this._initGameComponents(options);


        this.checkScore = this.checkScore.bind(this);


        EventEmitter.on("update score",  this.checkScore);
        document.addEventListener("keydown", this.checkMove.bind(this), true);
    }


    private _initGameComponents(options: {el: Element}) {

        this._dataField = new GameField({
            list: options.el.querySelectorAll("rect")
        });

        new Processor({
            dataField: this._dataField
        });

        new EndGame();
    }

    public checkScore(data: {score:number}): void{
        this._scoreElement.innerHTML = "Score: "+ data.score;
    }


    public checkMove(e:KeyboardEvent):void {

        let { right, left, down, up, fire} = KEYBOARDS_CODE;

        let code: number = e.keyCode;
        if (code !== fire && code !== up && code !== down && code !== right && code !== left) return;

        switch (code) {
            case fire: {
                let now = performance.now();
                if( (now - this._shootTime) / SHIP.TIME_OF_DELAY_SHOTTING >= 1){
                    this._shootTime = now;
                    EventEmitter.trigger("fire");
                }
                break;
            }
            case up: {
                EventEmitter.trigger("move", { direction: "up"});
                break;
            }
            case right: {
                EventEmitter.trigger("move", { direction: "right"});
                break;
            }
            case left: {
                EventEmitter.trigger("move", { direction: "left"});
                break;
            }
            case down: {
                EventEmitter.trigger("move", { direction: "down"});
                break;
            }
        }

        e.preventDefault();
        e.stopPropagation();

    }
}

export { Game };
