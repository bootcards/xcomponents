
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