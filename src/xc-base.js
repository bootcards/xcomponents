
var app = angular.module('xcomponents');

app.directive('xcBase', function() {

	return {

		scope : {
			title : '@',
			footerText : '@'
		},

		replace : true,
		restrict : 'E',
		transclude : true,
		templateUrl : 'xc-base.html'

	};

});