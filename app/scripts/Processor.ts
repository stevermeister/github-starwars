import { EventEmitter, concatAll, throttle} from "./lib";
import { GameField } from "./GameField";
import {Spaceship, Bullet, Enemyship, StarOfDeath, Point } from  "./entities/index";
import { ProcessorForState } from "./ProcessorForState";
import { SHIP, START_ENERGY_PARAMS, STAR_OF_DEATH_POSITION, FIELD_SIZE } from "./constants";
import  { TColaider, TDirection } from "./types/global";

class Processor {
	private _dataField: GameField;
	private _processorState: ProcessorForState;
	private _spaceShip: Spaceship;
	private _starOfDeath: StarOfDeath;

	private _isStopGame: boolean = false;
	private _energyParams;
	private _energyTypes: string[] = [];
	private _timer: number;
	private _lengthOfField: number;
	private _score:number = 0;

	constructor(options: {dataField: GameField}) {

		this._energyParams = {};
		Object.keys(START_ENERGY_PARAMS).forEach(key => {
			this._energyParams[key] = Object.assign({}, START_ENERGY_PARAMS[key]);
			this._energyTypes.push(key);
		});

		this._dataField = options.dataField;
		this._lengthOfField = this._dataField.getLenghtofData();
		this._processorState = new ProcessorForState({ types: this._energyTypes	});

		EventEmitter.on("fire", () =>  {
			if (!this._isStopGame && this._processorState.get().spaceshipBullet.length < 5) {
				this._shot("spaceshipBullet");
			}
		});
		EventEmitter.on("move", (data) => {
			this._energyParams.spaceship.direction = SHIP.SPACE_SHIP_DIRECTION[data.direction];
		} );

		EventEmitter.on("start game", () => {
			//prepare game to start
			this._prepareGameFieldToStart();
			//start
			this._startProcess();
		});

		EventEmitter.on("update field of game", (data) => {
			this._dataField.endRender(data.text);
			this._isStopGame = true;
		});

	}

	private _prepareGameFieldToStart(): void {
		this._dataField.render([]);
		EventEmitter.trigger("update score", {score: 0}); 	//reset score


		this._energyParams["enemy"].duration = START_ENERGY_PARAMS.enemy.duration;
		this._score = 0;

		this._processorState.clear();  	//delete all entities on field
		clearInterval(this._timer);		//stop all enemy
		if (this._isStopGame) this._isStopGame = false;
	}

