
var app = angular.module('xcontrols');

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