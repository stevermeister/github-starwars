var gulp = require('gulp'),
    del = require('del'),
    runSequence = require('run-sequence');

var path = require('./config/gulp.config').path;


function requireTask(taskName, path, options) {
    options = options || {};
    options.taskName = taskName;
    gulp.task(taskName, function(callback) {
        var task = require(path).call(this, options);

        return task(callback);
    });
}



requireTask('html', './tasks/html', {
    src: path.app.html,
    dest: path.public.html
});




requireTask('styles', './tasks/styles', {
    src: path.app.styles,
    dest: path.public.styles
});




requireTask('scripts', './tasks/scripts', {
    src: path.app.scripts,
    dest: path.public.scripts
});




requireTask('static', './tasks/static', {
    src: path.app.static,
    dest: path.public.static
});

requireTask('deploy', './tasks/deploy', {
    src: {
        js: path.deploy.src.js,
        html: path.deploy.src.html
    },
    dest: path.deploy.dest
});



gulp.task('clean', function() {
    del(path.clean);
});



gulp.task('build', function (cb) {
    runSequence('clean',
    ['styles', 'scripts', 'static', 'html'],
    cb
    )
});


gulp.task('offline', function (cb) {
	runSequence('build',
		['watch'],
		cb
	)
});



gulp.task('default', function (cb) {
    runSequence('build',
        ['watch', 'serve'],
        cb
    )
});


gulp.task('watch', function () {

    gulp.watch(path.watch.html, ['html']);
    gulp.watch(path.watch.styles, ['styles']);
    gulp.watch(path.watch.scripts, ['scripts']);
    gulp.watch(path.watch.static, ['static']);

});



requireTask('serve', './tasks/serve', {
    src: path.public.serve,
    watch: path.watch.serve
});

