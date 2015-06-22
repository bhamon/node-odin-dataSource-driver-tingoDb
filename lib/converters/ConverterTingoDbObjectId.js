'use strict';

var lib = {
	node:{
		util:require('util')
	},
	odin:{
		dataSource:{
			Converter:require('odin-dataSource').Converter
		}
	}
};

/**
	@class
	@classdesc						ObjectID converter.
	@extends						module:odin/dataSource.Converter
	@alias							module:odin/dataSource/drivers/tingoDb/converters.ConverterTingoDbObjectId

	@desc							Constructs a new ObjectID converter.
	@param {tingoDb} p_tingoDb		TingoDB instance.
*/
function ConverterTingoDbObjectId(p_tingoDb) {
	lib.odin.dataSource.Converter.call(this);

	Object.defineProperty(this, '_tingoDb', {value:p_tingoDb});
};

lib.node.util.inherits(ConverterTingoDbObjectId, lib.odin.dataSource.Converter);

/**
	@desc		Returns the string representation of the input value.
	@retuns		The string representation of the input value.
*/
ConverterTingoDbObjectId.prototype.from = function(p_value) {
	return p_value.toString();
};

/**
	@desc		Wraps the input value in an ObjectID instance an returns it.
	@retuns		The wrapped input value.
*/
ConverterTingoDbObjectId.prototype.to = function(p_value) {
	return new this._tingoDb.ObjectID(p_value);
};

module.exports = ConverterTingoDbObjectId;