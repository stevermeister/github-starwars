const config = {

    path: {

        app: { //Пути откуда брать исходники
            html: './app/html/index.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
            scripts: './app/scripts/index.ts',//В стилях и скриптах нам понадобятся только main файлы
            styles: './app/styles/style.less',
            static: './app/static/**',
            video: './app/video/*',
            php: './app/php/**/*.*',
            utility: ['./app/utility_files/*', './app/utility_files/.htaccess'],
            img: './app/static/img/**/*.*' //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        },

        public: { //Тут мы укажем куда складывать готовые после сборки файлы
            html: './public',
            scripts: './public/js',
            styles: './public/css',
            static: './public',
            img: './public/img',
            video: './public/video',
            php: './public/php',
            serve: './public'
        },

        watch: {
            html: './app/html/**/*.html',
            styles: './app/styles/**/*.less',
            scripts: './app/scripts/**/*.ts',
            static: './app/static/**/*.*',
            img: './app/img/**/*.*',
            serve: './public/**/*.*'
        },
        deploy: {
            src: {
                js: './public/js/index.js',
                html: './app/gh-pages/index.html'
            },
            dest: './'
        },
        clean: './public'
    }
};

module.exports = config;