
var app = angular.module('xcomponents');

app.directive('xcFooter', function() {

	return {

		replace : true,
		restrict : 'E',
		templateUrl : 'xc-footer.html',
		transclude : true,

		controller : function($rootScope, $scope, $document, xcUtils, $timeout) {

			$scope.footerOptions = xcUtils.getConfig('footerOptions');

		}

	};

});