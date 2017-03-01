import { GameField } from "./GameField";
import  { Processor } from "./Processor";
import { EventEmitter} from "./lib";

class Game {

    private _dataField: GameField;
    private _scoreElement: Element;

    constructor(options: {el: Element, score: Element}) {

        this._scoreElement = options.score;

        EventEmitter.on('start game', () => {
            console.log("Game start");

            new Processor({
                dataField: this._dataField
            });

            this._dataField = new GameField({
                list: options.el.querySelectorAll('rect')
            });

            this._dataField.render([]);
        });

    }

}

export { Game };