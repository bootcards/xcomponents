/* xcomponents 0.1.0 2015-03-23 3:08 */

var app = angular.module("xc.factories", ['ngResource', 'pouchdb']);

app.factory('xcDataFactory', ['RESTFactory', 'PouchFactory', 'LowlaFactory', 
		function( RESTFactory, PouchFactory, LowlaFactory) {

	return {

		getStore : function(type) {

			switch(type) {

			case 'pouch':
				return PouchFactory;
			case 'lowla':
				return LowlaFactory;
			default:
				return RESTFactory; 
			}

		}
	};

}]);

app.factory('RESTFactory', ['$http', function($http) {

	return {

		info : function(url) {

			url = url.replace(":id", "") + 'count';

			return $http.get(url).then( function(res) {
				return { 'count' : res.data.count};
			});

		},

		insert : function(url, toInsert) {
			console.error('not implemented');
		},

		all : function(url) { 

			url = url.replace(":id", "");

			console.log('querying REST service at ' + url);

			return $http.get(url).then( function(res) {
				console.log('returning '  + res.data.length + ' items');
				return res.data;
			});

		},

		saveNew : function(url, item) {
			
			url = url.replace(":id", "");

			return $http.post(url, item).then( function(res) {
				return res.data;
			});

		},

		update : function(url, item) {
		
			url = url.replace(":id", "");

			return $http.put(url, item).then( function(res) {
				return res.data;
			});

		},

		delete : function(url, item) {
			url = url.replace(":id", item.id);
			return $http.delete(url);
		},

		deleteAll : function() {

			console.error('not implemented');
			
		},

		getById : function(url, id) {

			url = url.replace(":id", id);

			return $http.get(url).then( function(res) {
				return res.data;
			});

		},

		exists : function(url, id) {

			url = url.replace(":id", id) + '/exists';

			return $http.get(url).then( function(res) {
				return res.data;
			});
		}

	};

} ] );

app.factory('PouchFactory', ['pouchDB', function(pouchDB) {

	return {

		info : function(dbName) {

			var db = pouchDB(dbName);

			return db.info()
			.then( function(res) {
				return { count : res['doc_count'] };
			})
			.catch( function(err) {
				console.error(err);
				return {};
			});

		},

		insert : function( dbName, toInsert ) {
			var pouch = pouchDB(dbName);
			return pouch.bulkDocs(toInsert);
		},

		all : function(dbName) { 
			
			var db = pouchDB(dbName);

			console.log('querying Pouch database named ' + dbName);

			return db.allDocs({ 'include_docs' : true})
			.then( function(res) {

				var queryResults = [];
	                
	            angular.forEach(res.rows, function(r) {
	            	queryResults.push(r.doc);
	            });

	            console.log('returning ' + queryResults.length + ' results');
	            
				return queryResults;
			})
			.catch( function(err) {
				console.error(err);
				return null;
			});

		},

		saveNew : function(dbName, item) {

			var db = pouchDB(dbName);

			return db.post(item).then( function(res) {

				if (res.ok) {
					item.id = res.id;
					return item;
				} else {
					alert('Error while inserting in Pouch');
				}

			})
		},

		getById : function(dbName, id) {

			var db = pouchDB(dbName);

			return db.get(id)
			.then( function(res) {
				return res;
			})
			.catch( function(res) {
				if (res.name != 'not_found') {
					//console.error(res);
				}
				return null;
			});

		},

		update : function(dbName, item) {

			var db = pouchDB(dbName);

			return db.put(item)
			.then( function(res) {
				item._rev = res.rev;
				return item;
			})
			.catch( function(err) {
				console.error(err);
				return null;
			});
			
		},

		delete : function(dbName, item) {

			var db = pouchDB(dbName);

			return db.remove(item)
			.then( function(res) {
				return null;
			})
			.catch( function(err) {
				console.error(err);
			});

		},

		deleteAll : function(dbName) {

			console.error('not implemented');

		},

		exists : function(dbName, id) {
			return this.getById(id).then( function(res) {
				return {exists : (res != null)};
			});
		}

	};


}] );

app.factory('LowlaFactory', [function() {

	var collection = 'items';
	var lowla = null;

	return {

		getDb : function() {
			if (this.lowla == null) {
				this.lowla = new LowlaDB();
			}
			return this.lowla;
		},

		info : function(dbName) {

			var items = this.getDb().collection(dbName, collection);

			return items.count().then(function(res) {
				return {count : res};
			});

		},

		insert : function( dbName, toInsert ) {
			var items = this.getDb().collection(dbName, collection);
			return items.insert(toInsert);
		},

		all : function(dbName) { 

			var items = this.getDb().collection(dbName, collection);

			console.log('querying Lowla database named ' + dbName);

			//var syncServer = location.protocol + '//' + location.hostname + ":3001";
			//this.getDb().sync(syncServer);

			return items.find().toArray().then( function(res) {
				console.log('returning ' + res.length + ' results');
				return res;
			});

		},

		saveNew : function(dbName, item) {

			var items = this.getDb().collection(dbName, collection);

			//need to remove this property, else Lowla will throw an error
			delete item['$$hashKey'];

			return items.insert(item);
			
			/*return db.post(item).then( function(res) {

				if (res.ok) {
					item.id = res.id;
					return item;
				} else {
					alert('Error while inserting in Pouch');
				}

			})*/
		},

		getById : function(dbName, id) {

			var items = this.getDb().collection(dbName, collection);

			return items.find( { _id : id});

		},

		update : function(dbName, item) {

			var items = this.getDb().collection(dbName, collection);

			//need to remove this property, else Lowla will throw an error
			delete item['$$hashKey'];

			return items.insert(
				item,
				function(doc) {
					//console.log('inserted', doc);
				},
				function(err) {
					console.error('error while inserting', err);
				}
			);
			
		},

		delete : function(dbName, item) {

			var items = this.getDb().collection(dbName, collection);

			return items.remove( { _id : item._id } ).then( function(res) {
				console.log('ok', res);
				return null;
			}, function(err) {
				console.error(err);
			});

		},

		deleteAll : function(dbName) {

			var items = this.getDb().collection(dbName, collection);

			return items.remove({})
			.then( function(res) {
				console.log('deleted all');
				return res;
			}, function(err) {
				console.error(err);
				return null;

			});
			
		},

		exists : function(dbName, id) {
			return this.getById(id).then( function(res) {
				return {exists : (res != null)};
			});
		}

	};


}]);
/*
 * Main XComponents module
 *
 * Note: we need to add all dependencies for this module here, so we can reference
 * the module using just angular.module('<modname>');
 */

var app = angular.module('xcomponents', [
	'templates-main',
	'xc.factories',
	'ngResource',
	'ngRoute',
	'ngCookies',
	'ngAnimate',
	'ngSanitize',
	'textAngular',
	'ui.bootstrap'
]);

//bootstrapping code
var hasNativeHTMLImportsSupport = ('import' in document.createElement('link'));

if (hasNativeHTMLImportsSupport) {
	
	angular.element(document).ready(function() {
		if (typeof xcomponents != 'undefined') { xcomponents.executeCallbacks(); }
		angular.bootstrap(document, ['xcomponents']);
	});

} else {
	window.addEventListener('HTMLImportsLoaded', function(e){ 
		if (typeof xcomponents != 'undefined') { xcomponents.executeCallbacks(); }
		angular.bootstrap(document, ['xcomponents']);
	});
}

app.controller('xcController', function($rootScope, $scope, $timeout, $document, xcUtils) {
	
	$scope.menuOptions = [];

	//load the OS specific CSS
	var userAgent = navigator.userAgent;
	$scope.iOS = (/(iPhone|iPad|iPod)/gi).test(userAgent);
	$scope.Android = (/(Android)/gi).test(userAgent);

	$rootScope.iOS = $scope.iOS;
	$rootScope.Android = $scope.Android;

	var baseFolder = '/bower_components';
	var css = baseFolder + '/bootcards/dist/css/';

	var body = angular.element( $document[0].body);

	if ($scope.iOS) {
		css += 'bootcards-ios-lite.min.css';
		body.addClass('bootcards-ios');
	} else if ($scope.Android) {
		css += 'bootcards-android-lite.min.css';
		body.addClass('bootcards-android');
	} else {
		css += 'bootcards-desktop-lite.min.css';
		body.addClass('bootcards-desktop');
	}
	
	var head = angular.element(document.getElementsByTagName('head')[0]);
	head.append("<link rel='stylesheet' href='" + css + "' />");

	//remove hidden class from body to show content
	$('body').removeClass('hidden');

	if (typeof xcomponents != 'undefined') {

		console.log('Load XComponents config');

		var config = xcomponents;

		if (config.models) {

			for(var modelName in config.models) {

				var model = config.models[modelName];

				model.fieldsRead = [];		//list of fields in read mode
				model.fieldsEdit = [];		//list of fields in edit mode
				model.fieldsFormula = [];	//list of field formulas
				model.fieldFilters = [];
				model.fields = model.fields || [];

				//add labels if not specified (proper cased field name)
				for (var i=0; i<model.fields.length; i++) {

					var f = model.fields[i];

					if (!f.type) {
						f.type = 'text';		//default type=text
					}

					if ( !f.hasOwnProperty('label') ) {
						f.label = f.field.substring(0,1).toUpperCase() + f.field.substring(1);
					}
					//set 'show in read mode' property
					if ( !f.hasOwnProperty('read') ) {
						f.read = true;
					}
					//set 'show in edit mode' property
					if ( !f.hasOwnProperty('edit') ) {
						f.edit = true;
					}

					if (f.hasOwnProperty('filter')) {
						model.fieldFilters[f.field] = f.filter;
					}

					if (f.type == 'select' || f.type == 'select-multiple') {
					
						if (f.options.hasOwnProperty('endpoint')) {

							f.options = xcUtils.resolveRemoteOptionsList(f.options);
							
						} else if (f.options.length>0 && typeof f.options[0] == 'string') {

							var o = [];

							angular.forEach(f.options, function(option) {
								o.push( {label : option, value : option});
							});

							f.options = o;

						}

					}

					if (f.read) {
						model.fieldsRead.push(f);
					}

					if (f.edit) {
						model.fieldsEdit.push(f);
					}
					if ( f.hasOwnProperty('formula') && f.formula != null ) {
						model.fieldsFormula.push(f);
					}

					
				}
			}
		}

		$rootScope.config = xcomponents;

	}

	//initialize bootcards
	$timeout( function() {
		bootcards.init( {
	        offCanvasHideOnMainClick : true,
	        offCanvasBackdrop : false,
	        enableTabletPortraitMode : true,
	        disableRubberBanding : true,
	        disableBreakoutSelector : 'a.no-break-out'
	      });
	}, 500);

});

