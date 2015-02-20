
var app = angular.module("xc.factories", ['ngResource', 'pouchdb']);

app.service('configService', [ function() {

    var endpoint = '/null';

    return {

	    setEndpoint : function(url) {
	    	this.endpoint = url;
	    },

	    endpoint : endpoint
	   
	};

} ] );

app.factory('RESTFactory', ['$http', 'configService', function($http, configService) {

	return {

		info : function() {

			var url = configService.endpoint.replace(":id", "") + 'count';

			return $http.get(url).then( function(res) {
				return { 'count' : res.data.count};
			});

		},

		insert : function(toInsert) {
			console.error('not implemented');
		},

		all : function() { 

			var url = configService.endpoint.replace(":id", "");

			console.log('querying REST service at ' + url);

			return $http.get(url).then( function(res) {
				console.log('returning '  + res.data.length + ' items');
				return res.data;
			});

		},

		saveNew : function(item) {
			
			var url = configService.endpoint.replace(":id", "");

			return $http.post(url, item).then( function(res) {
				return res.data;
			});

		},

		update : function(item) {
		
			var url = configService.endpoint.replace(":id", "");

			return $http.put(url, item).then( function(res) {
				return res.data;
			});

		},

		delete : function(item) {
			var url = configService.endpoint.replace(":id", item.id);
			return $http.delete(url);
		},

		deleteAll : function() {

			console.error('not implemented');
			
		},

		getById : function(id) {

			var url = configService.endpoint.replace(":id", id);

			return $http.get(url).then( function(res) {
				return res.data;
			});

		},

		exists : function(id) {

			var url = configService.endpoint.replace(":id", id) + '/exists';

			return $http.get(url).then( function(res) {
				return res.data;
			});
		}

	};

} ] );

app.factory('PouchFactory', ['pouchDB', 'configService', function(pouchDB, configService) {

	return {

		info : function() {

			var dbName = configService.endpoint;
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

		insert : function( toInsert ) {
			var dbName = configService.endpoint;
			var pouch = pouchDB(dbName);
			return pouch.bulkDocs(toInsert);
		},

		all : function() { 
			
			var dbName = configService.endpoint;
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

		saveNew : function(item) {

			var dbName = configService.endpoint;
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

		getById : function(id) {

			var dbName = configService.endpoint;
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

		update : function(item) {

			var dbName = configService.endpoint;
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

		delete : function(item) {

			var dbName = configService.endpoint;
			var db = pouchDB(dbName);

			return db.remove(item)
			.then( function(res) {
				return null;
			})
			.catch( function(err) {
				console.error(err);
			});

		},

		deleteAll : function() {

			console.error('not implemented');

		},

		exists : function(id) {
			return this.getById(id).then( function(res) {
				return {exists : (res != null)};
			});
		}

	};


}] );

app.factory('LowlaFactory', ['configService', function(configService) {

	var collection = 'items';
	var lowla = null;

	return {

		getDb : function() {
			if (this.lowla == null) {
				this.lowla = new LowlaDB();
			}
			return this.lowla;
		},

		info : function() {

			var dbName = configService.endpoint;
			var items = this.getDb().collection(dbName, collection);

			return items.count().then(function(res) {
				return {count : res};
			});

		},

		insert : function( toInsert ) {
			var dbName = configService.endpoint;
			var items = this.getDb().collection(dbName, collection);
			return items.insert(toInsert);
		},

		all : function() { 

			var dbName = configService.endpoint;
			var items = this.getDb().collection(dbName, collection);

			console.log('querying Lowla database named ' + dbName);

			//var syncServer = location.protocol + '//' + location.hostname + ":3001";
			//this.getDb().sync(syncServer);

			return items.find().toArray().then( function(res) {
				console.log('returning ' + res.length + ' results');
				return res;
			});

		},

		saveNew : function(item) {

			var dbName = configService.endpoint;
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

		getById : function(id) {

			var dbName = configService.endpoint;
			var items = this.getDb().collection(dbName, collection);

			return items.find( { _id : id});

		},

		update : function(item) {

			var dbName = configService.endpoint;
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

		delete : function(item) {


			var dbName = configService.endpoint;
			var items = this.getDb().collection(dbName, collection);

			return items.remove( { _id : item._id } ).then( function(res) {
				console.log('ok', res);
				return null;
			}, function(err) {
				console.error(err);
			});

		},

		deleteAll : function() {

			var dbName = configService.endpoint;
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

		exists : function(id) {
			return this.getById(id).then( function(res) {
				return {exists : (res != null)};
			});
		}

	};


}]);