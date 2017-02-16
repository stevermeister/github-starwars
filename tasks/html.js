
const gulp = require('gulp'),
    fileInclude = require('gulp-file-include');



module.exports = function(options) {
    return function() {
        return gulp.src(options.src)
            .pipe(fileInclude({
                prefix: '@@',
                basepath: '@file'
            }))
            .pipe(gulp.dest(options.dest));
    };

};
