/*
 * Main XComponents module
 *
 * Note: we need to add all dependencies for this module here, so we can reference
 * the module using just angular.module('<modname>');
 */

var app = angular.module('xcomponents', [
	'templates-main',
	'xc.factories',
	'ngResource',
	'ngRoute',
	'ngCookies',
	'ngAnimate',
	'ngSanitize',
	'textAngular',
	'ui.bootstrap'
]);

//bootstrapping code
var hasNativeHTMLImportsSupport = ('import' in document.createElement('link'));

if (hasNativeHTMLImportsSupport) {
	
	angular.element(document).ready(function() {
		if (typeof xcomponents != 'undefined') { xcomponents.executeCallbacks(); }
		angular.bootstrap(document, ['xcomponents']);
	});

} else {
	window.addEventListener('HTMLImportsLoaded', function(e){ 
		if (typeof xcomponents != 'undefined') { xcomponents.executeCallbacks(); }
		angular.bootstrap(document, ['xcomponents']);
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

	if (typeof xcomponents != 'undefined') {

		console.log('set XComponents config');

		var config = xcomponents;

		if (config.fields) {

			config.fieldsRead = [];		//list of fields in read mode
			config.fieldsEdit = [];		//list of fields in edit mode
			config.fieldsFormula = [];	//list of field formulas
			config.fieldFilters = [];

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

				if (f.hasOwnProperty('filter')) {
					config.fieldFilters[f.field] = f.filter;
				}

				if (f.type == 'select' || f.type == 'select-multiple') {
				
					if (f.options.hasOwnProperty('endpoint')) {

						f.options = xcUtils.resolveRemoteOptionsList(f.options);
						
					} else if (f.options.length>0 && typeof f.options[0] == 'string') {

						var o = [];

						angular.forEach(f.options, function(option) {
							o.push( {label : option, value : option});
						});

						f.options = o;

					}

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

				
			}
		}

		$rootScope.config = xcomponents;

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

app.directive('disableNgAnimate', ['$animate', function($animate) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      $animate.enabled(false, element);
    }
  };
}]);

app.filter('fltr', function($interpolate, $filter, xcUtils) {
	return function(item, filterName, fieldType) {

		if (arguments.length >= 3 && fieldType != 'text') {
			//filter by field type
			return $filter(fieldType)(item);
		} else if (!filterName) {
			return item;	
		} else {
			var _res = $interpolate('{{value | ' + filterName + '}}');
			return _res( {value : item } );
		}
	};
});

