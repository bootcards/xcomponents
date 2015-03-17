
var xcomponents = xcomponents || {

	editorToolbarOptions : [['bold','italics','underline'],['ol','ul','insertImage','insertLink']],

	menuOptions : [],
	footerOptions : [],
	charts : [],
	menuAlignRight : true,

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
