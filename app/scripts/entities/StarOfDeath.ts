import { Energy } from "./Energy";
import { Point } from "./Point";
import {TDirection} from "../types/global";

class StarOfDeath extends Energy {

    constructor(options: { colaider: Point[] }) {

        super(options);

        this._initAim();
    }

    _initAim(): void {
        setTimeout(function run() {
            this._generateAim(this.colaider);
            setTimeout(run.bind(this), 400);
        }.bind(this), 400);
    }


    private _generateAim(starOfDeathColaider: Point[]) {
        let aimCoords: TDirection = this._generateAimColaider(starOfDeathColaider);

        starOfDeathColaider.forEach( (item: Point) => {
            if(item.type === "aim") {
                item.type = "body";
                item.color = "#000";
            }
            if ( item.x === aimCoords.x && item.y === aimCoords.y ) {
                item.color = "#f00";
                item.type = "aim";
            }
        });
    }


    private _generateAimColaider(starOfDeathColaider: Point[]): TDirection {

        let bottomPointY = starOfDeathColaider.reduce((max, item) =>  max.y > item.y ? max : item );
        let topPointY = starOfDeathColaider.reduce((min, item) =>  min.y < item.y ? min : item );

        let aimY = Math.round(Math.random() * (bottomPointY.y - topPointY.y) + topPointY.y);

        let aimX = starOfDeathColaider.filter((item) =>  item.y === aimY)
            .reduce((min, item) => min.x < item.x ? min : item)
            .x;

        return { x: aimX, y: aimY };
    }

    public getGunCordinates(): Point[] {
        return this.colaider.filter((item) => {
            return item.type === "gun";});
    }

    public getAimColider(): Point[] {
        return this.colaider.filter(item => item.type === "aim" );
    }
}

export { StarOfDeath }
