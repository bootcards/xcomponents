
var app = angular.module('xcontrols');

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