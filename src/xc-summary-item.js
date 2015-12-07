

var app = angular.module('xcomponents');

app.directive('xcSummaryItem', function() {

	return {

		scope : {
			title : '@title',
			target : '@target',
			icon : '@icon',
			count : '@count'
		},

		replace : true,
		restrict : 'E',
		templateUrl : 'xc-summary-item.html',

		controller : function($scope) {

			$scope.openLink = function(url) {
				window.location.href = url;
			};

		}

	};

});