app.directive('disableNgAnimate', ['$animate', function($animate) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      $animate.enabled(false, element);
    }
  };
}]);

app.filter('fltr', function($interpolate, $filter, xcUtils) {
	return function(item, filterName, fieldType) {

		if (arguments.length >= 3 && fieldType != 'text') {
			//filter by field type
			return $filter(fieldType)(item);
		} else if (!filterName) {
			return item;	
		} else {
			var _res = $interpolate('{{value | ' + filterName + '}}');
			return _res( {value : item } );
		}
	};
});



//polyfill for indexOf function
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf

// Production steps of ECMA-262, Edition 5, 15.4.4.14
// Reference: http://es5.github.io/#x15.4.4.14
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {

    var k;

    // 1. Let O be the result of calling ToObject passing
    //    the this value as the argument.
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get
    //    internal method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If len is 0, return -1.
    if (len === 0) {
      return -1;
    }

    // 5. If argument fromIndex was passed let n be
    //    ToInteger(fromIndex); else let n be 0.
    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
      n = 0;
    }

    // 6. If n >= len, return -1.
    if (n >= len) {
      return -1;
    }

    // 7. If n >= 0, then Let k be n.
    // 8. Else, n<0, Let k be len - abs(n).
    //    If k is less than 0, then let k be 0.
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. Repeat, while k < len
    while (k < len) {
      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the
      //    HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      //    i.  Let elementK be the result of calling the Get
      //        internal method of O with the argument ToString(k).
      //   ii.  Let same be the result of applying the
      //        Strict Equality Comparison Algorithm to
      //        searchElement and elementK.
      //  iii.  If same is true, return k.
      if (k in O && O[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
}


var app = angular.module('xcomponents');

app.factory('xcUtils', function($rootScope, $http) {

	return {

		getConfig : function(param) {
			if ($rootScope.config) {
				return $rootScope.config[param];
			}
		},

		calculateFormFields : function(form) {

			//add computed fields: get the list of fields that need to be computed
			var f = $rootScope.config['fieldsFormula'];

			for (var i=0; i<f.length; i++) {
				
				var fieldName = f[i].field;
				var fields = f[i].formula;
				var _res = [];

				for (var j=0; j<fields.length; j++) {
					_res.push( form[ fields[j] ] );
				}

				form[fieldName] = _res.join(' ');

			}
		},

		getSortByFunction : function(orderBy, orderReversed) {
			//function to sort an array of objects on a specific property and order

			if (typeof orderReversed == 'string') {
				orderReversed = (orderReversed == 'true' ? true : false);
			}

			return function(a,b) {
				
				var _a = (a[orderBy] || '');
				var _b = (b[orderBy] || '');

				if (typeof _a === 'string') { _a = _a.toLowerCase(); }
				if (typeof _b === 'string') { _b = _b.toLowerCase(); }
			
				var modifier = (orderReversed ? -1 : 1);
				if ( _a < _b )
					return -1 * modifier;
				if ( _a > _b )
					return 1 * modifier;
				return 0;
			};

		},

		getGroups : function(entries, groupBy, orderBy, orderReversed) {
			//group an array by a property of the objects in that array
			//returns an array containing the grouped entries

			var groups = [];
			var numEntries = entries.length;

			//organise results per group
			for (var i=0; i<numEntries; i++) {
				var entry = entries[i];
				var entryGroup = entry[groupBy];
				if (!entryGroup) entryGroup="(none)";

				var added = false;
			   	for (var g in groups) {
			     if (groups[g].name == entryGroup) {
			        groups[g].entries.push( entry);
			        added = true;
			        break;
			     }
			   	}

				if (!added) {
					groups.push({"name": entryGroup, "collapsed" : true, "entries" : [entry] });
				}
			}

		    //sort groups by group name
	    	groups.sort( function(a,b) {	
				var _n1 = (a['name'] || '');
				var _n2 = (b['name'] || '');

				return ( _n1 < _n2 ? -1 : (_n1>_n2 ? 1 : 0));
	    	} );

	    	var sortFunction = this.getSortByFunction( orderBy, orderReversed)

	    	//now sort the entries in the group
	    	angular.forEach(groups, function(group) {
	    		group.entries.sort(sortFunction);
	    	});

			return groups;

		},

		resolveRemoteOptionsList : function(optionSettings) {

			var o = [];

			return $http.get(optionSettings.endpoint).then( function (res) {

				angular.forEach( res.data, function(option) {
					o.push( {label : option[optionSettings.label], value : option[optionSettings.value] });
				});

				return o;
				
			});
		}
	

	};

});

var app = angular.module('xcomponents');

app.directive('xcBase', function() {

	return {

		scope : {
			title : '@',
			footerText : '@'
		},

		replace : true,
		restrict : 'E',
		transclude : true,
		templateUrl : 'xc-base.html'

	};

});

var app = angular.module('xcomponents');

app.directive('xcCarousel', function() {

	return {

		scope : {
			interval : '='
		},
		replace : true,
		restrict : 'E',
		templateUrl : 'xc-carousel.html',

		controller : function($scope, xcUtils) {

			$scope.slides = xcUtils.getConfig('carouselSlides');

		}

	};


} );

var app = angular.module('xcomponents');

app.directive('xcChart', function() {

	return {

		scope : {
			title : '@',
			chartId : '@',
			chartType : '@',
			valuePrefix : '@'
		},

		replace : true,
		restrict : 'E',
		templateUrl : 'xc-chart.html',

		controller : function($scope, $rootScope, $window, $timeout, xcUtils) {

			var charts = xcUtils.getConfig('charts');

			if (typeof $scope.chartId == "undefined") {
				console.error("Chart: missing chart id, e.g. chart-id=\"closed-sales\";");
			}

			$scope.chartData = charts[$scope.chartId];

			$scope.chartTotal = 0;
			for (var i=0; i<$scope.chartData.length; i++) {
				$scope.chartTotal += $scope.chartData[i].value;
			}

			angular.element($window).bind( 'resize', function() {
				if ($scope.chart) { $scope.chart.redraw(); }
			} );

			$scope.toggleChartData = function(event) {
				/* toggle between the chart and data */

				var $ev = $(event.target);
				var $chart = $ev.parents('.bootcards-chart');

				if ($chart.length>0) {
					$chart.fadeOut( 'fast', function()  {
						$chart
							.siblings('.bootcards-table')
								.fadeIn('fast');
					});
				} else {
				
					var $data = $ev.parents('.bootcards-table');
					$data.fadeOut( 'fast', function()  {
						$data
							.siblings('.bootcards-chart')
								.fadeIn('fast', function() {
									if (typeof chart != 'undefined' && chart != null) { chart.redraw();}
								});
					});

				}

			};

			//initial redraw (to make the chart fit the container)
			$timeout( function() {
				if ($scope.chart) { $scope.chart.redraw(); }
			}, 150);
			
		},

		link : function(scope, el, attrs) {

			var canvas = $(".js-chart-canvas", $(el));
			canvas.empty();

			//first property is the x key, other keys are the y keys
			var xkey = null;
			var ykeys = [];
			var ylabels = [];

			angular.forEach( scope.chartData[0], function(value, key) {
				if (!xkey) { 
					xkey = key;
				} else {
					ykeys.push( key);
					ylabels.push( key.substring(0,1).toUpperCase() + key.substring(1) );
				}
			});

			//draw the chart
			if (attrs.chartType === 'donut') {

				var drawDonutChart = function(el, chartData, valuePrefix) {

					//create custom Donut function with click event on the segments
					var myDonut = Morris.Donut;

					myDonut.prototype.redraw = function() {

						var C, cx, cy, i, idx, last, max_value, min, next, seg, total, value, w, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
				      this.raphael.clear();
				      cx = this.el.width() / 2;
				      cy = this.el.height() / 2;
				      w = (Math.min(cx, cy) - 10) / 3;
				      total = 0;
				      _ref = this.values;
				      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
				        value = _ref[_i];
				        total += value;
				      }
				      min = 5 / (2 * w);
				      C = 1.9999 * Math.PI - min * this.data.length;
				      last = 0;
				      idx = 0;
				      this.segments = [];
				      _ref1 = this.values;
				      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
				        value = _ref1[i];
				        next = last + min + C * (value / total);
				        seg = new Morris.DonutSegment(cx, cy, w * 2, w, last, next, this.data[i].color || this.options.colors[idx % this.options.colors.length], this.options.backgroundColor, idx, this.raphael);
				        seg.render();
				        this.segments.push(seg);
				        seg.on('hover', this.select);
				        seg.on('click', this.select);
				        last = next;
				        idx += 1;
				      }
				      this.text1 = this.drawEmptyDonutLabel(cx, cy - 10, this.options.labelColor, 15, 800);
				      this.text2 = this.drawEmptyDonutLabel(cx, cy + 10, this.options.labelColor, 14);
				      max_value = Math.max.apply(Math, this.values);
				      idx = 0;
				      _ref2 = this.values;
				      _results = [];
				      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
				        value = _ref2[_k];
				        if (value === max_value) {
				          this.select(idx);
				          break;
				        }
				        _results.push(idx += 1);
				      }
				      return _results;
					};

					return myDonut({
					    element: el,
					    data: chartData,
					    formatter: function (y, data) { 
					    	//prefixes the values by an $ sign, adds thousands seperators
							nStr = y + '';
							x = nStr.split('.');
							x1 = x[0];
							x2 = x.length > 1 ? '.' + x[1] : '';
							var rgx = /(\d+)(\d{3})/;
							while (rgx.test(x1)) {
								x1 = x1.replace(rgx, '$1' + ',' + '$2');
							}
							return valuePrefix + ' ' + x1 + x2;
					    }
					  });

				};

				scope.chart = drawDonutChart(canvas[0], scope.chartData, scope.valuePrefix);



			} else if (attrs.chartType === 'area') {

				scope.chart = Morris.Area({
				    element: canvas[0],
				    data: scope.chartData,
				    xkey: xkey,
				    ykeys: ykeys,
				    labels: ylabels,
				    pointSize: 2,
				    hideHover: 'auto'
				});

			} else if (attrs.chartType === 'line') {
					
				scope.chart = Morris.Line({
				    element: canvas[0],
				    data: scope.chartData,
				    xkey: xkey,
				    ykeys: ykeys,
				    labels: ylabels
				});

			} else if (attrs.chartType === 'bar') {

				scope.chart = Morris.Bar({
				    element: canvas[0],
				    data: scope.chartData,
				    xkey: xkey,
				    ykeys: ykeys,
				    labels: ylabels,
				    xLabelAngle: 20,
				    hideHover: 'auto'
				});
			}



		}

	};

});


