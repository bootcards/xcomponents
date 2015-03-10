
var app = angular.module('xcomponents');

app.directive('xcSummary', function() {

	return {

		scope : {
			title : '@',
			footerText : '@'
		},

		replace : true,
		restrict : 'E',
		transclude : true,
		templateUrl : 'xc-summary.html'

	};

});