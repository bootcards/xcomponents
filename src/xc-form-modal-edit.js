
var app = angular.module('xcontrols');

app.controller('UpdateItemInstanceCtrl', 
	['$scope', '$modalInstance', 'selectedItem', 'xcUtils', 'fieldsEdit', 'RESTFactory', 'PouchFactory', 
	'LowlaFactory', 'scope', 'configService', 'xcUtils', 'modelName', 'isNew', 'allowDelete', 'items',
	function ($scope, $modalInstance, selectedItem, xcUtils, fieldsEdit, RESTFactory, PouchFactory, 
		LowlaFactory, scope, configService, xcUtils, modelName, isNew, allowDelete, items) {

	if (selectedItem == null) {

		//creating a new item: check for field defaults from config
		selectedItem = {};

		angular.forEach( fieldsEdit, function(field) {

			if (field.hasOwnProperty('default') && field.type == 'date') {
				switch(field['default']) {
					case 'now':
						selectedItem[field.field] = new Date();
				}
	
			}
		
		});

	}

	$scope.selectedItem = selectedItem;
	$scope.fieldsEdit = fieldsEdit;
	$scope.modelName = modelName;
	$scope.isNew = isNew;
	$scope.allowDelete = allowDelete;

	$scope.clearField = function(fld) {
		/*clear a field*/
		$scope.selectedItem[fld] = "";
	};

	$scope.saveItem = function(form) {
  	
	  	if (!form.$valid) { alert('Please fill in all required fields'); return; }

		xcUtils.calculateFormFields(selectedItem);

		//determine the factory to use
		var f = null;
		switch( scope.datastoreType) {
			case 'pouch':
				f=PouchFactory; break;
			case 'lowla':
				f=LowlaFactory; break;
			default:
				f=RESTFactory; break;
		}

		if ($scope.isNew) {

			var orderReversed = $scope.$eval(scope.orderReversed);		//for booleans  
			var sortFunction = xcUtils.getSortByFunction( scope.orderBy, orderReversed );

			f.saveNew( $scope.selectedItem )
			.then( function(res) {
				
				if (scope.type == 'categorised' || scope.type=='accordion') {

					scope.groups = xcUtils.getGroups( res, scope.groupBy, scope.orderBy, orderReversed );

				} else {

					scope.items.push(res);

			        //resort
			        var ress = scope.items;

			        ress.sort( sortFunction );

			        scope.items = ress;

					//return first page of results
					var b = [];
					for (var i=0; i<scope.itemsPerPage && i<ress.length; i++) {
						b.push( ress[i]);
					}

					scope.itemsPage = b;

				}

				$modalInstance.close();				

			})
			.catch( function(err) {
				alert("The item could not be saved/ updated: " + err.statusText);
			});


		} else {

			f.update( $scope.selectedItem)
			.then( function(res) {

				$scope.selectedItem = res;

				$modalInstance.close();
				$scope.isNew = false;

				//$scope.$apply();

			})
			.catch( function(err) {
				alert("The item could not be saved/ updated: " + err.statusText);
			});
		}

	};

  	//delete an item
	$scope.deleteItem = function() {

		var f = null;
		switch( scope.datastoreType) {
			case 'pouch':
				f=PouchFactory; break;
			case 'lowla':
				f=LowlaFactory; break;
			default:
				f=RESTFactory; break;
		}

		f.delete( $scope.selectedItem )
		.then( function(res) {

			$scope.$emit('deleteItemEvent', $scope.selectedItem);

			//clear the selected item
			$scope.selectedItem = null;
			$modalInstance.close();

		})
		.catch( function(err) {
			console.error(err);
		});
		
	};

  $scope.cancelEdit = function () {
    $modalInstance.dismiss('cancel');
  };

} ] );