import { Energy } from "./Energy";
import { Point } from "./Point";

class Enemyship extends Energy{
    constructor(options: {colaider: Point[]}) {
        super(options);
    }
}

export { Enemyship };