var app = angular.module('xcomponents');

app.directive('xcFile', function() {

	return {

		scope : {
			title : '@',
			fileName : '@',
			fileType : '@',
			fileSize : '@',
			summary : '@',
			description : '@',
			previewUrl : '@',
			url : '@',
			allowFavorite : '=',
			allowEmail : '='
			
		},

		replace : true,
		restrict : 'E',
		transclude : true,
		templateUrl : 'xc-file.html'

	};

});

var app = angular.module('xcomponents');

app.directive('xcFooter', function() {

	return {

		replace : true,
		restrict : 'E',
		templateUrl : 'xc-footer.html',
		transclude : true,

		controller : function($rootScope, $scope, $document, xcUtils, $timeout) {

			$scope.footerOptions = xcUtils.getConfig('footerOptions');
			$scope.footerTitle = xcUtils.getConfig('footerTitle');

		}

	};

});

var app = angular.module('xcomponents');

app.controller('UpdateItemInstanceCtrl', 
	[ '$scope', '$modalInstance', 'selectedItem', 'model', 'isNew', 'allowDelete', 'xcUtils',
	function ( $scope, $modalInstance, selectedItem, model, isNew, allowDelete, xcUtils) {

	var fieldsEdit = model.fieldsEdit;

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

	$scope.model = model;
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

	});

	$scope.fieldsEdit = fieldsEdit;
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

var app = angular.module('xcomponents');

app.directive('xcForm', 
	['$rootScope', 'xcDataFactory', 
	function($rootScope, xcDataFactory) {

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

			$scope.editDetails = function() {

				var modalInstance = $scope.modalInstance = $modal.open({
					templateUrl: 'xc-form-modal-edit.html',
					controller: 'UpdateItemInstanceCtrl',
					backdrop : true,
					resolve: {
						selectedItem : function () {
							return $scope.selectedItem;
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

			$scope.saveItem = function(targetItem) {

				xcUtils.calculateFormFields(targetItem);

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

var app = angular.module('xcomponents');

app.directive('xcImage', function() {

	return {

		scope : {
			title : '@',
			sourceField : '@'
		},

		restrict : 'E',
		replace : true,
		templateUrl: 'xc-image.html',

		controller : function($scope, $rootScope, xcUtils) {

			$scope.imageSrc = null;

			$rootScope.$on('selectItemEvent', function(ev, item) {
				
				$scope.imageSrc = null;

				if ( item[$scope.sourceField] != null && item[$scope.sourceField].length > 0) {
			
					$scope.imageSrc = xcUtils.getConfig('imageBase') + item[$scope.sourceField];

				}
	
			});

		}

	};

});
var app = angular.module("xcomponents");

app.directive('xcLayout', [ function() {

	return {

		restrict : 'E',
		transclude : true,
		replace : true,
		templateUrl: 'xc-layout.html'

	};

} ] );

var app = angular.module("xcomponents");

app.directive('xcList', 
	['$rootScope', '$filter', 'xcUtils', 'xcDataFactory', 
	function($rootScope, $filter, xcUtils, xcDataFactory) {

	var loadData = function(scope) {

		//abort if the data needs to be filtered, but there's not filter value
		if (scope.filterBy && (typeof scope.filterValue == 'undefined' ||
			scope.filterValue == null || scope.filterValue.length==0) ) {
			return;
		}

		//console.info("LOAD FROM " + scope.url, scope.filterBy, scope.filterValue);

		if ( scope.srcDataEntries) {

			scope.isLoading = false;
			scope.hasMore = false;
			scope.items = scope.srcDataEntries;
			scope.totalNumItems = scope.items.length;
			
		} else {

			xcDataFactory.getStore(scope.datastoreType)
			.all(scope.url).then( function(res) {
				
				var numRes = res.length;

				//console.log('found ' + numRes + ' at ' + scope.url);

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

						if (scope.groups.length>0) {
							if (scope.groups[0].entries.length>0) { scope.select( scope.groups[0].entries[0] ); }
							if (scope.type == 'accordion') {		//auto expand first group
								scope.groups[0].collapsed = false;
							}
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
			modelName : '@',				/*required: name of the model to use for the form instance*/
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
			filterSrc : '@',		
			filterValue : '@',		
			orderBy : '@',
			orderReversed : '@',
			url : '@',
			srcData : '@',
			imageField : '@',		/*image*/
			iconField : '@',		/*icon*/ 
			imagePlaceholderIcon : '@',		/*icon to be used if no thumbnail could be found, see http://fortawesome.github.io/Font-Awesome/icons/ */
			datastoreType : '@',
			infiniteScroll : '@',
			embedded : '@'
		},

		restrict : 'E',
		transclude : true,
		replace : true,
		
		templateUrl: function(elem,attrs) {
			//calculate the template to use
			return 'xc-list-' + attrs.type + '.html';
		},

		link : function(scope, elem, attrs) {

			if (!scope.model) {
				return;
			}

			scope.colLeft = 'col-sm-' + attrs.listWidth;
			scope.colRight = 'col-sm-' + (12 - parseInt(attrs.listWidth, 10) );
			
			loadData(scope);

		},

		controller: function($rootScope, $scope, $modal, $filter, xcUtils) {

			if (!$scope.modelName) {

				console.error("cannot load list: no model name provided");
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

      		$scope.fieldsRead = $scope.model.fieldsRead;
			$scope.fieldsEdit = $scope.model.fieldsEdit;
			$scope.imageBase = $scope.model.imageBase;
			$scope.fieldFilters = $scope.model.fieldFilters;

			$scope.hideList = false;
			$scope.orderReversed = $scope.$eval( $scope.orderReversed);		//for booleans
			$scope.datastoreType = (typeof $scope.datastoreType == 'undefined' ? 'accordion' : $scope.datastoreType);

			//set defaults
			$scope.embedded = (typeof $scope.embedded == 'undefined' ? false : $scope.embedded);
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

			$scope.colClass = function() {
				return ($scope.embedded ? '' : $scope.colLeft);
			};

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

				//broadcast event to child scopes
				$scope.$broadcast('itemSelected', item);
				
			};

			
			$rootScope.$on('selectItemEvent', function(ev, item) {

				if ($scope.filterBy) {
					$scope.filterValue = item[$scope.filterSrc];
					loadData($scope);
				}
				
			});

			$scope.showImage = function(item) {
				return $scope.imageField && item[$scope.imageField];
			};
			$scope.showPlaceholder = function(item) {
				return $scope.imagePlaceholderIcon && !item[$scope.imageField];
			};
			$scope.showIcon = function(item) {
				return $scope.iconField && item[$scope.iconField];
			};

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

		    $scope.saveNewItem = function(targetItem) {

		    	xcUtils.calculateFormFields(targetItem);

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


var app = angular.module('xcomponents');

app.directive('xcSummaryItem', function() {

	return {

		scope : {
			title : '@title',
			target : '@target',
			icon : '@icon',
			count : '@count'
		},

		replace : true,
		restrict : 'E',
		templateUrl : 'xc-summary-item.html',

		controller : function($scope) {

			$scope.openLink = function(url) {
				window.location.href = url;
			};

		}

	};

});

var app = angular.module('xcomponents');

app.directive('xcSummary', function() {

	return {

		scope : {
			title : '@',
			footerText : '@'
		},

		replace : true,
		restrict : 'E',
		transclude : true,
		templateUrl : 'xc-summary.html'

	};

});

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

var app = angular.module('xcomponents');

app.directive('xcUpload', ['$http', 'xcDataFactory', function($http, xcDataFactory) {

	return {

		scope : {
			title : '@',
			url : '@'
		},

		replace : true,
		restrict : 'E',
		transclude : true,
		templateUrl : 'xc-upload.html',

		controller : function($scope) {

			$scope.targetWidth = 0;
			$scope.targetHeight = 0;
			$scope.doCrop = false;
			$scope.customSelect = null;
			$scope.orientation = 0;
			$scope.uploadInProgress = false;
		
			$scope.init = function() {
				
				this.customSelect = $('.js-custom-select-var').text();
				
				if (this.customSelect != null && this.customSelect.length>0) {
				
					// move the 'photo select' button to a custom location
					var move = $('.js-photouploader-upload');
					var to = $(this.customSelect);
					
					if (move.length==1 && to.length==1) {
						move.appendTo(to);
						
						// hide the default photo select
						$('.js-photouploader .photoUpload').hide();

					}
				}
			};
	
			$scope.loadImage = function( file) {
				
				loadImage(
			        file,
			        function (canvas) {
			        	
			        	// clean up
			            $('.js-photouploader-preview img, .js-photouploader canvas').remove();
			            
			            canvas.id = 'photoUploadCanvas';
			     
			        	$('.js-photouploader-preview').append(canvas);
			        	$('.js-photouploader-rotate').removeClass('hidden');
			        	$('.js-photouploader-preview .fa').addClass('hidden');
			        },
			        {
			        	maxWidth : $scope.targetWidth,
			        	maxHeight : $scope.targetHeight,
			        	crop : $scope.doCrop,
			        	canvas : true,
			        	orientation : $scope.orientation
			        }
				);

			};
				
			$scope.rotateImage = function(clockWise) {
				
				var $resizeFileUpload = $('.js-photouploader-upload');
				
				if ( $resizeFileUpload[0].files.length === 0) {
					return;
				}
				var file = $resizeFileUpload[0].files[0];

				if ($scope.orientation == 0) {
					$scope.orientation = (clockWise ? 6 : 8);
				} else if ($scope.orientation == 6) {
					$scope.orientation = (clockWise ? 3 : 0);
				} else if ($scope.orientation == 3) {
					$scope.orientation = (clockWise ? 8 : 6);
				} else if ($scope.orientation == 8) {
					$scope.orientation = (clockWise ? 0 : 3);
				}
				
				$scope.loadImage(file);
			};

			$scope.savePhoto = function() {

				//get the file input
				var $resizeFileUpload = $('.js-photouploader-upload');
				var files = $resizeFileUpload[0].files;
				if (typeof files == 'undefined' || files.length === 0 ) {
					return;
				}
						
				//show a spinner icon in the upload button
				$scope.uploadInProgress = true;
				
				var _resizedFile = files[0];

				//create FormData object to send all form data to Unplugged
				var fd = new FormData();
				                            
				//now add the resized image to the FormData object and send it
				var canvas = document.getElementById('photoUploadCanvas');
			     
			    if (canvas.toBlob) {

				    canvas.toBlob(
				        function (blob) {

				        	blob.name = _resizedFile.name;

				            fd.append( 'file', blob, _resizedFile.name );
				            
				            $http.post( $scope.url, fd, {
								transformRequest: angular.identity,
								headers: {'Content-Type': undefined}
				            }).then( function(res) {
				            	alert('Photo Saved');
				            	$scope.uploadInProgress = false;
				            });
				            
				        },
				        'image/jpeg'
				    );
				}

			};

		}

	};

}]);
angular.module('templates-main', ['xc-base.html', 'xc-carousel.html', 'xc-chart.html', 'xc-file.html', 'xc-footer.html', 'xc-form-modal-edit.html', 'xc-form.html', 'xc-header.html', 'xc-image.html', 'xc-layout.html', 'xc-list-accordion.html', 'xc-list-categorised.html', 'xc-list-detailed.html', 'xc-list-flat.html', 'xc-list-heading.html', 'xc-reading.html', 'xc-summary-item.html', 'xc-summary.html', 'xc-upload.html']);

angular.module("xc-base.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-base.html",
    "<div class=\"panel panel-default\"> \n" +
    "  <div class=\"panel-heading clearfix\">\n" +
    "    <h3 class=\"panel-title pull-left\">{{::title}}</h3>\n" +
    "      <a class=\"btn btn-primary pull-right\" href=\"#\" onclick=\"alert('This button is disabled')\">\n" +
    "        <i class=\"fa fa-pencil\"></i>Edit\n" +
    "      </a>\n" +
    "    </div>\n" +
    "    <div class=\"list-group\">\n" +
    "      <ng-transclude></ng-transclude>\n" +
    "    </div>\n" +
    "  <div class=\"panel-footer\">\n" +
    "    <small class=\"pull-left\">{{footerText}}</small>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("xc-carousel.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-carousel.html",
    "<div>\n" +
    "	<carousel interval=\"interval\" disable-ng-animate>\n" +
    "		<slide ng-repeat=\"slide in slides\" active=\"slide.active\">\n" +
    "			<img ng-src=\"{{slide.image}}\" style=\"margin:auto;\">\n" +
    "			<div class=\"carousel-caption\">\n" +
    "				<h4>{{slide.title}}</h4>\n" +
    "				<p>{{slide.text}}</p>\n" +
    "			</div>\n" +
    "		</slide>\n" +
    "	</carousel>\n" +
    "</div>");
}]);

angular.module("xc-chart.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-chart.html",
    "<span>\n" +
    "\n" +
    "	<div class=\"panel panel-default bootcards-chart\">\n" +
    "		\n" +
    "		<div class=\"panel-heading\">\n" +
    "			<h3 class=\"panel-title\">{{title}}</h3>					\n" +
    "		</div>\n" +
    "\n" +
    "		<div>\n" +
    "\n" +
    "			<!--bar chart-->\n" +
    "			<div class=\"js-chart-canvas\" id=\"chartClosedSales\"></div>\n" +
    "\n" +
    "			<div class=\"panel-footer\">\n" +
    "				<button class=\"btn btn-default btn-block\"\n" +
    "					ng-click=\"toggleChartData($event)\">\n" +
    "					<i class=\"fa fa-table\"></i>\n" +
    "					Show Data\n" +
    "				</button>				\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	<!-- 	\n" +
    "		<div class=\"panel-footer\">\n" +
    "			<small class=\"pull-left\">Built with Bootcards - Chart Card</small>\n" +
    "		</div>		 -->			\n" +
    "\n" +
    "	</div>		\n" +
    "\n" +
    "	<!-- Table Card data -->\n" +
    "	<div class=\"panel panel-default bootcards-table\" style=\"display:none\">\n" +
    "		<div class=\"panel-heading\">\n" +
    "			<h3 class=\"panel-title\">{{title}}</h3>							\n" +
    "		</div>	\n" +
    "		<table class=\"table table-hover\">\n" +
    "			<thead>				\n" +
    "				<tr class=\"active\"><th>Name</th><th class=\"text-right\">Sales value</th></tr>\n" +
    "			</thead>\n" +
    "			<tbody>\n" +
    "				<tr ng-repeat=\"row in chartData\">\n" +
    "					<td>{{row.label}}</td><td class=\"text-right\">{{valuePrefix}} {{row.value | number : 0}}</td>\n" +
    "				<tr>\n" +
    "					<td><strong>Total</strong></td><td class=\"text-right\"><strong>{{valuePrefix}} {{chartTotal | number : 0}}</strong></td></tr>\n" +
    "			</tbody>\n" +
    "		</table>\n" +
    "		<div class=\"panel-footer\">\n" +
    "			<button class=\"btn btn-default btn-block\" ng-click=\"toggleChartData($event)\">\n" +
    "				<i class=\"fa fa-bar-chart-o\"></i>\n" +
    "				Show Chart\n" +
    "			</button>				\n" +
    "		</div>\n" +
    "		<!-- <div class=\"panel-footer\">\n" +
    "			<small class=\"pull-left\">Built with Bootcards - Table Card</small>\n" +
    "		</div>	 -->												\n" +
    "	</div>\n" +
    "\n" +
    "</span>\n" +
    "");
}]);

angular.module("xc-file.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-file.html",
    "<div class=\"panel panel-default bootcards-file\">\n" +
    "\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h3 class=\"panel-title\">{{::title}}</h3>\n" +
    "  </div>\n" +
    "  <div class=\"list-group\">\n" +
    "    <div class=\"list-group-item\" ng-if=\"fileName.length>0\">\n" +
    "      <a ng-href=\"{{url}}\" class=\"img-rounded pull-left\">\n" +
    "        <i class=\"fa fa-2x fa-file-pdf-o\"></i>\n" +
    "      </a>\n" +
    "      <h4 class=\"list-group-item-heading\">\n" +
    "        <a ng-href=\"{{url}}\">{{::fileName}}</a>\n" +
    "      </h4>\n" +
    "      <p class=\"list-group-item-text\"><strong>{{::fileType}}</strong></p>\n" +
    "      <p class=\"list-group-item-text\"><strong>{{::fileSize}}</strong></p>\n" +
    "    </div>\n" +
    "    <div class=\"list-group-item\" ng-if=\"summary.length>0\">\n" +
    "      <p class=\"list-group-item-text\"><strong>{{::summary}}</strong></p>\n" +
    "    </div>\n" +
    "    \n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"panel-body\">\n" +
    "{{::description}}\n" +
    "  </div>\n" +
    "\n" +
    "  <img ng-src=\"{{previewUrl}}\" class=\"img-responsive\">\n" +
    "\n" +
    "  <div class=\"panel-footer\">\n" +
    "\n" +
    "    <div class=\"btn-group btn-group-justified\">\n" +
    "      <div class=\"btn-group\">\n" +
    "        <a class=\"btn btn-default\" ng-href=\"{{url}}\" onclick=\"alert('This button is disabled')\">\n" +
    "          <i class=\"fa fa-arrow-down\"></i>Download\n" +
    "        </a>\n" +
    "      </div>\n" +
    "      <div class=\"btn-group\" ng-if=\"allowFavorite\">\n" +
    "        <a class=\"btn btn-default\" href=\"#\" onclick=\"alert('This button is disabled')\">\n" +
    "          <i class=\"fa fa-star\"></i>Favorite\n" +
    "        </a>\n" +
    "      </div>\n" +
    "      <div class=\"btn-group\" ng-show=\"allowEmail\">\n" +
    "        <a class=\"btn btn-default\" href=\"#\" onclick=\"alert('This button is disabled')\">\n" +
    "          <i class=\"fa fa-envelope\"></i>Email\n" +
    "        </a>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "</div>");
}]);

angular.module("xc-footer.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-footer.html",
    "<div class=\"navbar navbar-default navbar-fixed-bottom\">\n" +
    "	<div class=\"container\">\n" +
    "			\n" +
    "		<div class=\"bootcards-desktop-footer clearfix\" ng-if=\"footerTitle != null\">\n" +
    "			<p class=\"pull-left\">{{footerTitle}}</p>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"btn-group\">\n" +
    "			<ng-transclude></ng-transclude>\n" +
    "\n" +
    "			<a href=\"{{o.url}}\" ng-repeat=\"o in ::footerOptions\" class=\"btn btn-default no-break-out\">\n" +
    "	            <i class=\"fa fa-2x\" ng-class=\"o.icon ? o.icon : null\"></i>\n" +
    "	            {{o.label}}\n" +
    "	        </a>\n" +
    "\n" +
    "		</div>\n" +
    "\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("xc-form-modal-edit.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-form-modal-edit.html",
    "<div>\n" +
    "	<form class=\"form-horizontal\" name=\"cardForm\" role=\"form\">\n" +
    "	<div class=\"modal-header\">\n" +
    "\n" +
    "		<div class=\"btn-group pull-left\">\n" +
    "			<button class=\"btn btn-danger\" ng-click=\"cancelEdit()\" type=\"button\">\n" +
    "				<i class=\"fa fa-times\"></i>Cancel\n" +
    "			</button>\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"btn-group pull-right\">\n" +
    "			<button class=\"btn btn-success\" type=\"button\" ng-click=\"saveItem(cardForm)\">\n" +
    "				<i class=\"fa fa-check\"></i>Save\n" +
    "			</button>\n" +
    "		</div>\n" +
    "		<h4 class=\"modal-title\">Edit {{model.name}}</h4>		\n" +
    "	</div>\n" +
    "					\n" +
    "	<div class=\"modal-body form-horizontal\">\n" +
    "\n" +
    "		<div class=\"form-group\" ng-repeat=\"field in fieldsEdit\" ng-class=\"{ 'has-error': cardForm[field.field].$dirty && cardForm[field.field].$invalid }\">\n" +
    "			<label class=\"col-xs-3 control-label\" ng-if=\"field.label != null && field.type != 'html'\">{{field.label}}</label>\n" +
    "			<label class=\"col-md-3 control-label\" ng-if=\"field.label != null && field.type =='html'\">{{field.label}}</label>\n" +
    "			<div class=\"col-xs-9\" ng-if=\"field.type=='text' || field.type=='link'\">\n" +
    "				<input class=\"form-control\" name=\"{{field.field}}\" ng-model=\"selectedItem[field.field]\" ng-required=\"field.required\"  />\n" +
    "				<a class=\"fa fa-times-circle fa-lg clearer\" ng-hide=\"isEmpty(selectedItem[field.field])\" ng-click=\"clearField(field.field)\"></a>\n" +
    "			</div>\n" +
    "			<div class=\"col-xs-9\" ng-if=\"field.type=='email'\">\n" +
    "				<input class=\"form-control\" type=\"email\" name=\"{{field.field}}\" ng-model=\"selectedItem[field.field]\" ng-required=\"field.required\"  />\n" +
    "				<a class=\"fa fa-times-circle fa-lg clearer\" ng-hide=\"isEmpty(selectedItem[field.field])\" ng-click=\"clearField(field.field)\"></a>\n" +
    "			</div>\n" +
    "			<div class=\"col-xs-9\" ng-if=\"field.type=='phone'\">\n" +
    "				<input class=\"form-control\" type=\"tel\" name=\"{{field.field}}\" ng-model=\"selectedItem[field.field]\" ng-required=\"field.required\"  />\n" +
    "				<a class=\"fa fa-times-circle fa-lg clearer\" ng-hide=\"isEmpty(selectedItem[field.field])\" ng-click=\"clearField(field.field)\"></a>\n" +
    "			</div>\n" +
    "			<div class=\"col-xs-9\" ng-if=\"field.type=='date'\">\n" +
    "				<input class=\"form-control\" type=\"date\" name=\"{{field.field}}\" ng-model=\"selectedItem[field.field]\" ng-required=\"field.required\"  />\n" +
    "			</div>\n" +
    "			<div class=\"col-xs-9\" ng-if=\"field.type=='multiline'\">\n" +
    "				<textarea class=\"form-control\" name=\"{{field.field}}\" ng-model=\"selectedItem[field.field]\" ng-required=\"field.required\"></textarea>\n" +
    "				<a class=\"fa fa-times-circle fa-lg clearer\" ng-hide=\"isEmpty(selectedItem[field.field])\"ng-click=\"clearField(field.field)\"></a>\n" +
    "			</div>\n" +
    "			<div class=\"col-md-9 needsclick\" ng-if=\"field.type=='html'\">\n" +
    "				<div text-angular name=\"{{field.field}}\" \n" +
    "					class=\"needsclick\"\n" +
    "					ta-toolbar=\"{{editorToolbarOptions}}\" \n" +
    "					ta-text-editor-class=\"border-around\"\n" +
    "					ta-html-editor-class=\"border-around\"\n" +
    "					ng-model=\"selectedItem[field.field]\" \n" +
    "					ng-required=\"field.required\"></div>\n" +
    "			</div>\n" +
    "			<div class=\"col-xs-9\" ng-if=\"field.type=='select'\">\n" +
    "				<select class=\"form-control\" \n" +
    "					name=\"{{field.field}}\" \n" +
    "					ng-model=\"selectedItem[field.field]\" \n" +
    "					ng-options=\"option.value as option.label for option in fieldOptions[field.field]\"\n" +
    "					ng-required=\"field.required\">\n" +
    "				</select>\n" +
    "			</div>\n" +
    "			<div class=\"col-xs-9\" ng-if=\"field.type=='select-multiple'\">\n" +
    "				<select \n" +
    "					class=\"form-control\" multiple \n" +
    "					name=\"{{field.field}}\" \n" +
    "					ng-model=\"selectedItem[field.field]\" \n" +
    "					ng-options=\"option.value as option.label for option in fieldOptions[field.field]\"\n" +
    "					ng-required=\"field.required\" >\n" +
    "				</select>\n" +
    "			</div>\n" +
    "			<div class=\"col-xs-9\" ng-if=\"field.type=='toggle'\">	\n" +
    "				<xc-toggle ng-model=\"selectedItem[field.field]\"></xc-toggle>\n" +
    "			</div>\n" +
    "			\n" +
    "		</div> \n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"modal-footer\" ng-if=\"allowDelete && !isNew\">\n" +
    "		<button type=\"button\" class=\"btn btn-danger btn-block\" ng-click=\"deleteItem()\">\n" +
    "			<i class=\"fa fa-trash-o\"></i>\n" +
    "			Delete {{model.name}}\n" +
    "		</button>		\n" +
    "	</div>\n" +
    "\n" +
    "	</form>\n" +
    "\n" +
    "</div>");
}]);

angular.module("xc-form.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-form.html",
    "<span>\n" +
    "\n" +
    "	<!-- text if no item is selected -->\n" +
    "	<div ng-class=\"{'panel panel-default' : true , 'hidden' : selectedItem || !defaultText }\">\n" +
    "		<div class=\"list-group\">\n" +
    "			<div class=\"list-group-item\">\n" +
    "				{{defaultText}}\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "\n" +
    "	<!-- card (read) -->\n" +
    "	<div ng-class=\"{'panel panel-default' : true , 'hidden' : !selectedItem}\">\n" +
    "\n" +
    "		<div class=\"panel-heading clearfix\">\n" +
    "			<h3 class=\"panel-title pull-left\">{{model.name}}</h3>\n" +
    "			<a class=\"btn btn-primary pull-right\" ng-click=\"editDetails()\">\n" +
    "				<i class=\"fa fa-pencil\"></i><span>Edit</span>\n" +
    "			</a>\n" +
    "\n" +
    "		</div>\n" +
    "\n" +
    "		<div class=\"list-group\">\n" +
    "\n" +
    "			<div ng-repeat=\"field in fieldsRead\">\n" +
    "\n" +
    "				<div class=\"list-group-item\" ng-if=\"field.type=='text'\">\n" +
    "\n" +
    "					<span ng-if=\"field.field == thumbnailShowWith\">\n" +
    "					\n" +
    "						<!--placeholder-->\n" +
    "						<i ng-if=\"showPlaceholder()\" class=\"fa fa-3x pull-left\" ng-class=\"'fa-' + imagePlaceholderIcon\"></i>\n" +
    "						<i ng-if=\"showIcon()\" class=\"fa fa-3x pull-left\" ng-class=\"'fa-' + item[iconField]\"></i>\n" +
    "\n" +
    "						<!--image-->\n" +
    "						<img \n" +
    "							ng-if=\"showImage()\"\n" +
    "							class=\"img-rounded pull-left\" \n" +
    "							ng-src=\"{{thumbnailSrc}}\" />\n" +
    "					</span>\n" +
    "\n" +
    "					<label>{{field.label}}</label>\n" +
    "					<h4 class=\"list-group-item-heading\">{{selectedItem[field.field] | fltr : field.filter}}</h4>\n" +
    "				</div>\n" +
    "				<div class=\"list-group-item\" ng-if=\"field.type=='date'\">\n" +
    "					<label>{{field.label}}</label>\n" +
    "					<h4 class=\"list-group-item-heading\">{{selectedItem[field.field] | date}}</h4>\n" +
    "				</div>\n" +
    "				<div class=\"list-group-item\" ng-if=\"field.type=='select'\">\n" +
    "					<label>{{field.label}}</label>\n" +
    "					<h4 class=\"list-group-item-heading\">{{selectedItem[field.field] | fltr : field.filter}}</h4>\n" +
    "				</div>\n" +
    "				<div class=\"list-group-item\" ng-if=\"field.type=='multiline'\">\n" +
    "					<label>{{field.label}}</label>\n" +
    "					<h4 class=\"list-group-item-heading\" ng-bind-html=\"selectedItem[field.field]\"></h4>\n" +
    "				</div>\n" +
    "				<div class=\"list-group-item\" ng-if=\"field.type=='html'\">\n" +
    "					<label>{{field.label}}</label>\n" +
    "					<h4 class=\"list-group-item-heading\" ng-bind-html=\"selectedItem[field.field]\"></h4>\n" +
    "				</div>\n" +
    "				<a href=\"mailto:{{selectedItem[field.field]}}\" class=\"list-group-item\" \n" +
    "					ng-if=\"field.type=='email'\">\n" +
    "					<label>{{field.label}}</label>\n" +
    "					<h4 class=\"list-group-item-heading\">{{selectedItem[field.field] | fltr : field.filter}}</h4>\n" +
    "				</a>\n" +
    "				<a href=\"tel:{{selectedItem[field.field]}}\" class=\"list-group-item\" \n" +
    "					ng-if=\"field.type=='phone'\">\n" +
    "					<label>{{field.label}}</label>\n" +
    "					<h4 class=\"list-group-item-heading\">{{selectedItem[field.field] | fltr : field.filter}}</h4>\n" +
    "				</a>\n" +
    "				<a href=\"{{selectedItem[field.field]}}\" class=\"list-group-item\" \n" +
    "					ng-if=\"field.type=='link'\">\n" +
    "					<label>{{field.label}}</label>\n" +
    "					<h4 class=\"list-group-item-heading\">{{selectedItem[field.field] | fltr : field.filter}}</h4>\n" +
    "				</a>\n" +
    "\n" +
    "			<div>\n" +
    "		</div>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "</span>");
}]);

angular.module("xc-header.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-header.html",
    "<div>\n" +
    "\n" +
    "<div class=\"navbar navbar-default navbar-fixed-top\" ng-class=\"{'bootcards-navbar-double' : hasSecondaryOptions}\" role=\"navigation\">\n" +
    "\n" +
    "	<div class=\"container\">\n" +
    "\n" +
    "		<div class=\"navbar-header\">\n" +
    "\n" +
    "			<a class=\"navbar-brand\" ng-class=\"{'no-menu' : !hasMenu() }\">{{::title}}</a>	\n" +
    "\n" +
    "      <button class=\"navbar-toggle\" data-target=\".navbar-collapse\" data-toggle=\"collapse\" type=\"button\">\n" +
    "        <span class=\"sr-only\">Toggle menu</span>\n" +
    "        <span class=\"icon-bar\"></span>\n" +
    "        <span class=\"icon-bar\"></span>\n" +
    "        <span class=\"icon-bar\"></span>\n" +
    "      </button>\n" +
    "\n" +
    "		</div>\n" +
    "\n" +
    "    <!--right aligned button-->\n" +
    "    <div class=\"btn-group bootcards-header-right\" ng-transclude></div>\n" +
    "\n" +
    "    <!--back button for small displays-->\n" +
    "    <button id=\"backButton\" class=\"btn btn-default btn-back pull-left hidden\" ng-click=\"goBack()\" type=\"button\" >\n" +
    "      <i class=\"fa fa-lg fa-chevron-left\"></i><span>Back</span>\n" +
    "    </button>\n" +
    "\n" +
    "		<!--slide-in menu button-->\n" +
    "		<button id=\"offCanvasToggleButton\" type=\"button\" class=\"btn btn-default btn-menu pull-left offCanvasToggle\" data-toggle=\"offcanvas\">\n" +
    "	   <i class=\"fa fa-lg fa-bars\"></i><span>Menu</span>\n" +
    "	   </button>\n" +
    "\n" +
    "    <div class=\"navbar-collapse collapse\">\n" +
    "\n" +
    "      <!--secondary menu options-->\n" +
    "      <ul ng-if=\"hasSecondaryOptions\" class=\"nav navbar-nav navbar-right bootcards-nav-secondary\">\n" +
    "        <li ng-repeat=\"o in ::menuOptionsSecondary\" ng-class=\"{'active' : isActive(o), 'dropdown' : hasSubmenu(o)}\">\n" +
    "\n" +
    "        {{o.callback}}\n" +
    "          <!--basic option-->\n" +
    "          <a href=\"{{o.url}}\" ng-if=\"!hasSubmenu(o)\" class=\"no-break-out\">\n" +
    "            <i class=\"fa\" ng-class=\"o.icon ? o.icon : null\"></i>\n" +
    "            {{o.label}}\n" +
    "          </a>\n" +
    "\n" +
    "          <!--dropdown-->\n" +
    "          <a href=\"#\" ng-if=\"hasSubmenu(o)\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n" +
    "            <i class=\"fa\" ng-class=\"o.icon ? o.icon : null\"></i>\n" +
    "            {{::o.label}} <span class=\"caret\"></span>\n" +
    "\n" +
    "            <ul class=\"dropdown-menu\">\n" +
    "              <li ng-repeat=\"so in ::o.menuOptions\"  ng-class=\"{'active' : isActive(so)}\">\n" +
    "                <a href=\"{{::so.url}}\" class=\"no-break-out\">\n" +
    "                  <i class=\"fa fa-fw\" ng-class=\"so.icon ? so.icon : null\"></i>\n" +
    "                  {{::so.label}}\n" +
    "                </a>\n" +
    "              </li>\n" +
    "            </ul>\n" +
    "          </a>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "\n" +
    "      <!-- menu options (desktop) -->\n" +
    "      <ul class=\"nav navbar-nav\" ng-class=\"{'navbar-right' : menuAlignRight, 'navbar-right bootcards-nav-primary' : hasSecondaryOptions}\">\n" +
    "\n" +
    "        <li ng-repeat=\"o in ::menuOptions\" ng-class=\"{'active' : isActive(o), 'dropdown' : hasSubmenu(o)}\">\n" +
    "\n" +
    "          <!--basic option-->\n" +
    "          <a href=\"{{o.url}}\" ng-if=\"!hasSubmenu(o)\" class=\"no-break-out\">\n" +
    "            <i class=\"fa\" ng-class=\"o.icon ? o.icon : null\"></i>\n" +
    "            {{o.label}}\n" +
    "          </a>\n" +
    "\n" +
    "          <!--dropdown-->\n" +
    "          <a href=\"#\" ng-if=\"hasSubmenu(o)\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\n" +
    "            <i class=\"fa\" ng-class=\"o.icon ? o.icon : null\"></i>\n" +
    "            {{::o.label}} <span class=\"caret\"></span>\n" +
    "\n" +
    "            <ul class=\"dropdown-menu\">\n" +
    "              <li ng-repeat=\"so in ::o.menuOptions\"  ng-class=\"{'active' : isActive(so)}\">\n" +
    "                <a href=\"{{::so.url}}\" class=\"no-break-out\">\n" +
    "                  <i class=\"fa fa-fw\" ng-class=\"so.icon ? so.icon : null\"></i>\n" +
    "                  {{::so.label}}\n" +
    "                </a>\n" +
    "              </li>\n" +
    "            </ul>\n" +
    "          </a>\n" +
    "        </li>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "	</div>\n" +
    "\n" +
    "</div>\n" +
    "\n" +
    "<!--slide in menu-->\n" +
    "  <nav id=\"offCanvasMenu\" class=\"navmenu offcanvas offcanvas-left\" ng-if=\"hasMenu\">\n" +
    "    <ul class=\"nav\">\n" +
    "\n" +
    "      <li ng-repeat=\"o in ::menuOptions\" ng-class=\"{'active' : isActive(o)}\">\n" +
    "\n" +
    "        <!--basic option-->\n" +
    "        <a href=\"{{::o.url}}\" ng-if=\"!hasSubmenu(o)\" class=\"no-break-out\">\n" +
    "          <i class=\"fa fa-lg fa-fw\" ng-class=\"o.icon ? o.icon : null\"></i>&nbsp;{{::o.label}}\n" +
    "        </a>\n" +
    "\n" +
    "        <!--option with submenu-->\n" +
    "        <a href=\"#\" ng-if=\"hasSubmenu(o)\" class=\"dropdown-toggle no-break-out\" data-toggle=\"collapse\" ng-click=\"o.collapsed = !o.collapsed\">\n" +
    "            <i class=\"fa fa-fw fa-lg fa-chevron-circle-right\"></i>&nbsp;{{::o.label}}\n" +
    "        </a>\n" +
    "\n" +
    "        <div collapse=\"o.collapsed\" ng-if=\"hasSubmenu(o)\" >\n" +
    "\n" +
    "          <ul class=\"nav navmenu-nav\"  >\n" +
    "            <li ng-repeat=\"so in ::o.menuOptions\">\n" +
    "              <a href=\"{{so.url}}\" class=\"no-break-out\">\n" +
    "                <i class=\"fa fa-fw fa-lg\" ng-class=\"so.icon ? so.icon : null\"></i>&nbsp;{{::so.label}}\n" +
    "              </a>\n" +
    "            </li>\n" +
    "          </ul>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "      </li>\n" +
    "\n" +
    "      <!--secondary menu options-->\n" +
    "      <li ng-repeat=\"o in ::menuOptionsSecondary\" ng-class=\"{'active' : isActive(o)}\">\n" +
    "\n" +
    "        <!--basic option-->\n" +
    "        <a href=\"{{::o.url}}\" ng-if=\"!hasSubmenu(o)\" class=\"no-break-out\">\n" +
    "          <i class=\"fa fa-fw fa-lg\" ng-class=\"o.icon ? o.icon : null\"></i>&nbsp;{{::o.label}}\n" +
    "        </a>\n" +
    "\n" +
    "        <!--option with submenu-->\n" +
    "        <a href=\"#\" ng-if=\"hasSubmenu(o)\" class=\"dropdown-toggle no-break-out\" data-toggle=\"dropdown\" ng-click=\"o.collapsed = !o.collapsed\">\n" +
    "          <i class=\"fa fa-fw fa-chevron-circle-right\"></i>&nbsp;{{::o.label}}\n" +
    "        </a>\n" +
    " \n" +
    "        <div collapse=\"o.collapsed\" ng-if=\"hasSubmenu(o)\" >\n" +
    "\n" +
    "          <ul class=\"nav navmenu-nav\"  >\n" +
    "              <li ng-repeat=\"so in ::o.menuOptions\">\n" +
    "                <a href=\"{{so.url}}\" class=\"no-break-out\">\n" +
    "                  <i class=\"fa fa-fw fa-lg\" ng-class=\"so.icon ? so.icon : null\"></i>&nbsp;{{::so.label}}\n" +
    "                </a>\n" +
    "              </li>\n" +
    "          </ul>\n" +
    "        </div>\n" +
    "\n" +
    "      </li>\n" +
    "     \n" +
    "    </ul>\n" +
    "\n" +
    "    <div ng-show=\"appVersion != ''\" style=\"margin-top:20px; padding-left: 20px; font-size: 12px; color: #777\">{{appVersion}}</div>\n" +
    "  </nav>\n" +
    "\n" +
    "</div>");
}]);

angular.module("xc-image.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-image.html",
    "<div class=\"panel panel-default bootcards-media\" ng-class=\"{'hidden' : !imageSrc}\">\n" +
    "\n" +
    "	<div ng-show=\"title\" class=\"panel-heading\" ng-class=\"{'hidden' : !title}\">\n" +
    "		<h3 class=\"panel-title\">{{title}}</h3>\n" +
    "	</div>\n" +
    "	<!-- <div class=\"panel-body\">\n" +
    "		description\n" +
    "	</div> -->\n" +
    "	\n" +
    "	<img ng-src=\"{{imageSrc}}\" class=\"img-responsive\" />\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("xc-layout.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-layout.html",
    "<div class=\"container bootcards-container\">\n" +
    "	<div class=\"row\">\n" +
    "		<span ng-transclude></span>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("xc-list-accordion.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-list-accordion.html",
    "<span>\n" +
    "\n" +
    " 	<div class=\"bootcards-list\" ng-class=\"colClass()\" ng-show=\"!$root.hideList\">\n" +
    "\n" +
    "		<div class=\"panel panel-default\">\n" +
    "\n" +
    "			<ng-include src=\"'xc-list-heading.html'\"></ng-include>\n" +
    "\n" +
    "			<div class=\"list-group\">\n" +
    "\n" +
    "				<div ng-repeat=\"group in groups\" class=\"animate-repeat\">\n" +
    "					<a ng-class=\"{'collapsed' : group.collapsed}\" class=\"list-group-item bootcards-list-subheading\" ng-click=\"toggleCategory(group)\">\n" +
    "						{{group.name}}\n" +
    "					</a>\n" +
    "				\n" +
    "					<a class=\"list-group-item\" ng-show=\"!group.collapsed\" ng-repeat=\"item in group.entries | filter : filter\" ng-click=\"select(item)\"\n" +
    "						ng-class=\"{'active' : selected == item}\">\n" +
    "\n" +
    "						<!--(placeholder) icon-->\n" +
    "						<i ng-if=\"showPlaceholder(item)\" class=\"fa fa-2x pull-left\" ng-class=\"'fa-' + imagePlaceholderIcon\"></i>\n" +
    "						<i ng-if=\"showIcon(item)\" class=\"fa fa-2x pull-left\" ng-class=\"'fa-' + item[iconField]\"></i>\n" +
    "					\n" +
    "						<!--image-->\n" +
    "						<img \n" +
    "						ng-if=\"showImage(item)\"\n" +
    "						class=\"img-rounded pull-left\" \n" +
    "						ng-src=\"{{ imageBase + item[imageField] }}\" />\n" +
    "\n" +
    "						<h4 class=\"list-group-item-heading\">{{item[summaryField] | fltr : fieldFilters[summaryField]}}&nbsp;</h4>\n" +
    "\n" +
    "						<p class=\"list-group-item-text\">{{ item[detailsField] | fltr : fieldFilters[detailsField] : detailsFieldType }}&nbsp;</p>\n" +
    "						\n" +
    "					</a>\n" +
    "\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"list-group-item\" ng-show=\"isLoading\">\n" +
    "					<i class=\"fa fa-spinner fa-spin fa-fw\" style=\"margin-right:0; opacity: 1;\"></i>Loading...\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"list-group-item\" ng-show=\"groups.length == 0\">\n" +
    "					No items found\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"list-group-item\" ng-show=\"!isLoading && hasMore\">\n" +
    "					<button ng-click=\"loadMore()\" id=\"btnLoadMore\" class=\"btn btn-default\">\n" +
    "						Load more...\n" +
    "					</button>\n" +
    "				</div>\n" +
    "\n" +
    "			</div>\n" +
    "\n" +
    "		</div>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "	<div class='bootcards-cards {{colRight}}' ng-show=\"$root.showCards\">\n" +
    "\n" +
    "		<span ng-transclude></span>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "</span>\n" +
    "");
}]);

