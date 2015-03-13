var app = angular.module("xcomponents");

app.directive('xcLayout', [ function() {

	return {

		restrict : 'E',
		transclude : true,
		replace : true,
		templateUrl: 'xc-layout.html'

	};

} ] );
