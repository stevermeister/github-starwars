import { EventEmitter} from "./lib";
import { GameField } from "./GameField";


class Processor {
	private _dataField: GameField;


	constructor(options: {dataField: GameField}) {

		EventEmitter.on('start game', () => {
			console.log("Game start");
		});

	}

}

export { Processor };