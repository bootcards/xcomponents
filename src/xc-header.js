
var app = angular.module('xcomponents');

app.directive('xcHeader', function() {

	return {

		scope : {
			title : '@'
		},

		replace : true,
		restrict : 'E',
		templateUrl : 'xc-header.html',
		transclude : true,

		controller : function($rootScope, $scope, $document, xcUtils, $timeout) {

			$scope.showBackButton = false;

			$scope.menuAlignRight = xcUtils.getConfig('menuAlignRight') || false;
			$scope.menuOptions = [];
			$scope.menuOptionsSecondary = [];
			$scope.hasSecondaryOptions = false;

			//split primary/ secondary option
			angular.forEach( xcUtils.getConfig('menuOptions'), function(option) {
				option.collapsed = true;
				if (option.hasOwnProperty('isSecondary') && option.isSecondary) {
					$scope.menuOptionsSecondary.push( option);
					$scope.hasSecondaryOptions = true;
				} else {
					$scope.menuOptions.push( option);
				}
			});

			if ($scope.hasSecondaryOptions) {
				angular.element($document[0].body).addClass('has-bootcards-navbar-double');
			}



			$scope.appVersion = xcUtils.getConfig('appVersion');

			var loc = window.location.href;

			$scope.hasMenu = function() {
				return $scope.menuOptions.length > 0 || $scope.hasSecondaryOptions;
			};

			$scope.isActive = function(menuOption) {
				return (loc.indexOf(menuOption.url)> -1);
			};

			$scope.hasSubmenu = function(menuOption) {
				return (menuOption.hasOwnProperty('menuOptions') && menuOption.menuOptions.length>0);
			};

			//add handlers to show the collapsed/ expanded icon on lists with sub-options
			$timeout(function(){

		        $('.offcanvas li')
		        .on('shown.bs.dropdown', function() {
					var a = $(event.srcElement);
					var i = a.children("i");
					i.addClass("fa-chevron-circle-down").removeClass("fa-chevron-circle-right");
				})
				  .on('hidden.bs.dropdown', function() {
					var a = $(event.srcElement);
					var i = a.children("i");
					i.addClass("fa-chevron-circle-right").removeClass("fa-chevron-circle-down");
				});
		    }); 

		    $rootScope.$on("selectItemEvent", function(ev, item) {
		    	//item selected: hide the 'menu' button

		    	if (bootcards.isXS() ) {

		    		if ( !$scope.toggleMenuButton) {	
						$scope.toggleMenuButton = angular.element(document.getElementById('offCanvasToggleButton'));
					}
					if ( !$scope.backButton) {
						$scope.backButton = angular.element(document.getElementById('backButton'));
					}

					if (item != null) {
						$scope.backButton.removeClass("hidden");
						$scope.toggleMenuButton.addClass("hidden");
						$rootScope.hideList = true;
					} else {
						$scope.backButton.addClass("hidden");
						$scope.toggleMenuButton.removeClass("hidden");
						$rootScope.hideList = false;
					}

					$rootScope.showCards = (item != null);

				} else {

					$rootScope.showCards = true;
					window.scrollTo(0, 0);
				}

		    });

			$scope.goBack = function() {
				$scope.$emit('selectItemEvent', null);
				$rootScope.hideList = false;
			};
   
		}

	};

});