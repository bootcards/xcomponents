
var xcomponents = xcomponents || {
	callbacks : [],

	addCallback : function( fnCallback) {
		this.callbacks.push(fnCallback);

	},

	executeCallbacks : function() {
		for (var i=0; i<this.callbacks.length; i++) {
			this.callbacks[i].call();
		}
	}
};


console.log( xcomponents.callbacks.length);