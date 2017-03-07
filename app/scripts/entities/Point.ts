import { TDirection, TColaider } from "../types/global";

class Point {

    public x:number;
    public type: string;
    public y:number;
    public color:string;

    constructor(options: TColaider){
        this.type = options.type;
        this.x = options.x;
        this.y = options.y;
        this.color = options.color;
    }

    isSame(colaider: Point) {
        return this.x === colaider.x && this.y === colaider.y;
    }

    movePoint(direction: TDirection): void {
        this.x += direction.x;
        this.y += direction.y;
    }


}

export { Point };