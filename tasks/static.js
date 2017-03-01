'use strict';

var gulp = require('gulp'),
      changed = require('gulp-changed');

module.exports = function(options) {

  return function() {
    return gulp.src(options.src)
        .pipe(changed(options.dest))
        .pipe(gulp.dest(options.dest));
  };
};
