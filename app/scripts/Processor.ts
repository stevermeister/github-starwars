import { EventEmitter, throttle, concatAll} from "./lib";
import {Spaceship, Bullet, Point, Enemyship } from  "./entities/index";
import { ProcessorForState } from "./ProcessorForState";
import { SHIP, START_ENERGY_PARAMS, FIELD_SIZE } from './constants';
import { GameField } from "./GameField";
import {TColaider, TDirection} from "./types/global";


class Processor {
	private _dataField: GameField;
	private _processorState: ProcessorForState;
	private _spaceShip: Spaceship;
	private _energyParams;
	private _energyTypes: string[] = [];
	private _timeDelayShooting: Function;
	private _timer:number;
	private _lengthOfField:number;
	private _isStopGame:boolean = false;
	private _score:number;

	constructor(options: {dataField: GameField}) {

		this._energyParams = {};
		Object.keys(START_ENERGY_PARAMS).forEach(key => {
			this._energyParams[key] = Object.assign({}, START_ENERGY_PARAMS[key]);
			this._energyTypes.push(key);
		});
		this._timeDelayShooting = throttle(this._shot.bind(this, 'spaceshipBullet'), SHIP.TIME_OF_DELAY_SHOTTING);

		this._dataField = options.dataField;

		this._processorState = new ProcessorForState({ types: this._energyTypes	});
		this._lengthOfField = this._dataField.getLenghtofData();

		this._isStopGame = false;

		this._startProcess();


		EventEmitter.on('fire', () =>  {
			this._timeDelayShooting();
		});
		EventEmitter.on('move', (data) => {
			this._energyParams.spaceship.direction = SHIP.SPACE_SHIP_DIRECTION[data.direction];
		} );

	}

	private _startProcess(): void {
		//reset all
		clearInterval(this._timer);
		this._processorState.clear();
		if (this._isStopGame ) this._isStopGame = false;

		this._score = 0;
		EventEmitter.trigger('update score', {score: 0});

		//start
		this._spaceShip = this._createSpaceShip();

		this._processorState.add({
			type: 'spaceship',
			instance: this._spaceShip
		});

		this._timer = this._generateEvil();

		let self = this;
		requestAnimationFrame(function __animateLoop() {
			if (self._isStopGame) return;
			let { moved, all } = self._moveAllEntities();
			self._draw(all);
			self._prepareNextStep(all, moved);
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

	private _createEnemyShip(): Enemyship {
		let {x, y} = this._generateColaider();
		return new Enemyship({colaider: [
			new Point({ type: 'body', x: x, y: y, color: "green"}),
			new Point({ type: 'body', x: x + 1, y: y, color: "green"})
		]})
	}

	private _generateColaider(): TDirection{
		let evilXStartPoint = FIELD_SIZE.rightX;
		let lastColumnLength = FIELD_SIZE.maxLength - this._lengthOfField;
		let evilYStartPoint = Math.round(Math.random() * (FIELD_SIZE.bottomY - FIELD_SIZE.topY) + FIELD_SIZE.topY);

		if (evilYStartPoint >= lastColumnLength) evilXStartPoint--;

		return {x: evilXStartPoint, y: evilYStartPoint};
	}

	private _generateEvil(): number {
		let timer = setInterval(() => {
			this._processorState.add({
				type: 'enemy',
				instance: this._createEnemyShip()
			});
		}, 1000);
		return timer;
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


	private _prepareNextStep(all, moved): void {
		this._energyTypes.forEach( entityType => {
			if(moved[entityType]){
				moved[entityType].forEach(entity => {
					this._checkCriticalPoint(entityType, entity, all);
				});
			}
		});
		this._updateState(all);
	}

	private _updateState(all): void{
		let newState: any = {};
		this._energyTypes.forEach( type => {
			newState[type] = all[type].filter( entity => !entity.removed );
		} );
		this._processorState.update(newState);
	}

	private _checkCriticalPoint(key: string, entity, entities): void {
		switch (key) {
			case "spaceship": {
				this.checkCrash(entities['enemy'], entity);
				if (entity.removed) {
					this._settingsToStopGame();
					 this._resultOfAction("lose");
				}
				break;
			}

			case "spaceshipBullet": {
				this.checkCrash(entities['enemy'], entity);

				if(entity.removed) {
					this._resultOfAction("kill");
					return;
				}
				if (entity.colaider.x > FIELD_SIZE.rightX) entity.removed = true;

				break;
			}

			case "enemy": {
				this.checkCrash(entities['spaceshipBullet'], entity);
				this.checkCrash(entities['spaceship'], entity);

				if(entity.removed) {
					this._resultOfAction("kill");
					return;
				}
				if(this._spaceShip.removed){
					this._resultOfAction("lose");
				}

				let isInField = entity.colaider.filter( point => point.x > FIELD_SIZE.leftX);
				if(!isInField.length) entity.removed = true;
				break;
			}

		}
	}

	public checkCrash(entities, currentEntity) {
		entities.forEach(entity => {
			if (entity.checkPosition(currentEntity.colaider)) {
				entity.removed = true;
				currentEntity.removed = true;
			}
		})
	}

	private _resultOfAction(type:string): void {
		switch (type) {
			case "lose": {
				console.log("You are lose");
				break
			}
			case "win": {
				console.log("You are win");
				break;
			}
			case "kill": {
				this._checkScore();
			}
		}
	}

	private _settingsToStopGame(): void {
		clearInterval(this._timer);
		this._processorState.clear();
		this._isStopGame = true;
	}

	private _checkScore(){
		this._score += 10;
		EventEmitter.trigger('update score', {score: this._score});

		if (this._score % 100 === 0) {
			let currentSpeed = this._energyParams.enemy.duration;
			this._energyParams.enemy.duration =  currentSpeed * this._changeDifficulty(this._score);

		}
	}

	private _changeDifficulty(score:number):number {
		return (1 - Math.floor( score / 100 ) / 10);
	}

}

export { Processor };