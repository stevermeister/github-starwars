const gulp = require('gulp'),
    less = require('gulp-less'),
    lessAutoprefix = require('less-plugin-autoprefix'),
    autoprefix = new lessAutoprefix({ browsers: ['last 3 versions'] });



module.exports = function(options) {
  return function() {
    return gulp.src(options.src)
        .pipe(less({plugins: [autoprefix]}))
        //.pipe(less())
        .pipe(gulp.dest(options.dest));
  };

};
