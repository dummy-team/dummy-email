const gulp = require('gulp')
const batch = require('gulp-batch')
const watch = require('gulp-watch')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const pug = require('gulp-pug')
const sass = require('gulp-sass')
const inlineCss = require('gulp-inline-css')
const imagemin = require('gulp-imagemin')
const sourcemaps = require('gulp-sourcemaps')
const replace = require('gulp-replace');
const browserSync = require('browser-sync').create()
const fs = require('fs')
const runSequence = require('run-sequence')
const siphon = require('siphon-media-query');


gulp.task('pug', function(){
  return gulp.src('templates/page/*.pug')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('.'))
    .pipe(browserSync.stream())
})

gulp.task('scss', function(){
  return gulp.src('css/src/**/*.scss')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream())
})

// Inline CSS and minify HTML
gulp.task('inline', function(){
  var css = fs.readFileSync('css/main.css').toString();
  var mqCss = siphon(css);

  return gulp.src('./*.html')
    .pipe(inlineCss({
      applyStyleTags: false,
      removeStyleTags: true,
      preserveMediaQueries: true,
      removeLinkTags: true,
      applyWidthAttributes: true
    }))
    .pipe(replace('<!-- <mediaquery> -->', `<style>${mqCss}</style>`))
    .pipe(gulp.dest('dist/'))
})

// Copy and compress images
gulp.task('images', function() {
  return gulp.src('img/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img/'))
})

gulp.task('serve', function() {

    browserSync.init({
        server: "./",
        open: false,
    })

    gulp.watch("css/src/**/*.scss", ['scss'])
    gulp.watch("templates/**/*.pug", ['pug'])
    gulp.watch('img/**/*').on('all', browserSync.reload)

    gulp.watch("./*.html", ['inline'])
    gulp.watch("css/*.css", ['inline'])
})

gulp.task('default', runSequence([ 'pug', 'scss', 'serve' ], 'inline', 'images'))
gulp.task('build', runSequence( 'pug', 'scss', 'inline', 'images'))
