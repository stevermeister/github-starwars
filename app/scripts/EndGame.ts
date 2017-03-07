import { EventEmitter} from "./lib";
import { END_GAME_TEXT } from "./constants";
import { Point } from "./entities/Point";
import  { TColaider } from "./types/global";

class EndGame {

    constructor() {
        EventEmitter.on("stop game", (data: {type: string}) => {
            EventEmitter.trigger("update field of game", {text: this._endOfTheGame(data.type)});
        });
    }


    public _endOfTheGame(endEventType: string): Point[] {
        let endGameText: Point[];
        let currentResultText: TColaider[];

        currentResultText =  endEventType === "lose" ?  END_GAME_TEXT.GAME_OVER_TEXT : END_GAME_TEXT.WIN_TEXT;
        endGameText = currentResultText
            .map((item) => new Point(item) )
            .sort( () =>  Math.random() - 0.5 );

        return endGameText;
    }
}

export { EndGame };

