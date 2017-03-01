const gulp = require('gulp'),
	 browserify = require("browserify"),
	 source = require('vinyl-source-stream'),
	 tsify = require("tsify");



module.exports = function(options) {

    return function() {
		return browserify({
			basedir: '.',
			debug: true,
			entries: [options.src],
			cache: {},
			packageCache: {}
		})
			.plugin(tsify)
			.bundle()
			.pipe(source('index.js'))
			.pipe(gulp.dest(options.dest));
    };
};
