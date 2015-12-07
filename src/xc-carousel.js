/*
 * XComponents carousel card 
 * http://xcomponents.org/site/docs.html#doc-carousel
 */

var app = angular.module('xcomponents');

app.directive('xcCarousel', [function() {

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


} ]);