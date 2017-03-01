import { GameField } from "./GameField";
import  { Processor } from "./Processor";

class Game {

    private _dataField: GameField;
    private _scoreElement: Element;

    constructor(options: {el: Element}) {
        this._initGameComponents(options);

        this._dataField.render([]);

        this._scoreElement = document.querySelector(".score-game");

    }


    private _initGameComponents(options: {el: Element}) {

        new Processor({
            dataField: this._dataField
        });

        this._dataField = new GameField({
            list: options.el.querySelectorAll('rect')
        });
    }
}

export { Game };