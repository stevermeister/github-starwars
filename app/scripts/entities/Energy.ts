import { TDirection } from "../types/global";
import { Point } from "./Point";

class Energy {
    public colaider: Point[];
    public removed: boolean;

    protected _time: number;

    constructor(options: { colaider: Point[] }) {
        this.colaider = options.colaider;
        this._time = performance.now();
        this.removed = false;
    }


    public move( params: { direction: TDirection, duration: number } ): boolean {
        let { direction, duration } = params;
        let timeNow: number = performance.now();

        if ( ( ( timeNow - this._time ) / duration) < 1 ) return;
        this.colaider.forEach( point => point.movePoint( direction ) );
        this._time = timeNow;

        return true;
    }

    public checkPosition(colaider: Point[]): boolean {
        let res: boolean = false;
        colaider.forEach( point1 => {
            this.colaider.forEach(point2 => {
                if( point1.isSame(point2) ) res = true;
            });
        });
        return res;
    }

}

export { Energy };