angular.module("xc-list-categorised.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-list-categorised.html",
    "<span>\n" +
    "\n" +
    " 	<div class=\"bootcards-list\" ng-class=\"colClass()\" ng-show=\"!$root.hideList\">\n" +
    "\n" +
    "		<div class=\"panel panel-default\">\n" +
    "\n" +
    "			<ng-include src=\"'xc-list-heading.html'\"></ng-include>\n" +
    "\n" +
    "			<div class=\"list-group\">\n" +
    "\n" +
    "				<div ng-repeat=\"group in groups | filter : filter\" class=\"animate-repeat\">\n" +
    "					<div class=\"list-group-item bootcards-list-subheading\" >\n" +
    "						{{group.name}}\n" +
    "					</div>\n" +
    "				\n" +
    "					<a class=\"list-group-item\" ng-repeat=\"item in group.entries | filter : filter\" ng-click=\"select(item)\"\n" +
    "						ng-class=\"{'active' : selected == item}\">\n" +
    "\n" +
    "						<!--(placeholder) icon-->\n" +
    "						<i ng-if=\"showPlaceholder(item)\" class=\"fa fa-2x pull-left\" ng-class=\"'fa-' + imagePlaceholderIcon\"></i>\n" +
    "						<i ng-if=\"showIcon(item)\" class=\"fa fa-2x pull-left\" ng-class=\"'fa-' + item[iconField]\"></i>\n" +
    "					\n" +
    "						<!--image-->\n" +
    "						<img \n" +
    "						ng-show=\"showImage(item)\"\n" +
    "						class=\"img-rounded pull-left\" \n" +
    "						ng-src=\"{{ imageBase + item[imageField] }}\" />\n" +
    "\n" +
    "						<h4 class=\"list-group-item-heading\">{{item[summaryField] | fltr : fieldFilters[summaryField]}}&nbsp;</h4>\n" +
    "\n" +
    "						<p class=\"list-group-item-text\">{{ item[detailsField] | fltr : fieldFilters[detailsField] : detailsFieldType }}&nbsp;</p>\n" +
    "						\n" +
    "					</a>\n" +
    "\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"list-group-item\" ng-show=\"isLoading\">\n" +
    "					<i class=\"fa fa-spinner fa-spin fa-fw\" style=\"margin-right:0; opacity: 1;\"></i>Loading...\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"list-group-item\" ng-show=\"groups.length == 0\">\n" +
    "					No items found\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"list-group-item\" ng-show=\"!isLoading && hasMore\">\n" +
    "					<button ng-click=\"loadMore()\" id=\"btnLoadMore\" class=\"btn btn-default\">\n" +
    "						Load more...\n" +
    "					</button>\n" +
    "				</div>\n" +
    "\n" +
    "			</div>\n" +
    "\n" +
    "		</div>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "	<div class='bootcards-cards {{colRight}}' ng-show=\"$root.showCards\">\n" +
    "\n" +
    "		<span ng-transclude></span>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "</span>\n" +
    "");
}]);

