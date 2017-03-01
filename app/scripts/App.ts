import { EventEmitter } from "./lib";
import { Game } from "./Game";

class App{
	public $startBtn: HTMLElement;
	public $startBtnAgain: HTMLElement;

	constructor(options: {svg: Element}){
		let $svg: Element = options.svg;

		App.initToolbar($svg);

		this.$startBtn = document.getElementById('btn_game_start');
		this.$startBtnAgain = document.getElementById('btn_game_start_again');

		this.$startBtn.addEventListener('click', () => {
			new Game({el: $svg});
			this.startGame();
		} );
		this.$startBtnAgain.addEventListener('click', () => this.startGame() );

	}

	static initToolbar(svg:Element):void {
		let toolbar:HTMLDivElement = document.createElement('div');
		toolbar.innerHTML = `<button style="display: block; background: #4078c0; border-radius: 2px; padding: 5px 20px; color: #fff; border: 0;" id="btn_game_start">Start</button>
			<div style="position: relative; height: 40px; display: none; background: #fff;">
			<button style="float: left; background: #4078c0; border-radius: 2px; margin-left: 10px; padding: 5px 20px; color: #fff; border: 0;" id="btn_game_start_again">Try again</button>
			<h3 style="text-align: left; margin-left: 50px; float: left" class="score-game">Score: 0</h3>
				<div  style="float: left; background: #eee; line-height: 40px; margin-left: 50px; padding: 0 20px;">
					<strong style="color: #ff7978">F-</strong>Fire  
					<strong style="color: #ff7978">Num 8-</strong>Up  
					<strong style="color: #ff7978">Num 5-</strong>Down
					<strong style="color: #ff7978">Num 4-</strong>Left
					<strong style="color: #ff7978">Num 6-</strong>Right
				</div>
			</HTMLDivElement>`;

		toolbar.style.cssText = `
		    position: absolute;
		    top: -50px;
		    width: 100%;
		    background: #fff;
        `;
		(svg.parentNode as HTMLElement).style.position = 'relative';
		svg.parentNode.appendChild(toolbar);

	}


	public startGame(): void{
		this.$startBtn.style.display = 'none';
		(this.$startBtn.nextElementSibling as HTMLElement).style.display = 'block';
		EventEmitter.trigger('start game');
	}

}
export { App };