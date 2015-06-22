'use strict';

var lib = {
	node:{
		util:require('util')
	},
	deps:{
		q:require('q')
	},
	odin:{
		Exception:require('odin').Exception,
		dataSource:{
			Driver:require('odin-dataSource').Driver,
			Mapping:require('odin-dataSource').Mapping,
			drivers:{
				tingoDb:{
					converters:{
						ConverterTingoDbDefault:require('./converters/ConverterTingoDbDefault'),
						ConverterTingoDbObjectId:require('./converters/ConverterTingoDbObjectId')
					}
				}
			}
		}
	}
};

var OPERATORS = {};
OPERATORS[lib.odin.dataSource.Mapping.QUERY_OPERATOR_AND] = '$and';
OPERATORS[lib.odin.dataSource.Mapping.QUERY_OPERATOR_OR] = '$or';
OPERATORS[lib.odin.dataSource.Mapping.QUERY_OPERATOR_NOT] = '$not';
OPERATORS[lib.odin.dataSource.Mapping.QUERY_OPERATOR_EQUAL] = '$eq';
OPERATORS[lib.odin.dataSource.Mapping.QUERY_OPERATOR_NOT_EQUAL] = '$ne';
OPERATORS[lib.odin.dataSource.Mapping.QUERY_OPERATOR_GREATER_THAN] = '$gt';
OPERATORS[lib.odin.dataSource.Mapping.QUERY_OPERATOR_GREATER_THAN_OR_EQUAL] = '$gte';
OPERATORS[lib.odin.dataSource.Mapping.QUERY_OPERATOR_LESS_THAN] = '$lt';
OPERATORS[lib.odin.dataSource.Mapping.QUERY_OPERATOR_LESS_THAN_OR_EQUAL] = '$lte';
OPERATORS[lib.odin.dataSource.Mapping.QUERY_OPERATOR_IN] = '$in';
OPERATORS[lib.odin.dataSource.Mapping.QUERY_OPERATOR_NOT_IN] = '$nin';
OPERATORS[lib.odin.dataSource.Mapping.QUERY_OPERATOR_REGEX] = '$regex';

/**
	@class
	@classdesc						TingoDB driver.
	@extends						module:odin/dataSource.Driver
	@alias							module:odin/dataSource/drivers/tingoDb.DriverTingoDb

	@desc							Constructs a new TingoDB driver.
	@param {tingoDb} p_tingoDb		TingoDB instance.
	@param {tingoDb.Db} p_db		TingoDB database instance.
*/
function DriverTingoDb(p_tingoDb, p_db) {
	lib.odin.dataSource.Driver.call(this);

	Object.defineProperty(this, '_tingoDb', {value:p_tingoDb});
	Object.defineProperty(this, '_db', {value:p_db});
};

lib.node.util.inherits(DriverTingoDb, lib.odin.dataSource.Driver);

DriverTingoDb.prototype.coerceType = function(p_type) {
	switch(p_type) {
		default:
			return '';
	}
};

DriverTingoDb.prototype.createConverter = function(p_rawType) {
	switch(p_rawType) {
		case 'ObjectID':
			return new lib.odin.dataSource.drivers.tingoDb.converters.ConverterTingoDbObjectId(this._tingoDb);
		break;
		default:
			return new lib.odin.dataSource.drivers.tingoDb.converters.ConverterTingoDbDefault();
	}
};

DriverTingoDb.prototype.ensureCollection = function(p_collection, p_fields, p_primaryKey) {
	return lib.deps.q.ninvoke(this._db, 'collection', p_collection);
};

DriverTingoDb.prototype.ensureIndex = function(p_collection, p_index) {
	return lib.deps.q.ninvoke(this._db, 'collection', p_collection)
	.then(function(p_dbCollection) {
		var fields = {};
		p_index.fields.forEach(function(p_field) {
			fields[p_field.name] = (p_field.order == lib.odin.dataSource.Mapping.ORDER_ASC) ? 1 : -1;
		});

		return lib.deps.q.ninvoke(p_dbCollection, 'ensureIndex', fields, {
			name:p_index.name,
			unique:p_index.unique
		});
	});
};

DriverTingoDb.prototype.ensureForeignKey = function(p_source, p_target, p_fields) {
};

