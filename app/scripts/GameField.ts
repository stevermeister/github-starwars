import { TGameField } from "./types/global"
import { Point } from  "./entities/Point";
import  { FIELD_SIZE } from "./constants";

class GameField {

    private _dataField: TGameField[];

    constructor(options:{ list: NodeListOf<Element>}) {
        this._dataField = this._initData(options.list);
    }

    private _initData(rectList: NodeListOf<Element>): TGameField[] {
        let result: any[] = [];

        for (let j = 0; j < rectList.length; j++) {
            result.push({
                el: rectList[j],
                index: j
            });
        }
        return result;
    }


    public render(currentState: Point[]): void {
        this._clearData();
        let currentField = this._checkVisiblePositions(currentState);

        this._dataField.forEach((elem) => {
            currentField.forEach((item) => {
                if (elem.index === item.x * FIELD_SIZE.columnLength + item.y) {
                    (elem.el as HTMLElement).style.fill = item.color;
                }
            });
        });
    }


    public endRender(currentState: Point[]): void {
        let self = this;
        let index = 0;

        this._clearData();
        setTimeout(function run() {
            let item = currentState[index];
            self._dataField.forEach(elem => {
                if (elem.index === item.x * FIELD_SIZE.columnLength + item.y) {
                    (elem.el as HTMLElement).style.fill = item.color;
                }
            });
            index++;
            if(index !== currentState.length)setTimeout(run.bind(this), 10);
        }.bind(this), 10);

    }


    private _clearData(): void {
        this._dataField.forEach((elem) => {
            (elem.el as HTMLElement).style.fill = "#eee";
        });
    }

    public getLenghtofData(): number {
        return this._dataField.length;
    }

    private _checkVisiblePositions(currentState: Point[]): Point[]{ //filter every items that do not in field
        return  currentState.filter(point => point.x >= FIELD_SIZE.leftX && point.x <= FIELD_SIZE.rightX && point.y >= FIELD_SIZE.topY && point.y <= FIELD_SIZE.bottomY);
    }
}

export { GameField };