angular.module("xc-list-detailed.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-list-detailed.html",
    "<span>\n" +
    "\n" +
    " 	<div class=\"bootcards-list\" ng-class=\"colClass()\" ng-show=\"!$root.hideList\">\n" +
    "\n" +
    "		<div class=\"panel panel-default\">\n" +
    "\n" +
    "			<ng-include src=\"'xc-list-heading.html'\"></ng-include>\n" +
    "\n" +
    "			<div class=\"list-group\">\n" +
    "				\n" +
    "				<a class=\"list-group-item animate-repeat\" ng-repeat=\"item in items | filter: filter | limitTo : itemsShown track by item.id\"  ng-click=\"select(item)\"\n" +
    "					ng-class=\"{'active' : selected == item}\">\n" +
    "\n" +
    "					<div class=\"row\">\n" +
    "\n" +
    "						<div class=\"col-sm-6\">\n" +
    "\n" +
    "							<!--(placeholder) icon-->\n" +
    "							<i ng-if=\"showPlaceholder(item)\" class=\"fa fa-2x pull-left\" ng-class=\"'fa-' + imagePlaceholderIcon\"></i>\n" +
    "							<i ng-if=\"showIcon(item)\" class=\"fa fa-2x pull-left\" ng-class=\"'fa-' + item[iconField]\"></i>\n" +
    "							\n" +
    "							<!--image-->\n" +
    "							<img \n" +
    "								ng-if=\"showImage(item)\"\n" +
    "								class=\"img-rounded pull-left\" \n" +
    "								ng-src=\"{{ imageBase + item[imageField] }}\" />\n" +
    "\n" +
    "							<h4 class=\"list-group-item-heading\">{{item[summaryField] | fltr : fieldFilters[summaryField]}}&nbsp;</h4>\n" +
    "\n" +
    "							<p class=\"list-group-item-text\">{{ item[detailsField] | fltr : fieldFilters[detailsField] : detailsFieldType }}&nbsp;</p>\n" +
    "\n" +
    "						</div>\n" +
    "						<div class=\"col-sm-6\">\n" +
    "							<p class=\"list-group-item-text\">{{item[detailsFieldSubTop] | fltr : fieldFilters[detailsFieldSubTop]}}</p>\n" +
    "							<p class=\"list-group-item-text\">{{item[detailsFieldSubBottom] | fltr : fieldFilters[detailsFieldSubBottom]}}</p>\n" +
    "						</div>\n" +
    "\n" +
    "					</div>\n" +
    "\n" +
    "					\n" +
    "				</a>\n" +
    "\n" +
    "				<div class=\"list-group-item\" ng-show=\"isLoading\">\n" +
    "					<i class=\"fa fa-spinner fa-spin fa-fw\" style=\"margin-right:0; opacity: 1;\"></i>Loading...\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"list-group-item\" ng-show=\"items.length == 0\">\n" +
    "					No items found\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"list-group-item\" ng-show=\"!isLoading && hasMore\">\n" +
    "					<button ng-click=\"loadMore()\" id=\"btnLoadMore\" class=\"btn btn-default\">\n" +
    "						Load more...\n" +
    "					</button>\n" +
    "				</div>\n" +
    "\n" +
    "			</div>\n" +
    "\n" +
    "		</div>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "	<div class='bootcards-cards {{colRight}}' ng-show=\"$root.showCards\">\n" +
    "\n" +
    "		<span ng-transclude></span>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "</span>\n" +
    "");
}]);

