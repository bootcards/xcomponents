
var app = angular.module('xcontrols');

app.directive('xcFile', function() {

	return {

		scope : {
			title : '@',
			fileName : '@',
			fileType : '@',
			fileSize : '@',
			summary : '@',
			description : '@',
			previewUrl : '@',
			url : '@',
			allowFavorite : '=',
			allowEmail : '='
			
		},

		replace : true,
		restrict : 'E',
		transclude : true,
		templateUrl : 'xc-file.html'

	};

});