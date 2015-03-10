
var app = angular.module('xcomponents');

app.directive('xcReading', function() {

	return {

		scope : {
			title : '@',
			footerText : '@'
		},

		replace : true,
		restrict : 'E',
		transclude : true,
		templateUrl : 'xc-reading.html',

		controller : function($scope) {

			$scope.increaseFontSize = function() {
				$(".typographyreadcontent").find("*").each(
					function() {
						$(this).css("font-size",
								(parseInt($(this).css("font-size"), 10) + 2) + "px");
						if (parseInt($(this).css("line-height"), 10) <= parseInt(
								$(this).css("font-size"), 10)) {
							$(this).css(
									"line-height",
									(parseInt($(this).css("line-height"), 10) + 2)
											+ "px");
						}
					});
			};

			$scope.decreaseFontSize = function() {
				$(".typographyreadcontent").find("*").each(
					function() {
						var tagName = $(this).prop("tagName");
						var fontSize = parseInt($(this).css("font-size"), 10);
						var minFontSize = 4;
						if (tagName == "H1") {
							minFontSize = 28;
						} else if (tagName == "H2") {
							minFontSize = 24;
						} else if (tagName == "H3") {
							minFontSize = 18;
						} else if (tagName == "H4") {
							minFontSize = 12;
						} else if (tagName == "H5") {
							minFontSize = 8;
						}
						if (fontSize - 2 >= minFontSize) {
							$(this).css("font-size", (fontSize - 2) + "px");
							if (parseInt($(this).css("line-height"), 10) > 24) {
								$(this).css(
										"line-height",
										(parseInt($(this).css("line-height"), 10) - 2)
												+ "px");
							}
						}
					});
			}


		}

	};

});