'use strict';

/**
	@module		odin/dataSource/drivers/tingoDb
	@desc		TingoDB driver.
*/

var lib = {
	deps:{
		q:require('q'),
		joi:require('joi'),
		tingoDb:require('tingoDb')
	},
	odin:{
		util:require('odin').util,
		dataSource:{
			drivers:{
				tingoDb:{
					DriverTingoDb:require('./DriverTingoDb')
				}
			}
		}
	}
};

/**
	@desc																		Creates a new TingoDB driver from the specified configuration set.
	@param {Object} p_config													Configuration set.
	@param {String} p_config.path												Database path.
	@param {Boolean} [p_config.memStore]										Store the database in-memory rather than to the specified path.
	@param {Boolean} [p_config.nativeObjectID]									Use native ObjectID object rather than the TingoDB implementation.
	@param {Number} [p_config.cacheSize]										Maximum number of cached objects per collection.
	@param {Number} [p_config.cacheMaxObjSize]									Maximum size of objects that can be placed in the cache.
	@param {Boolean} [p_config.searchInArray]									Enable support for nested search in array.
	@returns {Promise.<module:odin/dataSource/drivers/tingoDb.DriverTingoDb>}	A promise for a new driver instance.
*/
module.exports.create = function(p_config) {
	var config = lib.odin.util.validate(p_config, lib.deps.joi.object().required().keys({
		path:lib.deps.joi.string().required().min(1),
		memStore:lib.deps.joi.boolean().optional(),
		nativeObjectID:lib.deps.joi.boolean().optional(),
		cacheSize:lib.deps.joi.number().optional().integer().positive(),
		cacheMaxObjSize:lib.deps.joi.number().optional().integer().positive(),
		searchInArray:lib.deps.joi.boolean().optional()
	}));

	var tingoDb = lib.deps.tingoDb(config);
	var db = new tingoDb.Db(config.path, {});
	return lib.deps.q.when(new lib.odin.dataSource.drivers.tingoDb.DriverTingoDb(tingoDb, db));
};