angular.module("xc-list-flat.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-list-flat.html",
    "<span>\n" +
    "\n" +
    " 	<div class=\"bootcards-list\" ng-class=\"colClass()\" ng-show=\"!$root.hideList\">\n" +
    "\n" +
    "		<div class=\"panel panel-default\">\n" +
    "\n" +
    "			<ng-include src=\"'xc-list-heading.html'\"></ng-include>\n" +
    "\n" +
    "			<div class=\"list-group\">\n" +
    "				\n" +
    "				<a class=\"list-group-item animate-repeat\" ng-repeat=\"item in items | filter: filter | limitTo : itemsShown track by item.id\"  ng-click=\"select(item)\"\n" +
    "					ng-class=\"{'active' : selected == item}\">\n" +
    "\n" +
    "					<!--(placeholder) icon-->\n" +
    "					<i ng-if=\"showPlaceholder(item)\" class=\"fa fa-2x pull-left\" ng-class=\"'fa-' + imagePlaceholderIcon\"></i>\n" +
    "					<i ng-if=\"showIcon(item)\" class=\"fa fa-2x pull-left\" ng-class=\"'fa-' + item[iconField]\"></i>\n" +
    "					\n" +
    "					<!--image-->\n" +
    "					<img \n" +
    "						ng-if=\"showImage(item)\"\n" +
    "						class=\"img-rounded pull-left\" \n" +
    "						ng-src=\"{{ imageBase + item[imageField] }}\" />\n" +
    "\n" +
    "					<h4 class=\"list-group-item-heading\">{{item[summaryField] | fltr : fieldFilters[summaryField]}}&nbsp;</h4>\n" +
    "\n" +
    "					<p class=\"list-group-item-text\">{{ item[detailsField] | fltr : fieldFilters[detailsField] : detailsFieldType }}&nbsp;</p>\n" +
    "					\n" +
    "				</a>\n" +
    "\n" +
    "				<div class=\"list-group-item\" ng-show=\"isLoading\">\n" +
    "					<i class=\"fa fa-spinner fa-spin fa-fw\" style=\"margin-right:0; opacity: 1;\"></i>Loading...\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"list-group-item\" ng-show=\"items.length == 0\">\n" +
    "					No items found\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"list-group-item\" ng-show=\"!isLoading && hasMore\">\n" +
    "					<button ng-click=\"loadMore()\" id=\"btnLoadMore\" class=\"btn btn-default\">\n" +
    "						Load more...\n" +
    "					</button>\n" +
    "				</div>\n" +
    "\n" +
    "			</div>\n" +
    "\n" +
    "		</div>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "	<div class='bootcards-cards {{colRight}}' ng-show=\"$root.showCards\">\n" +
    "\n" +
    "		<span ng-transclude></span>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "</span>\n" +
    "\n" +
    "");
}]);

