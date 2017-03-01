let EventEmitter = {

	"subscribers": {},

	"on": function on(event: string, cb: Function) {
		let eventType = event || 'default';
		if (!this.subscribers[eventType]) {
			this.subscribers[eventType] = [];
		}
		this.subscribers[eventType].push(cb);
	},

	"off": function off(event: string, cb: Function) {
		if (this.subscribers[event]) {
			this.subscribers[event] = this.subscribers[event].filter(function (item) {
				return cb !== item;
			});
		} else {
			console.error(event + ' not found!');
		}
	},

	"trigger": function trigger(event:string, options = null) {

		let sub = this.subscribers[event];

		if (sub) {
			for (let i = 0, len = sub.length; i < len; i++) {
				sub[i](options);
			}
		} else {
			console.log('EE.trigger: not found subscribers for ' + event + ' event');
		}
	}
};

export { EventEmitter};