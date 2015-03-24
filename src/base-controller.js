var app = angular.module("xcomponents");

app.controller( "BaseController", [
	'$rootScope', '$scope', '$modal', 'xcUtils', 'xcDataFactory',
	function($rootScope, $scope, $modal, xcUtils, xcDataFactory) {

	$scope.addNewItem = function() {

		var modalInstance = $scope.modalInstance = $modal.open({
			templateUrl: 'xc-form-modal-edit.html',
			controller: 'UpdateItemInstanceCtrl',
			backdrop : true,
			resolve: {
				selectedItem : function () {
					return {};
				},
				model : function() {
					return $scope.model;
				},
				isNew : function() {
					return true;
				},
				allowDelete : function() {
					return false;
				}
			}
		});

		modalInstance.result.then(function (data) {
			if (data.reason =='save') {
				$scope.saveNewItem(data.item);
			}
	    }, function () {
	      //console.log('modal closed');
	    });


	};

	$scope.saveNewItem = function(targetItem) {

    	xcUtils.calculateFormFields(targetItem, $scope.model);

    	$scope.select(targetItem);
		
		xcDataFactory.getStore($scope.datastoreType)
		.saveNew( $scope.url, targetItem )
		.then( function(res) {

			if ($scope.type == 'categorised' || $scope.type=='accordion'){ 

				//do a full refresh of the list
				$rootScope.$emit('refreshList', '');

			} else {

				//add the item to the list and sort it
				var sortFunction = xcUtils.getSortByFunction( $scope.orderBy, $scope.orderReversed );

				$scope.items.push(res);

		        //resort
		        var ress = $scope.items;
		        ress.sort( sortFunction );

		        $scope.items = ress;

			}				

		})
		.catch( function(err) {
			alert("The item could not be saved/ updated: " + err.statusText);
		});

	};

	$scope.saveItem = function(targetItem) {

		xcUtils.calculateFormFields(targetItem, $scope.model);

		$scope.selectedItem = targetItem;

		xcDataFactory.getStore($scope.datastoreType)
		.update( $scope.url, $scope.selectedItem)
		.then( function(res) {

			$rootScope.$emit('refreshList', '');
			$scope.isNew = false;

		})
		.catch( function(err) {
			alert("The item could not be saved/ updated: " + err.statusText);
		});

	};

	$scope.deleteItem = function(targetItem) {

		xcDataFactory.getStore($scope.datastoreType)
		.delete( $scope.url, targetItem )
		.then( function(res) {

			$scope.$emit('deleteItemEvent', targetItem);
			$scope.selectedItem = null;

		})
		.catch( function(err) {
			console.error(err);
		});

	};

	$scope.editDetails = function(item) {

		var modalInstance = $scope.modalInstance = $modal.open({
			templateUrl: 'xc-form-modal-edit.html',
			controller: 'UpdateItemInstanceCtrl',
			backdrop : true,
			resolve: {
				selectedItem : function () {
					return item;
				},
				model : function() {
					return $scope.model;
				},
				isNew : function() {
					return $scope.isNew;
				},
				allowDelete : function() {
					return $scope.allowDelete;
				}
			}
		});

		modalInstance.result.then(function (data) {
			if (data.reason == 'save') {
				$scope.saveItem(data.item);
			} else if (data.reason == 'delete') {
				$scope.deleteItem(data.item);
			}
	    }, function () {
	      //console.log('modal closed');
	    });
	};

} ]);