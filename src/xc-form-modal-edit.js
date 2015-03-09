
var app = angular.module('xcontrols');

app.controller('UpdateItemInstanceCtrl', 
	['$rootScope', '$scope', '$modalInstance', 'selectedItem', 'xcUtils', 'fieldsEdit', 'RESTFactory', 'PouchFactory', 
	'LowlaFactory', 'scope', 'configService', 'xcUtils', 'modelName', 'isNew', 'allowDelete', 'items',
	function ($rootScope, $scope, $modalInstance, selectedItem, xcUtils, fieldsEdit, RESTFactory, PouchFactory, 
		LowlaFactory, scope, configService, xcUtils, modelName, isNew, allowDelete, items) {

	if (selectedItem == null) {
		selectedItem = {};
	}

	//check for date fields
	angular.forEach( fieldsEdit, function(field) {
	
		if (field.type == 'date' && isNew) {
			if (field.hasOwnProperty('default') ) {
				switch(field['default']) {
					case 'now':
						selectedItem[field.field] = new Date(); break;
				}	
			}
		}
	
	});

	$scope.selectedItem = selectedItem;
	$scope.fieldsEdit = fieldsEdit;
	$scope.modelName = modelName;
	$scope.isNew = isNew;
	$scope.allowDelete = allowDelete;

	$scope.clearField = function(fld) {
		/*clear a field*/
		$scope.selectedItem[fld] = "";
	};
	$scope.isEmpty = function(fld) {
		return fld == null || typeof fld == 'undefined' || fld.length == '';
	};

	$scope.saveItem = function(form) {

	  	if (!form.$valid) { 

	  		var msgs = [];

	  		msgs.push("Please correct the following errors:\n");

	  		if (form.$error.required) {
	  			msgs.push("- fill in all required fields\n");
	  		}
	  		
	  		if (form.$error.email) {
				msgs.push("- enter a valid email address\n");
	  		}

	  		alert(msgs.join(''));
	  		return;

	  	}

		xcUtils.calculateFormFields(selectedItem);

		//determine the factory to use to store the data
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

				if (scope.type == 'categorised' || scope.type=='accordion'){ 

					$rootScope.$emit('refreshList', '');

				} else {

					scope.items.push(res);

			        //resort
			        var ress = scope.items;
			        ress.sort( sortFunction );

			        scope.items = ress;

				}

				$modalInstance.close();				

			})
			.catch( function(err) {
				alert("The item could not be saved/ updated: " + err.statusText);
			});


		} else {
			
			f.update( $scope.selectedItem)
			.then( function(res) {

				$rootScope.$emit('refreshList', '');

				$modalInstance.close();
				$scope.isNew = false;

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