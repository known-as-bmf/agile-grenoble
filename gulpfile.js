// TODO: split into multiple files: https://github.com/betsol/gulp-require-tasks
const addStream = require('add-stream');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const concatCss = require('gulp-concat-css');
const cssNano = require('gulp-cssnano');
const del = require('del');
const filter = require('gulp-filter');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const inject = require('gulp-inject');
const ngAnnotate = require('gulp-ng-annotate');
const path = require('path');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourceMaps = require('gulp-sourcemaps');
const templateCache = require('gulp-angular-templatecache');
const through = require('through2');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const uglify = require('gulp-uglify');
const useref = require('gulp-useref');
const wiredep = require('wiredep').stream;
const debug = require('gulp-debug');

const annotateOptions = {
  remove: true,
  add: true,
  single_quotes: true
};

const htmlminOptions = {
  collapseWhitespace: true,
  conservativeCollapse: true
};

const browserSyncOptions = {
  server: {
    baseDir: 'public/build',
    routes: {
      "/lib": "public/lib",
      "/images": "public/images"
    }
  },
  ui: false
};

const injectOptions = {
  ignorePath: '/public/build',
  // addRootSlash: false
};

const wiredepOptions = {
  directory: 'public/lib',
  ignorePath: '../'
};

const userefOptions = {
  searchPath: ['public/build', 'public'],
  // noconcat: true
};

// Clean the dist & build folder
gulp.task('clean', function () {
  return del(['public/build/**', 'public/dist/**']);
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
    .pipe(sourceMaps.init())
    .pipe(tsProject()) // compile ts
    .pipe(addStream.obj(prepareTemplates())) // append templatecache
    .pipe(ngAnnotate(annotateOptions)) // add angular dependency injection
    .pipe(sourceMaps.write('.'))
    .pipe(gulp.dest('public/build'));
});

// Compile, concat & minify sass
gulp.task('sass', function () {
  return gulp.src('public/src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('public/build'));
});

gulp.task('styles', ['sass']);

gulp.task('i18n', function () {
  return gulp.src('public/src/**/i18n/*.json')
    .pipe(i18n())
    .pipe(gulp.dest('public/build/i18n'))
})

// Inject build + bower lib files
gulp.task('inject', ['scripts', 'styles'], function () {
  // inject our build files
  var injectSrc = gulp.src([
    'public/build/**/*.css',
    'public/build/**/*.js'
  ], {
    read: false
  });

  // inject bower deps
  var options = Object.assign({
      bowerJson: require('./bower.json')
    },
    wiredepOptions
  );

  return gulp.src('public/src/*.html')
    .pipe(wiredep(options))
    .pipe(inject(injectSrc, injectOptions))
    .pipe(gulp.dest('public/build'));
});

gulp.task('images', function () {
  return gulp.src(['public/images/**'])
    .pipe(gulp.dest('public/dist/images'));
});

gulp.task('fonts', function () {
  return gulp.src(['public/lib/font-awesome/fonts/**'])
    .pipe(gulp.dest('public/dist/fonts'));
});

// bundles the application into one self-contained directory
gulp.task('dist', ['build', 'images', 'fonts'], function () {
  const css = filter('**/*.css', {
    restore: true
  });
  const js = filter('**/*.js', {
    restore: true
  });

  return gulp.src('public/build/index.html')
    .pipe(useref(userefOptions))

    // css minification
    .pipe(css)
    .pipe(cssNano())
    .pipe(css.restore)
    // js minification
    .pipe(js)
    .pipe(uglify())
    .pipe(js.restore)

    .pipe(gulp.dest('public/dist'));
});

gulp.task('compile', ['lint', 'scripts', 'styles']);
gulp.task('compile-w', ['compile'], function (done) {
  browserSync.reload();
  done();
});

gulp.task('build', ['compile', 'inject']);

gulp.task('serve', ['build'], function () {
  browserSync.init(browserSyncOptions);

  // watch
  gulp.watch(['public/src/**/*(*.ts|*.html|*.scss)'], ['compile-w']);

  // TODO: add a watch for each file type and trigger reload by browsersync options
});

// Default Task
gulp.task('default', ['serve']);


function prepareTemplates() {
  return gulp.src('public/src/**/*.html')
    .pipe(htmlmin(htmlminOptions))
    .pipe(templateCache('templates.js', {
      module: 'app.templates',
      standalone: true
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
      // self.push(file);
    });

    done();
  }

  return through.obj(parse, flush);
}
