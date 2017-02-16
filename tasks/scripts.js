const gulp = require('gulp'),
    concat = require('gulp-concat'),
    fileInclude = require('gulp-file-include'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify');


module.exports = function(options) {

    return function() {
        return gulp.src(options.src)
            .pipe(fileInclude({
                prefix: '@@',
                basepath: '@file'
            }))
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(uglify())
            .pipe(gulp.dest('./public/js'));
    };
};
