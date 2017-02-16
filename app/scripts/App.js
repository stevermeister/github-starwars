
class App{

	constructor(options){
		let $svg = options.svg;

		App.initToolbar($svg);
		new Game({el: $svg});

		this.$startBtn = document.getElementById('btn_game_start');
		this.$startBtnAgain = document.getElementById('btn_game_start_again');

		this.$startBtn.addEventListener('click', () => this.startGame() );
		this.$startBtnAgain.addEventListener('click', () => this.startGame() );

	}

	static initToolbar(svg){
		let toolbar = document.createElement('div');
		toolbar.innerHTML = `<button style="display: block; background: #4078c0; border-radius: 2px; padding: 5px 20px; color: #fff; border: 0;" id="btn_game_start">Start</button>
			<div style="position: relative; height: 40px; display: none; background: #fff;">
			<button style="float: left; background: #4078c0; border-radius: 2px; margin-left: 10px; padding: 5px 20px; color: #fff; border: 0;" id="btn_game_start_again">Try again</button>
			<h2 style="text-align: left; margin-left: 100px; float: left" class="score-game">Score: 0</h2>
				<div  style="float: left; background: #eee; line-height: 40px; margin-left: 150px; padding: 0 20px;">
					<strong style="color: #ff7978">W-</strong>Fire  
					<strong style="color: #ff7978">A-</strong>Up  
					<strong style="color: #ff7978">D-</strong>Down  
				</div>
			</div>`;

		toolbar.style.cssText = `
		    position: absolute;
		    top: -50px;
		    width: 100%;
		    background: #fff;
        `;
		svg.parentNode.style.position = 'relative';
		svg.parentNode.appendChild(toolbar);

	}


	startGame(){
		this.$startBtn.style.display = 'none';
		this.$startBtn.nextElementSibling.style.display = 'block';
		EventEmitter.trigger('start game');
	}

}
