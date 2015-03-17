
var app = angular.module('xcomponents');

app.controller('UpdateItemInstanceCtrl', 
	[ '$scope', '$modalInstance', 'selectedItem', 'fieldsEdit', 'modelName', 'isNew', 'allowDelete', 'xcUtils',
	function ( $scope, $modalInstance, selectedItem, fieldsEdit, modelName, isNew, allowDelete, xcUtils) {

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

	//create a copy of the object we're editing (to deal with 'cancel')
	$scope.selectedItem = angular.copy( selectedItem );

	$scope.fieldOptions = [];
	$scope.editorToolbarOptions = xcUtils.getConfig('editorToolbarOptions');

	angular.forEach( fieldsEdit, function(f) {
		if (f.type.indexOf('sel')==0) {

			$scope.fieldOptions[f.field] = f.options;

			try {
				f.options.then( function(res) {
					$scope.fieldOptions[f.field] = res;
				});
			} catch (e) { }
		}

	})

	//$scope.selectedItem = selectedItem;
	$scope.fieldsEdit = fieldsEdit;
	$scope.modelName = modelName;
	$scope.isNew = isNew;
	$scope.allowDelete = allowDelete;

	$scope.clearField = function(fld) {
		$scope.selectedItem[fld] = "";
	};
	$scope.isEmpty = function(fld) {
		return fld == null || typeof fld == 'undefined' || fld.length == '';
	};

	$scope.saveItem = function(form) {

		//validate the input
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

		$modalInstance.close({reason: 'save', item : $scope.selectedItem});

	};

	$scope.deleteItem = function() {
		$modalInstance.close({reason:'delete', item: $scope.selectedItem} );
	};

	$scope.cancelEdit = function () {
		$modalInstance.dismiss('cancel');
	};

} ] );