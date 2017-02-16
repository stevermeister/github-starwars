class Spaceship {

	constructor(options) {

		this.dataField = options.dataField;

		this._centerShip = SPACE_SHIP_START_POSITION;
		this._gun = SPACE_SHIP_GUN;
		this._died = false;

		this.currentPositionShip = [];
		this.nextPositionShip = [];

		this.timeDelay = this._throttle(this._shot.bind(this), 400);

		EventEmitter.on('start game', () => this.initShip() );
		EventEmitter.on('stop game', () => this._died = true );

		document.addEventListener('keypress', this.checkMove.bind(this));

	}

	initShip(){
		this._centerShip = SPACE_SHIP_START_POSITION;
		this._gun = SPACE_SHIP_GUN;
		this._died = false;

		this.currentPositionShip = [];
		this.nextPositionShip = [];

		this._initBody();
	}



	_initBody() {
		SPACE_SHIP_START_BODY.forEach((index) => {
			let part = this.dataField[index];
			part.el.style.fill = '#00f';
			part.isShip = true;
			this.currentPositionShip.push(part);
		});
	}


	_throttle(func, ms) {
		let state = false,
			arg = null,
			context = null;

		return function time() {
			if(this._died) return;
			if (state) {
				arg = arguments;
				context = this;
				return;
			}
			state = true;
			func.call(this);
			setTimeout(() => {
				state = false;
				if (arg) {
					time.call(context);
					context = null;
					arg = null;
				}
			}, ms);
		}
	}


	checkMove(e) {
		if(this._died) return;
		e.preventDefault();

		let code = e.keyCode;
		if (code !== FIRE && code !== UP && code !== DOWN) return;

		if (code === FIRE) {
			this.timeDelay();
			return;
		}

		if ((this._centerShip === MAX_SHIP_CENTER_POSITION && code === DOWN) ||
			(this._centerShip === MIN_SHIP_CENTER_POSITION && code === UP)) return;

		code === DOWN ? ++this._centerShip : --this._centerShip;

		this._prepareMove();
		this._move();
	}


	_prepareMove() {
		this._gun = this._centerShip + 7;
		this.nextPositionShip.push(this.dataField[this._gun]);
		this.nextPositionShip.push(this.dataField[this._centerShip]);
		if (this._centerShip !== MIN_SHIP_CENTER_POSITION) this.nextPositionShip.push(this.dataField[this._centerShip - 1]);
		if (this._centerShip !== MAX_SHIP_CENTER_POSITION) this.nextPositionShip.push(this.dataField[this._centerShip + 1]);
	}



	_move() {
		this.currentPositionShip.forEach((part) => {
			part.el.style.fill = '#eee';
			part.isShip = false;
		});

		this.nextPositionShip.forEach((part) => {
			part.el.style.fill = '#00f';
			part.isShip = true;
		});

		this.currentPositionShip = this.nextPositionShip;
		this.nextPositionShip = [];
	}



	_shot() {
		let bullet = this.dataField[this._gun + 7];
		bullet.el.style.fill = "#f00";
		bullet.isBullet = true;
		bullet.time = performance.now();
		EventEmitter.trigger('play sound', {type: "blaster"});
	}


	moveBullet(oldCell){
		oldCell.el.style.fill = "#eee";
		oldCell.isBullet = false;

		let newCell = this.dataField[oldCell.index + 7];
		if(newCell) {
			newCell.isBullet = true;
			newCell.el.style.fill = '#f00';
			newCell.time = performance.now();
		}
	}

}