/*
 * Main XComponents module
 *
 * Note: we need to add all dependencies for this module here, so we can reference
 * the module using just angular.module('<modname>');
 */

var app = angular.module('xcontrols', [
	'templates-main',
	'xc.factories',
	'ngResource',
	'ngAnimate',
	'ngSanitize',
	'ui.bootstrap'
]);

//bootstrapping code
var hasNativeHTMLImportsSupport = ('import' in document.createElement('link'));

if (hasNativeHTMLImportsSupport) {
	angular.element(document).ready(function() {
	 angular.bootstrap(document, ['xcontrols']);
	});
} else {
	window.addEventListener('HTMLImportsLoaded', function(e){ 
		angular.bootstrap(document, ['xcontrols']);
	});
}

app.controller('xcController', function($rootScope, $scope, $timeout, $document, xcUtils) {
	
	$scope.menuOptions = [];

	//load the OS specific CSS
	var userAgent = navigator.userAgent;
	$scope.iOS = (/(iPhone|iPad|iPod)/gi).test(userAgent);
	$scope.Android = (/(Android)/gi).test(userAgent);

	$rootScope.iOS = $scope.iOS;
	$rootScope.Android = $scope.Android;

	var baseFolder = '/bower_components';
	var css = baseFolder + '/bootcards/dist/css/';

	var body = angular.element( $document[0].body);

	if ($scope.iOS) {
		css += 'bootcards-ios-lite.min.css';
		body.addClass('bootcards-ios');
	} else if ($scope.Android) {
		css += 'bootcards-android-lite.min.css';
		body.addClass('bootcards-android');
	} else {
		css += 'bootcards-desktop-lite.min.css';
		body.addClass('bootcards-desktop');
	}
	
	var head = angular.element(document.getElementsByTagName('head')[0]);
	head.append("<link rel='stylesheet' href='" + css + "' />");

	//remove hidden class from body to show content
	$('body').removeClass('hidden');

	if (typeof xcontrols != 'undefined') {

		console.log('set XComponents config');

		var config = xcontrols;

		if (config.fields) {

			config.fieldsRead = [];		//list of fields in read mode
			config.fieldsEdit = [];		//list of fields in edit mode
			config.fieldsFormula = [];	//list of field formulas

			//add labels if not specified (proper cased field name)
			for (var i=0; i<config.fields.length; i++) {

				var f = config.fields[i];

				if (!f.type) {
					f.type = 'text';		//default type=text
				}

				if ( !f.hasOwnProperty('label') ) {
					f.label = f.field.substring(0,1).toUpperCase() + f.field.substring(1);
				}
				//set 'show in read mode' property
				if ( !f.hasOwnProperty('read') ) {
					f.read = true;
				}
				//set 'show in edit mode' property
				if ( !f.hasOwnProperty('edit') ) {
					f.edit = true;
				}

				if (f.read) {
					config.fieldsRead.push(f);
				}

				if (f.edit) {
					config.fieldsEdit.push(f);
				}
				if ( f.hasOwnProperty('formula') && f.formula != null ) {
					config.fieldsFormula.push(f);
				}
				if (f.isSummary) {
					config.summaryField = f.field;
				}
				if (f.isDetail) {
					config.detailField = f.field;
				}
			}
		}

		$rootScope.config = xcontrols;

	}

	//initialize bootcards
	$timeout( function() {
		bootcards.init( {
	        offCanvasHideOnMainClick : true,
	        offCanvasBackdrop : false,
	        enableTabletPortraitMode : true,
	        disableRubberBanding : true,
	        disableBreakoutSelector : 'a.no-break-out'
	      });
	}, 500);

});

app.run( function() {
	FastClick.attach(document.body);
});

app.directive('disableNgAnimate', ['$animate', function($animate) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      $animate.enabled(false, element);
    }
  };
}]);