angular.module("xc-list-heading.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-list-heading.html",
    "<div>\n" +
    "\n" +
    "	<div class=\"panel-heading\" ng-if=\"title.length>0\">\n" +
    "\n" +
    "		<div class=\"row\">\n" +
    "\n" +
    "			<div class=\"col-xs-8\">\n" +
    "				<h3 class=\"panel-title\">{{::title}}</h3>\n" +
    "			</div>\n" +
    "\n" +
    "			<div class=\"col-xs-4\" ng-if=\"allowAdd\">\n" +
    "\n" +
    "				<a class=\"btn btn-primary btn-block\" href=\"#\" ng-click=\"addNewItem()\">\n" +
    "					<i class=\"fa fa-plus\"></i> \n" +
    "					<span>Add</span>\n" +
    "				</a>\n" +
    "				\n" +
    "			</div>\n" +
    "\n" +
    "		</div>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"panel-body\" ng-show=\"allowSearch\">\n" +
    "\n" +
    "		<!--add a new item-->\n" +
    "		<div class=\"search-form\">\n" +
    "			<div class=\"row\">\n" +
    "			    <div class=\"col-xs-9\">\n" +
    "			      <div class=\"form-group\">\n" +
    "				      <input type=\"text\" class=\"form-control\" ng-model=\"$parent.filter\" placeholder=\"Search {{::model.name }}...\">\n" +
    "				      <a class=\"fa fa-times-circle fa-lg clearer\" ng-click=\"clearSearch()\" ng-show=\"$parent.filter\"></a>\n" +
    "				      <i class=\"fa fa-search\"></i>\n" +
    "			      </div>\n" +
    "			    </div>\n" +
    "				   \n" +
    "				<div class=\"col-xs-3\" ng-if=\"allowAdd && !title\">\n" +
    "\n" +
    "					<a class=\"btn btn-primary btn-block\" href=\"#\" ng-click=\"addNewItem()\">\n" +
    "						<i class=\"fa fa-plus\"></i> \n" +
    "						<span>Add</span>\n" +
    "					</a>\n" +
    "					\n" +
    "				</div>\n" +
    "\n" +
    "			</div>						    \n" +
    "		</div>				\n" +
    "\n" +
    "\n" +
    "	</div>		\n" +
    "\n" +
    "</div>");
}]);

