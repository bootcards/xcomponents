
var app = angular.module('xcontrols');

app.directive('xcCarousel', function() {

	return {

		scope : {
			interval : '='
		},
		replace : true,
		restrict : 'E',
		templateUrl : 'xc-carousel.html',

		controller : function($scope, xcUtils) {

			$scope.slides = xcUtils.getConfig('carouselSlides');

		}

	};


} );