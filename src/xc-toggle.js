
var app = angular.module('xcomponents');

app.directive('xcToggle', function() {

	return {

		replace : true,
		restrict : 'E',

		scope : {
			value: '=ngModel'
		},

		template : '<div class="bootcards-toggle"><div class="bootcards-toggle-handle"></div></div>',

		link : function (scope, element, attrs) {
            element.bind('click', function () {
            	if (element.hasClass('active')) {
             		scope.value = 'false';
             		element.removeClass('active');
             	} else {
             		scope.value = 'true';
             		element.addClass('active');
             	}
            });

            if (scope.value == 'true') {
            	element.addClass('active');
            }

        }

	};

});