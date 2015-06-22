'use strict';

var lib = {
	node:{
		path:require('path')
	},
	deps:{
		gulp:require('gulp'),
		mocha:require('gulp-mocha'),
		jsDoc:require('gulp-jsdoc')
	}
};

var config = {};
config.test = {};
config.test.srcBase = lib.node.path.resolve(__dirname, 'test');
config.test.src = lib.node.path.join(config.test.srcBase, '**', '*.js');
config.documentation = {};
config.documentation.srcBase = lib.node.path.resolve(__dirname, 'lib');
config.documentation.src = [
	lib.node.path.join(config.documentation.srcBase, '**', '*.js')
];
config.documentation.readme = lib.node.path.resolve(__dirname, 'README.md');
config.documentation.dist = lib.node.path.resolve(__dirname, 'docs');

// Tests
lib.deps.gulp.task('test', function() {
	return lib.deps.gulp.src(config.test.src, {read:false})
	.pipe(lib.deps.mocha({reporter:'spec'}));
});

// Javascript documentation
lib.deps.gulp.task('doc', function() {
	var src = [config.documentation.readme];
	Array.prototype.push.apply(src, config.documentation.src);

	return lib.deps.gulp.src(src)
	.pipe(lib.deps.jsDoc.parser({
		plugins:['plugins/markdown']
	}))
	.pipe(lib.deps.jsDoc.generator(config.documentation.dist));
});