	private _startProcess(): void {
		this._spaceShip = this._createSpaceShip();

		this._timer = this._generateEvil();

		this._processorState.add({
			type: "spaceship",
			instance: this._spaceShip
		});

		let self = this;
		requestAnimationFrame(function __animateLoop() {
			if(self._isStopGame) return;
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
			new Point({ type: "body", x: x, y: y, color: "green"}),
			new Point({ type: "body", x: x + 1, y: y, color: "green"})
		]})
	}

	private _generateEvil(): number {
		let timer = setInterval(() => {
			this._processorState.add({
				type: "enemy",
				instance: this._createEnemyShip()
			});
		}, 1000);
		return timer;
	}

	private _prepareForStarOfDeath(): void {
		clearInterval(this._timer);
		this._processorState.clearFotStarOfDeath();
		this._generateStarOfDeath();

		this._timer = setInterval(() => {
			this._shot("enemyBullet");
		}, 800);
	}


	private _moveAllEntities(): any {
		let entities: any = this._processorState.get();
		let movedEntities: any  = {};

		this._energyTypes.forEach( key => {
			if (key == "spaceship") {

				let tailPosition = this._spaceShip.colaider.reduce((min, item) =>  min.x < item.x ? min : item );
				let gunPosition = [];

				this._spaceShip.colaider.forEach((item) => {
					if (item.type === "gun") gunPosition.push(item);
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


	private _checkCriticalPoint(key: string, entity, entities): void {
		switch (key) {
			case "spaceship": {
				this.checkCrash(entities["enemy"], entity);
				this.checkCrash(entities["enemyBullet"], entity);
				this.checkCrash(entities["starOfDeath"], entity);

				if (entity.removed) {
					this._settingsToStopGame();
					this._resultOfAction("lose");
				}
				break;
			}

			case "spaceshipBullet": {
				this.checkCrash(entities["enemy"], entity);
				this.checkCrash(entities["enemyBullet"], entity);

				if(entity.removed) {
					this._resultOfAction("kill");
					return;
				}
				entities["starOfDeath"].forEach(item => {
					if (item.checkPosition(entity.colaider)) {
						entity.removed = true;
					}
					if ( entity.checkPosition(item.getAimColider() ) ) {
						this._resultOfAction("win");
					}
				});

				if (entity.colaider[0].x >= FIELD_SIZE.rightX) entity.removed = true;

				break;
			}

			case "enemy": {
				this.checkCrash(entities["spaceshipBullet"], entity);
				this.checkCrash(entities["spaceship"], entity);

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

			case "enemyBullet": {
				this.checkCrash(entities["spaceshipBullet"], entity);
				this.checkCrash(entities["spaceship"], entity);

				if (entity.colaider.x < FIELD_SIZE.leftX ) entity.removed = true;
				break;
			}

			case "starOfDeath": {
				this.checkCrash(entities["spaceship"], entity);

				if (entity.getGunCordinates().x < FIELD_SIZE.leftX ) entity.removed = true;
				entities["spaceshipBullet"].forEach(bullet => {
					if (bullet.checkPosition(entity.colaider)) {
						bullet.removed = true;
					}

					if ( bullet.checkPosition(entity.getAimColider() ) ) {
						this._resultOfAction("win");
					}
				})
			}
		}
	}


	private _resultOfAction(type:string): void {
		switch (type) {
			case "lose": {
				EventEmitter.trigger("stop game", { type: "lose" });
				break
			}
			case "win": {
				EventEmitter.trigger("stop game", {type: "win"});
				break;
			}
			case "kill": {
				this._checkScore();
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

	private _settingsToStopGame(): void {
		clearInterval(this._timer);
		this._processorState.clear();
		this._isStopGame = true;
	}


	private _updateState(all): void{
		let newState: any = {};
		this._energyTypes.forEach( type => {
			newState[type] = all[type].filter( entity => !entity.removed );
		} );
		this._processorState.update(newState);
	}

	private _shot(type: string): void {
		switch (type) {
			case "spaceshipBullet": {
				this._spaceShip.getGunCordinates().forEach((item) => {
					let colaider: TColaider = {
						x: item.x + 1,
						y: item.y,
						color: "#f00",
						type: "body"
					};

					this._processorState.add({
						type: "spaceshipBullet",
						instance: new Bullet({colaider: [new Point(colaider)]})
					});
				});

				break;
			}

			case "enemyBullet": {
				this._starOfDeath.getGunCordinates().forEach((item) => {
					let colaider: TColaider = {
						x: item.x - 2,
						y: item.y,
						color: "#eecb0f",
						type: "body"
					};
					this._processorState.add({
						type: "enemyBullet",
						instance: new Bullet({colaider: [new Point(colaider)]})
					});
				});
				break;
			}
		}
	}


	private _generateColaider(): TDirection{
		let evilXStartPoint = FIELD_SIZE.rightX;
		let lastColumnLength = FIELD_SIZE.maxLength - this._lengthOfField;
		let evilYStartPoint = Math.round(Math.random() * (FIELD_SIZE.bottomY - FIELD_SIZE.topY) + FIELD_SIZE.topY);

		if (evilYStartPoint >= lastColumnLength) evilXStartPoint--;

		return {x: evilXStartPoint, y: evilYStartPoint};
	}

	private _generateStarOfDeath():void {
		this._starOfDeath = new StarOfDeath({
			colaider: STAR_OF_DEATH_POSITION.map((item) => {
				return new Point(item);
			})
		});

		this._processorState.add({
			type: "starOfDeath",
			instance: this._starOfDeath
		});
	}

	private _checkScore(){
		this._score += 10;
		EventEmitter.trigger("update score", {score: this._score});
		if(this._score === 600){
			this._prepareForStarOfDeath();
		} else if (this._score - Math.floor(this._score / 100) * 100 === 0) {
			let currentSpeed = this._energyParams.enemy.duration;
			this._energyParams.enemy.duration =  currentSpeed * this._changeDifficulty(this._score);

		}
	}

	private _changeDifficulty(score:number):number {
		return (1 - Math.floor( score / 100 ) / 10);
	}
}

export { Processor };