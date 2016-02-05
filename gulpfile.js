
var gulp = require('gulp'),
  path = require('path'),
  mocha = require('gulp-mocha-phantomjs');

require('colors');

gulp.task('dependencies', function() {
  var david = require('gulp-david');

  return gulp.src(path.join(__dirname,'package.json'))
    .pipe(david())
    .pipe(david.reporter);
});

gulp.task('lint', ['dependencies'], function () {
  var jshint = require('gulp-jshint'),
    jshintrc = path.join(__dirname, '.jshintrc'),
    failReporter = require('./test/lib/jshint-fail-reporter')(gulp);

  return gulp.src([
      path.join(__dirname, '/clearcut.js'),
      path.join(__dirname, '/gulpfile.js'),
      path.join(__dirname, '/test/specs.js')
    ])
    .pipe(jshint(jshintrc))
    .pipe(failReporter())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', ['lint'], function () {
  return gulp.src('test/runner.html')
    .pipe(mocha());
});

gulp.task('default', ['test'], function (done) {
  done();
});
