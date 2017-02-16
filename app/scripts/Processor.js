
class Processor {

	constructor(options){
		this.dataField = options.data;

		this.ship = new Spaceship({ dataField: this.dataField });

		EventEmitter.on('start game', () => this._startProcessor({data: this.dataField, context: this}) );
	}


	_startProcessor(options) {
		let { data, context } = options;

		requestAnimationFrame(function __animateLoop() {
			data.forEach(context.checkState.bind(context));
			if(context.isStop) return;
			requestAnimationFrame(__animateLoop);
		});

	}


	checkState(rect){
		switch(true){

			case rect.isBullet:
				this._isBullet(rect);
				break;

			case rect.isShip:
				this._isShip(rect);
				break;
		}
	}


	_isBullet(rect){
		if(rect.isBulletStar){
			rect.el.style.fill = '#eee';
			rect.isBulletStar = false;
			rect.isBullet = false;
		}
		else if(rect.isAim){
			EventEmitter.trigger('stop game', {type: '_win'});
		}
		else if(rect.isStarBody){
			rect.el.style.fill = '#000';
			rect.isBullet = false;
		}
		else{
			Processor.animate({
				duration: 60,
				draw: this.ship.moveBullet.bind(this.ship),
				rect: rect
			});
		}
	}


	_isShip(rect){
		if(rect.isStarBody || rect.isBulletStar){
			EventEmitter.trigger('stop game', {type: 'lose'});
		}
	}


	static  animate(options) {

		let lastRender = options.rect.time;
		let now = performance.now();

		// timeFraction от 0 до 1
		let timeFraction = (now - lastRender) / options.duration;

		if (timeFraction >= 1) {
			options.draw(options.rect, options.duration);
		}

	}

}