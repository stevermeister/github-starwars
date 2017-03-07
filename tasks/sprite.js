
const gulp = require('gulp');
const sprite = require('gulp.spritesmith');

module.exports = function (options) {

    return function() {
        var spriteData =
            gulp.src('./src/assets/images/sprite/*.*') // путь, откуда берем картинки для спрайта
                .pipe(spritesmith({
                    imgName: 'sprite.png',
                    cssName: 'sprite.styl',
                    cssFormat: 'stylus',
                    algorithm: 'binary-tree',
                    cssTemplate: 'stylus.template.mustache',
                    cssVarMap: function(sprite) {
                        sprite.name = 's-' + sprite.name
                    }
                }));

        spriteData.img.pipe(gulp.dest('./built/assets/images/')); // путь, куда сохраняем картинку
        spriteData.css.pipe(gulp.dest('./src/assets/styles/')); // путь, куда сохраняем стили
    };

}