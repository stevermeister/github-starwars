@@include('./lib.js')
@@include('./constants.js')
@@include('./Spaceship.js')
@@include('./Processor.js')
@@include('./Game.js')
@@include('./App.js')

let app = new App({
	svg: document.querySelector('.js-calendar-graph-svg')
});