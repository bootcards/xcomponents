
var app = angular.module('xcomponents');

app.directive('xcImage', function() {

	return {

		scope : {
			title : '@',
			sourceField : '@'
		},

		restrict : 'E',
		replace : true,
		templateUrl: 'xc-image.html',

		controller : function($scope, $rootScope, xcUtils) {

			$scope.imageSrc = null;

			$rootScope.$on('selectItemEvent', function(ev, item) {
				
				$scope.imageSrc = null;

				if ( item[$scope.sourceField] != null && item[$scope.sourceField].length > 0) {
			
					$scope.imageSrc = xcUtils.getConfig('imageBase') + item[$scope.sourceField];

				}
	
			});

		}

	};

});