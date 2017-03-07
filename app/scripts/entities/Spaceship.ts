import { Energy } from "./Energy";
import { Point } from "./Point";

class Spaceship extends Energy{

	constructor ( options: { colaider: Point[] } ) {
		super(options);

	}

	public getGunCordinates(): Point[] {
		return this.colaider.filter((item) => {
			return item.type === "gun";});
	}
}

export { Spaceship };