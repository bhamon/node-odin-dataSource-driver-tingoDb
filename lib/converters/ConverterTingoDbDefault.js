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
	@classdesc		Default converter.
	@extends		module:odin/dataSource.Converter
	@alias			module:odin/dataSource/drivers/tingoDb/converters.ConverterTingoDbDefault

	@desc			Constructs a new default converter.
*/
function ConverterTingoDbDefault() {
	lib.odin.dataSource.Converter.call(this);
};

lib.node.util.inherits(ConverterTingoDbDefault, lib.odin.dataSource.Converter);

/**
	@desc		Returns the input value without any changes.
	@retuns		The input value.
*/
ConverterTingoDbDefault.prototype.from = function(p_value) {
	return p_value;
};

/**
	@desc		Returns the input value without any changes.
	@retuns		The input value.
*/
ConverterTingoDbDefault.prototype.to = function(p_value) {
	return p_value;
};

module.exports = ConverterTingoDbDefault;