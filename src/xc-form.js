
var app = angular.module('xcomponents');

app.directive('xcForm', 
	['$rootScope', '$controller', 'xcDataFactory', 
	function($rootScope, $controller, xcDataFactory) {

	return {

		scope : {
			modelName : '@',				/*required: name of the model to use for the form instance*/
			item : '=',
			itemId : '@',
			url : '@',
			defaultText : '@',
			thumbnailField : '@',
			thumbnailShowWith : '@',
			iconField : '@',				/*icon*/ 
			imagePlaceholderIcon : '@',		/*icon to be used if no thumbnail could be found, see http://fortawesome.github.io/Font-Awesome/icons/ */
			allowDelete : '=?',
			datastoreType : '@'

		},

		replace : true,
		restrict : 'E',
		templateUrl: 'xc-form.html',

		controller : function($scope, $attrs, $modal, xcUtils) {

			if (!$scope.modelName) {

				console.error("cannot load form: no model name provided");
				return;

			} else {

				//get the model config
				var models = xcUtils.getConfig('models');
				$scope.model = models[$scope.modelName];

				if (!$scope.model) {
					console.error("cannot load list: invalid model name provided ('" + $scope.modelName + "')");
					return;
				}

			}

			// instantiate base controller
			$controller('BaseController', { 
				$scope: $scope, 
				$modal : $modal
			} );

      		$scope.fieldsRead = $scope.model.fieldsRead;
			$scope.fieldsEdit = $scope.model.fieldsEdit;
			$scope.imageBase = $scope.model.imageBase;

			//set defaults
			$scope.allowDelete = (typeof $scope.allowDelete == 'undefined' ? true : $scope.allowDelete);
			$scope.selectedItem = null;
			$scope.isNew = true;

			$rootScope.$on('selectItemEvent', function(ev, item) {
				$scope.selectedItem = item;
				$scope.isNew = false;

				if (item == null) {

					$scope.thumbnailSrc==null;
					
				} else {

					if ( $scope.thumbnailField != null && $scope.thumbnailField.length > 0) {
						$scope.thumbnailSrc = $scope.imageBase + item[$scope.thumbnailField];
					}

					angular.forEach($scope.fieldsEdit, function(fld) {
						//convert date fields (stored as strings) to JS date objects
						if (fld.type == 'date') {
							if ($scope.selectedItem[fld.field] != null && $scope.selectedItem[fld.field].length>0) {
								$scope.selectedItem[fld.field] = new Date( $scope.selectedItem[fld.field]);
							}
						}
					});
				}

			});
 
			//load specified entry 
			if (typeof $scope.itemId != 'undefined' ) {

				var f = xcDataFactory.getStore($attrs.datastoreType);

				f.exists( $scope.url, $scope.itemId)
				.then( function(res) {

					if (res.exists) {

						//open existing data object

						$scope.isNew = false;

						f.getById($scope.itemId)
						.then( function(item) {

							$scope.selectedItem = item;

							if ( $scope.thumbnailField != null && $scope.thumbnailField.length > 0) {
								$scope.thumbnailSrc = $scope.imageBase + item[$scope.thumbnailField];
							}

							angular.forEach($scope.fieldsEdit, function(fld) {
								//convert date fields (stored as strings) to JS date objects
								if (fld.type == 'date') {
									$scope.selectedItem[fld.field] = new Date( $scope.selectedItem[fld.field]);
								}
							});

						});
					} else {

						//create new object
						$scope.selectedItem = { id : $scope.itemId } ;
						$scope.isNew = true;
					}

				});
				
				
			}

			

			//determine if we need to show an image, placeholder image or just an icon
			$scope.showImage = function() {
				return $scope.selectedItem && $scope.thumbnailField && $scope.selectedItem[$scope.thumbnailField];
			};
			$scope.showPlaceholder = function() {
				return $scope.selectedItem && $scope.selectedItem && $scope.imagePlaceholderIcon && !$scope.selectedItem[$scope.thumbnailField];
			};
			$scope.showIcon = function() {
				return $scope.selectedItem && $scope.iconField && $scope.selectedItem[$scope.iconField];
			};

			
			
		}

	};

}]);



app.directive('animateOnChange', function($animate) {
	return function(scope, elem, attr) {
			scope.$watch(attr.animateOnChange, function(nv,ov) {
				if (nv!=ov) {
					var c = nv > ov?'change-up':'change';
					$animate.addClass(elem,c, function() {
						$animate.removeClass(elem,c);
					});
				}
			})  
	}; 
});
