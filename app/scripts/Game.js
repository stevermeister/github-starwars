class Game {

    constructor(options) {

        this._$el = options.el;
        this._$rectList = this._$el.querySelectorAll('rect');
        this.dataField = Game.initData(this._$rectList);

		EventEmitter.on('start game', () =>  this.startGame() );

		new Processor({ data: this.dataField });

	}



    startGame(){
		this._clearData();
	}
	
	
	_clearData(){
    	this.dataField.forEach( (rect) => {
			rect.isShip = false;
			rect.isBullet = false;
			rect.el.style.fill = '#eee';
		} );
	}



	static initData(rectList) {
		let result = [];

		for (let j = 0; j < rectList.length; j++) {
			result.push({
				el: rectList[j],
				index: j,
				time: 0
			});
		}
		return result;
	}
}