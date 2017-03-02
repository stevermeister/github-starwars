import { EventEmitter } from "./lib";
import { Game } from "./Game";

class App{

	constructor(options: {svg: Element}){
		let $svg: Element = options.svg;

		App.initToolbar($svg);

		new Game({el: $svg, score: document.querySelector(".score-game")});

		document.addEventListener("keypress", (event) => {
			if (event.keyCode === 13) {
				event.preventDefault();
				EventEmitter.trigger('start game');
			}
		});
	}

	static initToolbar(svg:Element):void {
		let toolbar:HTMLDivElement = document.createElement('div');
		toolbar.innerHTML = `<h3 style="text-align: left; margin-left: 50px; float: left" class="score-game">Score: 0</h3>
				<div  style="float: left; background: #eee; line-height: 40px; margin-left: 50px; padding: 0 20px;">
					<strong style="color: #ff7978">Enter-</strong>Start Game 
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

}
export { App };