angular.module("xc-reading.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-reading.html",
    "<div class=\"panel panel-default bootcards-richtext\"> \n" +
    "  <div class=\"panel-heading clearfix\">\n" +
    "    <h3 class=\"panel-title pull-left\">{{::title}}</h3>\n" +
    "      \n" +
    "    <div class=\"btn-group pull-right\">\n" +
    "      <a class=\"btn btn-primary icon-only\" href=\"#\" ng-click=\"increaseFontSize()\">\n" +
    "        <i class=\"fa fa-lg fa-search-plus\"></i></a>\n" +
    "        <a class=\"btn btn-primary icon-only\" href=\"#\" ng-click=\"decreaseFontSize()\">\n" +
    "        <i class=\"fa fa-lg fa-search-minus\"></i></a>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "    <div class=\"panel-body typographyreadcontent\">\n" +
    "      <ng-transclude></ng-transclude>\n" +
    "    </div>\n" +
    "  <div class=\"panel-footer\">\n" +
    "    <small class=\"pull-left\">{{footerText}}</small>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("xc-summary-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-summary-item.html",
    "<div class=\"col-xs-6 col-sm-4\">\n" +
    "\n" +
    "	<a class=\"bootcards-summary-item\" \n" +
    "		ng-click=\"openLink(target)\"\n" +
    "		style=\"padding-top:35px;\">\n" +
    "		<i class=\"fa fa-3x {{icon}}\"></i>\n" +
    "		<h4>\n" +
    "			{{title}}\n" +
    "			<span class=\"label label-info\">{{count}}</span>\n" +
    "		</h4>\n" +
    "	</a>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);

angular.module("xc-summary.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-summary.html",
    "<div class=\"panel panel-default bootcards-summary\">\n" +
    "	\n" +
    "	<div class=\"panel-heading\">\n" +
    "		<h3 class=\"panel-title\">{{::title}}</h3>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"panel-body\">\n" +
    "		<div class=\"row\">\n" +
    "			<ng-transclude></ng-transclude>\n" +
    "		</div>\n" +
    "	</div>\n" +
    "	\n" +
    "	<div class=\"panel-footer\" ng-show=\"footerText\">\n" +
    "		<small class=\"pull-left\">\n" +
    "			{{footerText}}\n" +
    "		</small>\n" +
    "	</div>\n" +
    "	\n" +
    "</div>");
}]);

angular.module("xc-upload.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("xc-upload.html",
    "<div class=\"panel panel-default boorcards-media\"> \n" +
    "\n" +
    "  <form>\n" +
    "\n" +
    "  <div class=\"panel-heading clearfix\">\n" +
    "    <h class=\"panel-title pull-left\">{{::title}}</h3>  \n" +
    "  </div>\n" +
    "    \n" +
    "  <div class=\"panel-body\">\n" +
    "    Tap 'Select' to take a new photo or select from your Photos library, then tap 'Upload'.\n" +
    "\n" +
    "    <div style=\"margin-top:15px; text-align: center;\">\n" +
    "      <div class=\"js-photouploader\">\n" +
    "        <div class=\"photoUpload btn btn-primary\" style=\"display: none;\">\n" +
    "          <span id=\"view:_id1:_id173:_id181:computedField1\">Select photo</span>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"js-photouploader-preview\">\n" +
    "          <span style=\"font-size: 200px; color: #bbb;\" class=\"fa fa-2x fa-camera\"></span>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <span class=\"js-custom-select-var hidden\">.js-custom-photo-select</span>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"panel-footer\">\n" +
    "    <div class=\"btn-group btn-group-justified\">\n" +
    "      <div class=\"btn-group\">\n" +
    "        <div class=\"js-custom-photo-select photoUpload btn btn-default\"><i class=\"fa fa-camera\"></i>Select\n" +
    "          <input type=\"file\" class=\"js-photouploader-upload\" accept=\"image/*\" onchange=\"targetWidth = 1024;\n" +
    "          targetHeight = 768;\n" +
    "          doCrop = false;\n" +
    "          var file = event.target.files[0];\n" +
    "          orientation = 0;  \n" +
    "          angular.element(this).scope().loadImage(file);\">\n" +
    "        </div>\n" +
    "      </div>\n" +
    "      <div class=\"btn-group\">\n" +
    "        <button class=\"btn btn-default\" ng-click=\"rotateImage(true)\" type=\"button\"><i class=\"fa fa-rotate-right\"></i>Rotate</button>\n" +
    "      </div>\n" +
    "      <div class=\"btn-group\">\n" +
    "        <button class=\"hidden\" type=\"button\">save</button>\n" +
    "        <button type=\"button\" ng-click=\"savePhoto()\" class=\"btn btn-default uploadphotobutton\">\n" +
    "          <i class=\"fa\" ng-class=\"{'fa-upload' : !uploadInProgress, 'fa-circle-o-notch fa-spin' : uploadInProgress}\"></i>Upload</button></div>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "\n" +
    "  </form>\n" +
    "</div>");
}]);
