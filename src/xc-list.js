var app = angular.module("xcontrols");

app.directive('xcList', 
	['$rootScope', '$filter', 'xcUtils', 'RESTFactory', 'PouchFactory', 'LowlaFactory', 'configService', 
	function($rootScope, $filter, xcUtils, RESTFactory, PouchFactory, LowlaFactory, configService) {

	var loadData = function(scope) {

		if ( scope.srcDataEntries) {

			scope.isLoading = false;
			scope.hasMore = false;
			scope.items = scope.srcDataEntries;
			scope.totalNumItems = scope.items.length;
			
		} else {

			var f = null;
			switch( scope.datastoreType) {
				case 'pouch':
					f=PouchFactory; break;
				case 'lowla':
					f=LowlaFactory; break;
				default:
					f=RESTFactory; break;
			}
		
			f.all().then( function(res) {
				
				var numRes = res.length;

				if (scope.filterBy && scope.filterValue) {
					//filter the result set
					
					var filteredRes = [];

					angular.forEach( res, function(entry, idx) {

						if (entry[scope.filterBy] == scope.filterValue) {
							filteredRes.push( entry);
						}
					});

					res = filteredRes;

				}
				
				if (scope.type == 'categorised' || scope.type=='accordion') {

					scope.groups = xcUtils.getGroups( res, scope.groupBy, scope.orderBy, scope.orderReversed );
					scope.isLoading = false;
					
					//auto load first entry in the first group
					if (scope.autoloadFirst && !scope.selected && !bootcards.isXS() ) {
						scope.select( scope.groups[0].entries[0] );
						if (scope.type == 'accordion') {		//auto expand first group
							scope.groups[0].collapsed = false;
						}
					}
		
				} else {			//flat or detailed

					//sort the results
					res.sort( xcUtils.getSortByFunction( scope.orderBy, scope.orderReversed ) );

		        	scope.items = res;
					scope.isLoading = false;
					scope.totalNumItems = res.length;
					scope.hasMore = scope.itemsShown < scope.totalNumItems;

					//auto load first entry in the list
					if (scope.autoloadFirst && !scope.selected && !bootcards.isXS() ) {
						scope.select( res[0] );
					}

				}

			});

		}
	};

	return {

		scope : {

			title : '@',			/*title of the list*/
			type : '@',				/*list type, options: flat (default), categorised, accordion*/
			listWidth : '=' ,		/*width of the list (nr 1..11)*/
			summaryField : '@',		/*name of the field used as a summary field*/
			detailsField : '@',     
			detailsFieldType : '@',		/*text or date*/
			detailsFieldSubTop : '@',
			detailsFieldSubBottom : '@',
			allowSearch : '=?',
			autoloadFirst : '=?',
			allowAdd : '=',
			groupBy : '@',			/*only relevant for categorised, accordion lists*/
			filterBy : '@',			
			filterValue : '@',		
			orderBy : '@',
			orderReversed : '@',
			url : '@',
			srcData : '@',
			imageField : '@',		/*image*/
			iconField : '@',		/*icon*/ 
			imagePlaceholderIcon : '@',		/*icon to be used if no thumbnail could be found, see http://fortawesome.github.io/Font-Awesome/icons/ */
			datastoreType : '@',
			infiniteScroll : '@'

		},

		restrict : 'E',
		transclude : true,
		replace : true,
		
		templateUrl: function(elem,attrs) {
			//calculate the template to use
			return 'xc-list-' + attrs.type + '.html';
		},

		link : function(scope, elem, attrs) {

			configService.setEndpoint( attrs.url);

			scope.colLeft = 'col-sm-' + attrs.listWidth;
			scope.colRight = 'col-sm-' + (12 - parseInt(attrs.listWidth, 10) );
			
			loadData(scope);

		},

		controller: function($rootScope, $scope, $modal, $filter, xcUtils) {

			$scope.hideList = false;
			$scope.orderReversed = $scope.$eval( $scope.orderReversed);		//for booleans
			$scope.datastoreType = (typeof $scope.datastoreType == 'undefined' ? 'accordion' : $scope.datastoreType);

			//set defaults
			$scope.allowSearch = (typeof $scope.allowSearch == 'undefined' ? true : $scope.allowSearch);
			$scope.autoloadFirst = (typeof $scope.autoloadFirst == 'undefined' ? false : $scope.autoloadFirst);
			$scope.infiniteScroll = (typeof $scope.infiniteScroll == 'undefined' ? false : $scope.infiniteScroll);
			$scope.detailsFieldType = (typeof $scope.detailsFieldType == 'undefined' ? 'text' : $scope.detailsFieldType);

			$scope.isLoading = true;
      		$scope.hasMore = false;

			$scope.itemsPerPage = 20;
			$scope.itemsShown = $scope.itemsPerPage;

			$scope.selected = null;
			$scope.numPages = 1;

			$scope.modelName = xcUtils.getConfig('modelName');
      		$scope.fieldsRead = xcUtils.getConfig('fieldsRead');
			$scope.fieldsEdit = xcUtils.getConfig('fieldsEdit');
			$scope.imageBase = xcUtils.getConfig('imageBase');

			$rootScope.$on('refreshList', function(msg) {
				loadData($scope);
			});
			
			//custom list entries
			if ($scope.srcData) {
				$scope.srcDataEntries = xcUtils.getConfig( $scope.srcData);

				if ($scope.autoloadFirst) {
					$scope.selected = $scope.srcDataEntries[0];
					$rootScope.showCards = true;
				}

			}

			$scope.clearSearch = function() {
				$scope.filter = '';
			};

			$scope.addNewItem = function() {

				$scope.modalInstance = $modal.open({
					templateUrl: 'xc-form-modal-edit.html',
					controller: 'UpdateItemInstanceCtrl',
					backdrop : true,
					resolve: {
						selectedItem : function () {
							return null;
						},
						fieldsEdit : function() {
							return $scope.fieldsEdit;
						},
						modelName : function() {
							return $scope.modelName;
						},
						isNew : function() {
							return true;
						},
						allowDelete : function() {
							return false;
						},
						items : function() {
							return $scope.items;
						},
						scope : function() {
							return $scope;
						}
					}
				});
			};

			//bind events for infinite scroll
			if ($scope.infiniteScroll) {

				try {
					pullUpEl = document.getElementById('pullUp');
					pullUpOffset = pullUpEl.offsetHeight;
				} catch (e) {
				}

				if ($rootScope.iOS || $rootScope.Android ) {
					$('.bootcards-list').scroll(
						function() {
							if ($(this)[0].scrollHeight - $(this).scrollTop() == $(this).outerHeight()) {
								$scope.flatViewScroll();
							}
						});
				} else {
					$(window).bind('scroll',
						function() {
							if ($(document).height() <= ($(window).height() + $(window).scrollTop() + 200)) {
								$scope.flatViewScroll();
							}
						});
				}

			}

			$scope.flatViewScroll = function() {
				$("#btnLoadMore").click();
			};

			$scope.toggleCategory = function(expand) {
				angular.forEach( $scope.groups, function(group) {
					if (group.name == expand.name) {
						group.collapsed = !expand.collapsed;
					} else {
						group.collapsed = true;
					}
				});
			};

			$scope.select = function(item) {
		
				$scope.selected = item;

				$scope.$emit('selectItemEvent', item);
				
				if (bootcards.isXS() ) {
					$rootScope.hideList = (item != null);
					$rootScope.showCards = (item != null);
				} else {
					$rootScope.showCards = true;
					window.scrollTo(0, 0);
				}
			};

			$scope.showImage = function(item) {
				return $scope.imageField && item[$scope.imageField];
			}
			$scope.showPlaceholder = function(item) {
				return $scope.imagePlaceholderIcon && !item[$scope.imageField];
			}
			$scope.showIcon = function(item) {
				return $scope.iconField && item[$scope.iconField];
			}

			$scope.delete = function(item) {
				loadData($scope);
			};

			$rootScope.$on('deleteItemEvent', function(ev, item) {
				$scope.delete(item);
			});

		    $scope.loadMore = function() {

		    	if ($scope.hasMore) {
			    	$scope.itemsShown += $scope.itemsPerPage;
			    	$scope.hasMore = $scope.itemsShown < $scope.totalNumItems;
			    }

		    };

		    $scope.convert = function(item) {
		    	
		    	if ($scope.detailsFieldType == 'date') {
		    		return $filter('date')(item[$scope.detailsField]);
		    	} else {
		    		return item[$scope.detailsField];
		
		    	}

		  
		    };

		}

	};

}]);

app.filter('searchFilter', function() {

   return function(items, word, numPerPage) {

    var filtered = [];
  
    if (!word) {return items;}

    angular.forEach(items, function(item) {
        if(item.lastName.toLowerCase().indexOf(word.toLowerCase()) !== -1){
            filtered.push(item);
        }
    });

    /*

    filtered.sort(function(a,b){
        if(a.indexOf(word) < b.indexOf(word)) return -1;
        else if(a.indexOf(word) > b.indexOf(word)) return 1;
        else return 0;
    });*/

    return filtered;
  };
});
