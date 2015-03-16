
var xcomponents = xcomponents || {
	callbacks : [],
	menuOptions : [],
	footerOptions : [],
	charts : [],
	menuAlignRight : true,

	addCallback : function( fnCallback) {
		this.callbacks.push(fnCallback);

	},

	executeCallbacks : function() {
		for (var i=0; i<this.callbacks.length; i++) {
			this.callbacks[i].call();
		}
	}
};
