
const gulp = require('gulp');
const through2 = require('through2').obj;
const fs = require('fs');
const shell = require('shelljs');


module.exports = function (options) {
    return function () {
        gulp.src(options.src.html)
            .pipe(through2(
                function (file, code, cb) {
                    shell.exec('git add --all && git commit -am "Auto-commit"');
                    if(shell.exec('git checkout -b gh-pages').code !== 0){
                        shell.exec('git checkout gh-pages');
                    }
                    cb(null, file);
                }
            ))
            .pipe(through2(
                function (file, code, cb) {
                    var template = file.contents.toString('utf-8');
                    var jsCode = fs.readFileSync(options.src.js, 'utf-8');
                    jsCode = jsCode.split("'").join(' &#39; ');
                    var result = template.replace('{code}', 'javascript: ' + jsCode + 'void(0);');
                    file.contents = new Buffer(result, 'utf-8');
                    cb(null, file);
                }
            ))
            .pipe(gulp.dest(options.dest))
            .pipe(through2(
                function (file, code, cb) {
                    shell.exec('find . | grep -v .git | grep -v .gitignore | grep -v node_modules | grep -v index.html | xargs rm -rf ');
                    shell.exec('git add --all && git commit -m "deploy" && git push origin gh-pages');
                    cb(null, file);
                }
            ))
    }
};