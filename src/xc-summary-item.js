

var app = angular.module('xcontrols');

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
		templateUrl : 'xc-summary-item.html'

	};

});