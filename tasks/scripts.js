const gulp = require('gulp'),
	 browserify = require("browserify"),
	 source = require('vinyl-source-stream'),
	 tsify = require("tsify"),
	 buffer = require('vinyl-buffer'),
	 uglify = require('gulp-uglify'),
     babel = require('gulp-babel');



module.exports = function(options) {

    return function() {
		return browserify({
			basedir: '.',
			debug: true,
			entries: [options.src],
			cache: {},
			packageCache: {}
		})
			.plugin(tsify, {target: "ES6"})
			.bundle()
			.pipe(source('index.js'))
            .pipe(buffer())
			.pipe(babel({
                presets: ['es2015']
            }))
            .pipe(uglify())
			.pipe(gulp.dest(options.dest));
    };
};
