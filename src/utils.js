
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