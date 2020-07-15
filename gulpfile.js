'use strict';

let preprocessor = 'scss';

const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');

function browsersync() {
  browserSync.init({
    server: { baseDir: 'app/'},
    notify: false,
    online: true
  });
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.min.js',
    'app/js/app.js',
  ])
  .pipe(concat('app.min.js'))
  .pipe(uglify())
  .pipe(dest('app/js/'))
  .pipe(browserSync.stream());
}

function styles() {
  return src('app/' + preprocessor + '/main.' + preprocessor + '')
  .pipe(sass())
  .pipe(concat('app.css'))
  .pipe(autoprefixer({ grid: 'autoplace' }))
  .pipe(dest('app/css/'))
}

function normalizecss() {
  return src([
    'node_modules/normalize.css/normalize.css',
    'app/css/app.css',
    ])
  .pipe(concat('app.min.css'))  
  .pipe(cleancss({ level: { 1: { specialComments: 0 } }/*, format: 'beautify'*/ }))
  .pipe(dest('app/css/'))
  .pipe(browserSync.stream());
}

function images() {
  return src('app/img/src/**/*')
  .pipe(newer('app/img/dest/'))
  .pipe(imagemin())
  .pipe(dest('app/img/dest/'));
}

function cleanimg() {
  return(del('app/img/dest/**/*'));
}

function cleandist() {
  return del('dist/**/*');
}

function buildcopy() {
  return src([
    'app/css/**/*.min.css',
    'app/js/**/*.min.js',
    'app/img/dest/**/*',
    'app/**/*.html',
    ], { base: 'app/' })
  .pipe(dest('dist'))
}

function startwatch() {
  watch('app/**/' + preprocessor + '/**/*', styles);
  watch(['app/**/*.css', '!app/**/*.min.css'], normalizecss);
  watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
  watch('app/**/*.html').on('change', browserSync.reload);
  watch('app/img/src/**/*', images);
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.normalizecss = normalizecss;
exports.images = images;
exports.cleandist = cleandist;
exports.cleanimg = cleanimg;
exports.build = series(cleandist, styles, normalizecss, scripts, images, buildcopy);

exports.default = parallel(styles, normalizecss, scripts, browsersync, startwatch);