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
const browserSync = require('browser-sync').create()
const fs = require('fs')
const runSequence = require('run-sequence')

gulp.task('pug', function(){
  return gulp.src('templates/page/*.pug')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(pug())
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
  return gulp.src('./*.html')
    .pipe(inlineCss({
      applyStyleTags: false,
      removeStyleTags: true,
      preserveMediaQueries: true,
      removeLinkTags: false
    }))
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
})

gulp.task('default', [ 'pug', 'scss', 'serve' ])
gulp.task('build', runSequence( 'pug', 'scss', 'inline', 'images'))