/**
	@protected
	@desc							Build a TingoDB query from the provided data source query.
	@param {Object} p_operation		Query operation.
	@returns						{Object} A TingoDB query.
	@example
		Data source query:
		{operator:'$and', expressions:[
			{operator:'$eq', field:'_id', value:new ObjectID(21)},
			{operator:'$eq', field:'name', value:'test'},
			{operator:'$or', expressions:[{exp1}, {exp2}]},
			{operator:'$and', expressions:[
				{operator:'$in', field:'rights', value:[]},
				{operator:'$regex', field:'rights', value:/^[a-z]+$/}
			]},
			{operator:'$and', expressions:[
				{operator:'$eq', field:'field', value:'value'}
			]}
		]}

		TingoDB query:
		{$and:[
			{_id:{$eq:new ObjectID(21)}},
			{name:{$eq:'test'}},
			{$or:[{exp1}, {exp2}]},
			{$and:[
				{rights:{$in:[]}},
				{rights:{$regex:/^[a-z]+$/}}
			]},
			{$and:[
				{field:{$eq:'value'}}
			]}
		]}
*/
DriverTingoDb.prototype._buildQuery = function(p_operation) {
	if(!p_operation) {
		return {};
	}

	var translatedOperator = OPERATORS[p_operation.operator];
	switch(p_operation.operator) {
		case lib.odin.dataSource.Mapping.QUERY_OPERATOR_AND:
		case lib.odin.dataSource.Mapping.QUERY_OPERATOR_OR:
			var result = {};
			var self = this;
			result[translatedOperator] = p_operation.children.map(function(p_child) {
				return self._buildQuery(p_child);
			});

			return result;
		break;
		case lib.odin.dataSource.Mapping.QUERY_OPERATOR_NOT:
			var result = {};
			result[translatedOperator] = this._buildQuery(p_operation.child);
			return result;
		break;
		case lib.odin.dataSource.Mapping.QUERY_OPERATOR_EQUAL:
		case lib.odin.dataSource.Mapping.QUERY_OPERATOR_NOT_EQUAL:
		case lib.odin.dataSource.Mapping.QUERY_OPERATOR_LESS_THAN:
		case lib.odin.dataSource.Mapping.QUERY_OPERATOR_LESS_THAN_OR_EQUAL:
		case lib.odin.dataSource.Mapping.QUERY_OPERATOR_GREATER_THAN:
		case lib.odin.dataSource.Mapping.QUERY_OPERATOR_GREATER_THAN_OR_EQUAL:
		case lib.odin.dataSource.Mapping.QUERY_OPERATOR_IN:
		case lib.odin.dataSource.Mapping.QUERY_OPERATOR_NOT_IN:
		case lib.odin.dataSource.Mapping.QUERY_OPERATOR_REGEX:
			var result = {};
			result[p_operation.field] = {};
			result[p_operation.field][translatedOperator] = p_operation.value;
			return result;
		break;
		default:
			throw new lib.Exception('Unknown operator', {operator:p_operation.operator});
	}
};

DriverTingoDb.prototype.find = function(p_collection, p_query, p_options) {
	var self = this;
	return lib.deps.q.ninvoke(this._db, 'collection', p_collection)
	.then(function(p_dbCollection) {
		var query = self._buildQuery(p_query);
		var cursor = p_dbCollection.find(query);

		if(p_options.skip) {
			cursor.skip(p_options.skip);
		}

		if(p_options.limit) {
			cursor.limit(p_options.limit);
		}

		if(p_options.orderBy) {
			cursor.sort(p_options.orderBy.map(function(p_item) {
				return [p_item.field, (p_item.field == lib.odin.dataSource.Mapping.ORDER_ASC) ? 1 : -1];
			}));
		}

		return new DriverCursor(cursor);
	});
};

DriverTingoDb.prototype.findOne = function(p_collection, p_query) {
	var self = this;
	return lib.deps.q.ninvoke(this._db, 'collection', p_collection)
	.then(function(p_dbCollection) {
		var query = self._buildQuery(p_query);
		return lib.deps.q.ninvoke(p_dbCollection, 'findOne', query);
	});
};

DriverTingoDb.prototype.create = function(p_collection, p_data) {
	return lib.deps.q.ninvoke(this._db, 'collection', p_collection)
	.then(function(p_dbCollection) {
		return lib.deps.q.ninvoke(p_dbCollection, 'insert', p_data);
	});
};

/**
	@todo	Work on performance improvement with Observable pattern.
*/
DriverTingoDb.prototype.save = function(p_collection, p_primaryKey, p_data) {
	var data = {};
	Object.keys(p_data).forEach(function(p_key) {
		data[p_key] = {$set:p_data[p_key]};
	});

	return lib.deps.q.ninvoke(this._db, 'collection', p_collection)
	.then(function(p_dbCollection) {
		return lib.deps.q.ninvoke(p_dbCollection, 'update', p_primaryKey, p_data);
	});
};

DriverTingoDb.prototype.remove = function(p_collection, p_primaryKey) {
	return lib.deps.q.ninvoke(this._db, 'collection', p_collection)
	.then(function(p_dbCollection) {
		return lib.deps.q.ninvoke(p_dbCollection, 'remove', p_primaryKey);
	});
};

/**
	@todo	Work on a basic commit/rollback support for TingoDB.
*/
DriverTingoDb.prototype.commit = function() {
};

/**
	@todo	Work on a basic commit/rollback support for TingoDB.
*/
DriverTingoDb.prototype.rollback = function() {
};

DriverTingoDb.prototype.close = function() {
	return lib.deps.q.ninvoke(this._db, 'close');
};

module.exports = DriverTingoDb;