import { Energy } from "./Energy";
import { Point } from "./Point";

class Bullet extends Energy {
    constructor(options: {colaider: Point[]}) {
        super(options);
    }
}

export { Bullet };