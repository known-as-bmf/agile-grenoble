var _ = require('underscore');
var addStream = require('add-stream');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var concatCss = require('gulp-concat-css');
var cssNano = require('gulp-cssnano');
var del = require('del');
var gulp = require('gulp');
var inject = require('gulp-inject');
var nodemon = require('gulp-nodemon');
var path = require('path');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourceMaps = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');
var through = require('through2');
var ts = require('gulp-typescript');
var tslint = require('gulp-tslint');
var uglify = require('gulp-uglify');
var wiredep = require('wiredep').stream;

// Clean the dist folder
gulp.task('clean', function () {
  return del('public/dist/**');
});

// Lint to keep us in line
gulp.task('lint', function () {
  return gulp.src('public/src/**/*.ts')
    .pipe(tslint())
    .pipe(tslint.report('default'));
});

// Concatenate & minify JS
gulp.task('scripts', function () {
  var tsProject = ts.createProject('tsconfig.json');

  return gulp.src('public/src/**/*.ts')
    .pipe(addStream.obj(prepareTemplates()))
    .pipe(sourceMaps.init())
    .pipe(tsProject())
    .pipe(gulp.dest('public/dist'))
    .pipe(rename('app.min.js'))
    .pipe(uglify())
    .pipe(sourceMaps.write('.'))
    .pipe(gulp.dest('public/dist'));
});

// Compile, concat & minify sass
gulp.task('sass', function () {
  return gulp.src('public/src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('public/dist/css'));
});

gulp.task('concatCss', ['sass'], function () {
  return gulp.src('public/dist/css/**/*.css')
    .pipe(concatCss('app.css'))
    .pipe(gulp.dest('public/dist'))
});

gulp.task('cssNano', ['sass', 'concatCss'], function () {
  return gulp.src('public/dist/app.css')
    .pipe(cssNano())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('public/dist'));
});

// Inject dist + bower lib files
gulp.task('inject', ['scripts', 'cssNano'], function () {
  // inject our dist files
  var injectSrc = gulp.src([
    './public/dist/app.css',
    './public/dist/app.js'
  ], {
    read: false
  });

  var injectOptions = {
    ignorePath: '/public'
  };

  // inject bower deps
  var options = {
    bowerJson: require('./bower.json'),
    directory: './public/lib',
    ignorePath: '../../public'
  };

  return gulp.src('public/*.html')
    .pipe(wiredep(options))
    .pipe(inject(injectSrc, injectOptions))
    .pipe(gulp.dest('public'));

});

gulp.task('i18n', function () {
  return gulp.src('public/src/**/i18n/*.json')
    .pipe(i18n())
    .pipe(gulp.dest('public/dist/i18n'))
})

gulp.task('compile', ['lint', 'scripts', 'sass', 'concatCss', 'cssNano']);
gulp.task('compile-w', ['compile'], function (done) {
  browserSync.reload();
  done();
});

gulp.task('build', ['compile', 'inject']);

gulp.task('serve', ['build'], function () {
  browserSync.init({
    server: 'public',
    ui: false
  });

  // watch
  gulp.watch(['public/src/**/*(*.ts|*.html|*.scss)'], ['compile-w']);

  // TODO: add a watch for each file type and trigger reload by browsersync options
});

// Default Task
gulp.task('default', ['serve']);


function prepareTemplates() {
  // we get a conflict with the < % = var % > syntax for $templateCache
  // template header, so we'll just encode values to keep yo happy
  var encodedHeader = 'angular.module(&quot;&lt;%= module %&gt;&quot;&lt;%= standalone %&gt;).run([&quot;$templateCache&quot;, function($templateCache:any) {';
  return gulp.src('public/src/**/*.html')
    .pipe(templateCache('templates.ts', {
      // root: 'app-templates',
      module: 'app.templates',
      standalone: true,
      templateHeader: _.unescape(encodedHeader)
    }));
}

// see https://github.com/baijunjie/gulp-i18n-combine/blob/master/index.js
// TODO: make it a gulp module
// rename "merge-same-name" ?
function i18n() {

  var tmp = [];

  // parse input files (a list of many <locale>.json)
  // from a glob like 'public/**/i18n/*.json'
  var parse = function (file, enc, done) {
    // ignore empty files and streams
    if (file.isNull() || file.isStream()) {
      done();
      return;
    }

    tmp.push(file);

    done();
  }

  // output files (1 <locale>.json per locale)
  var flush = function (done) {
    var self = this;

    tmp.forEach(function (file) {
      self.push(file);
    });

    done();
  }

  return through.obj(parse, flush);
}
