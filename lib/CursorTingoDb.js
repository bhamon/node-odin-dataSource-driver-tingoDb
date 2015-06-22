'use strict';

var lib = {
	node:{
		util:require('util')
	},
	odin:{
		dataSource:{
			Cursor:require('odin-dataSource').Cursor
		}
	}
};

/**
	@class
	@classdesc							TingoDB cursor.
	@extends							module:odin/dataSource.Cursor
	@alias								module:odin/dataSource/drivers/tingoDb.CursorTingoDb

	@desc								Constructs a new cursor.
	@param {tingoDb.Cursor} p_cursor	Underlying TingoDB cursor.
*/
function CursorTingoDb(p_cursor) {
	lib.odin.dataSource.Cursor.call(this);

	Object.defineProperty(this, '_cursor', {value:p_cursor});
};

lib.node.util.inherits(CursorTingoDb, lib.odin.dataSource.Cursor);

CursorTingoDb.prototype.isClosed = function() {
	return this._cursor.isClosed();
};

CursorTingoDb.prototype.next = function() {
	return lib.deps.q.ninvoke(this._cursor, 'nextObject');
};

CursorTingoDb.prototype.close = function() {
	return lib.deps.q.ninvoke(this._cursor, 'close');
};

module.exports = CursorTingoDb;