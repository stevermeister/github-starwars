import { GameField } from "./GameField";
import  { Processor } from "./Processor";
import { EventEmitter} from "./lib";
import { KEYBOARDS_CODE } from "./constants";

class Game {

    private _dataField: GameField;
    private _scoreElement: Element;

    constructor(options: {el: Element, score: Element}) {

        this._scoreElement = options.score;

        EventEmitter.on('start game', () => {

            this._dataField = new GameField({
                list: options.el.querySelectorAll('rect')
            });

            new Processor({
                dataField: this._dataField
            });

            this._dataField.render([]);

            document.addEventListener('keypress', this.checkMove.bind(this));
        });

        EventEmitter.on("update score", this.checkScore.bind(this));

    }


    public checkScore(data: {score:number}): void{
        this._scoreElement.innerHTML = "Score: "+ data.score;
    }


    public checkMove(e:KeyboardEvent):void {
        e.preventDefault();

        let { right, left, down, up, fire} = KEYBOARDS_CODE;

        let code: number = e.keyCode;
        if (code !== fire && code !== up && code !== down && code !== right && code !== left) return;

        switch (code) {
            case fire: {
                EventEmitter.trigger('fire');
                break;
            }
            case up: {
                EventEmitter.trigger('move', { direction: "up"});
                break;
            }
            case right: {
                EventEmitter.trigger('move', { direction: "right"});
                break;
            }
            case left: {
                EventEmitter.trigger('move', { direction: "left"});
                break;
            }
            case down: {
                EventEmitter.trigger('move', { direction: "down"});
                break;
            }
        }

    }

}

export { Game };