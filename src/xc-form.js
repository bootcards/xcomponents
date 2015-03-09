
var app = angular.module('xcontrols');

app.directive('xcForm', 
	['$rootScope', 'RESTFactory', 'PouchFactory', 'LowlaFactory', 'configService', 
	function($rootScope, RESTFactory, PouchFactory, LowlaFactory, configService) {

	return {

		scope : {
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

			//set defaults
			configService.setEndpoint( $scope.url);
			$scope.allowDelete = (typeof $scope.allowDelete == 'undefined' ? true : $scope.allowDelete);

			$scope.selectedItem = null;
			$scope.fieldsRead = xcUtils.getConfig('fieldsRead');
			$scope.fieldsEdit = xcUtils.getConfig('fieldsEdit');
			$scope.modelName = xcUtils.getConfig('modelName');
			$scope.isNew = true;

			$rootScope.$on('selectItemEvent', function(ev, item) {
				$scope.selectedItem = item;
				$scope.isNew = false;

				if (item == null) {

					$scope.thumbnailSrc==null;
					
				} else {

					if ( $scope.thumbnailField != null && $scope.thumbnailField.length > 0) {
						$scope.thumbnailSrc = xcUtils.getConfig('imageBase') + item[$scope.thumbnailField];
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

				var f = null;
				switch( $attrs.datastoreType) {
					case 'pouch':
						f=PouchFactory; break;
					case 'lowla':
						f=LowlaFactory; break;
					default:
						f=RESTFactory; break;
				}

				f.exists( $scope.itemId)
				.then( function(res) {

					if (res.exists) {

						//open existing data object

						$scope.isNew = false;

						f.getById($scope.itemId)
						.then( function(item) {

							$scope.selectedItem = item;

							if ( $scope.thumbnailField != null && $scope.thumbnailField.length > 0) {
								$scope.thumbnailSrc = xcUtils.getConfig('imageBase') + item[$scope.thumbnailField];
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

			$scope.editDetails = function() {
				$scope.modalInstance = $modal.open({
					templateUrl: 'xc-form-modal-edit.html',
					controller: 'UpdateItemInstanceCtrl',
					backdrop : true,
					resolve: {
						selectedItem : function () {
							return $scope.selectedItem;
						},
						fieldsEdit : function() {
							return $scope.fieldsEdit;
						},
						modelName : function() {
							return $scope.modelName;
						},
						isNew : function() {
							return $scope.isNew;
						},
						allowDelete : function() {
							return $scope.allowDelete;
						},
						items : function() {
							return null;
						},
						scope : function() {
							return $scope;
						}
					}
				});
			};

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

			
		},

		link : function(scope, elem, attrs) {

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
