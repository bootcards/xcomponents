
function getXComponentsLibsPath() {
	//return the absolute path to the libs folder that contains XComponents

	var scripts = document.getElementsByTagName('script');
	var path = scripts[scripts.length-1].src.split('?')[0];
	var pathComps = path.split('/');
	var libsPath = pathComps.slice(0, -4).join('/')+'/';  // remove last filename part of path
	return libsPath;

}

var xcomponents = xcomponents || {

	editorToolbarOptions : [['bold','italics','underline'],['ol','ul','insertImage','insertLink']],

	menuOptions : [],
	footerOptions : [],
	models : [],
	charts : [],
	menuAlignRight : true,

	callbacks : [],
	libsPath : getXComponentsLibsPath(),

	addCallback : function( fnCallback) {
		this.callbacks.push(fnCallback);

	},

	executeCallbacks : function() {
		for (var i=0; i<this.callbacks.length; i++) {
			this.callbacks[i].call();
		}
	}
};
