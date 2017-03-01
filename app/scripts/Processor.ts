import { EventEmitter, throttle, concatAll} from "./lib";
import {Spaceship, Bullet, Point } from  "./entities/index";
import { ProcessorForState } from "./ProcessorForState";
import { SHIP, START_ENERGY_PARAMS, FIELD_SIZE } from './constants';
import { GameField } from "./GameField";
import {TColaider} from "./types/global";


class Processor {
	private _dataField: GameField;
	private _processorState: ProcessorForState;
	private _spaceShip: Spaceship;
	private _energyParams;
	private _energyTypes: string[] = [];
	private _timeDelayShooting: Function;

	constructor(options: {dataField: GameField}) {

		this._energyParams = {};
		Object.keys(START_ENERGY_PARAMS).forEach(key => {
			this._energyParams[key] = Object.assign({}, START_ENERGY_PARAMS[key]);
			this._energyTypes.push(key);
		});
		this._timeDelayShooting = throttle(this._shot.bind(this, 'spaceshipBullet'), SHIP.TIME_OF_DELAY_SHOTTING);

		this._dataField = options.dataField;

		this._processorState = new ProcessorForState({ types: this._energyTypes	});

		this._startProcess();


		EventEmitter.on('fire', () =>  {
			this._timeDelayShooting();
		});
		EventEmitter.on('move', (data) => {
			this._energyParams.spaceship.direction = SHIP.SPACE_SHIP_DIRECTION[data.direction];
		} );

	}

	private _startProcess(): void {
		this._spaceShip = this._createSpaceShip();

		this._processorState.add({
			type: 'spaceship',
			instance: this._spaceShip
		});

		EventEmitter.trigger('play sound', {type: "main"});
		let self = this;
		requestAnimationFrame(function __animateLoop() {
			let { moved, all } = self._moveAllEntities();
			self._draw(all);
			//self._prepareNextStep(all, moved);
			self._energyParams.spaceship.direction = {x: 0, y: 0};
			requestAnimationFrame(__animateLoop);
		});
	}

	private _createSpaceShip(): Spaceship {
		return new Spaceship({
			colaider: SHIP.START_SHIP_POSITION.map((item) => {
				return new Point(item);
			})
		});
	}

	private _moveAllEntities(): any {
		let entities: any = this._processorState.get();
		let movedEntities: any  = {};

		this._energyTypes.forEach( key => {
			if (key == "spaceship") {

				let tailPosition = this._spaceShip.colaider.reduce((min, item) =>  min.x < item.x ? min : item );
				let gunPosition = [];

				this._spaceShip.colaider.forEach((item) => {
					if (item.type === 'gun') gunPosition.push(item);
				});

				let y = this._energyParams.spaceship.direction.y;
				let x = this._energyParams.spaceship.direction.x;

				for (let i = 0; i < gunPosition.length; i++){
					if ((gunPosition[i].y === FIELD_SIZE.bottomY && y > 0)
						|| (gunPosition[i].y === FIELD_SIZE.topY && y < 0)
						|| (tailPosition.x === FIELD_SIZE.leftX && x < 0)
						|| (gunPosition[i].x === FIELD_SIZE.rightX && x > 0)) {
						return;
					}
				}
			}
			entities[key].forEach( entity => {
				let moved = entity.move(this._energyParams[key]);

				if(moved) {
					movedEntities[key] ? movedEntities[key].push(entity) : movedEntities[key] = [entity];
				}
			});
		});

		return {
			moved: movedEntities,
			all: entities
		};
	}


	private _draw(arr:any): void {
		let current: TColaider[] = [];
		this._energyTypes.forEach(entityType => {
			arr[entityType].forEach( item => {
				current.push(item.colaider);
			});
		});
		let result = concatAll(current);
		this._dataField.render(result);
	}


	private _shot(type: string): void {
		switch (type) {
			case 'spaceshipBullet': {
				this._spaceShip.getGunCordinates().forEach((item) => {
					let colaider: TColaider = {
						x: item.x + 1,
						y: item.y,
						color: "#f00",
						type: "body"
					};

					this._processorState.add({
						type: 'spaceshipBullet',
						instance: new Bullet({colaider: [new Point(colaider)]})
					});
				});

				break;
			}

			case 'enemyBullet': {
				console.log("One moment");
				break;
			}
		}
	}

}

export { Processor };