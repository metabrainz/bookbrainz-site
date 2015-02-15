var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');

function bundle() {
  var srcFiles = [
    './views/editor/editor.js',
    './views/entity/create/publication.js',
    './views/entity/create/creator.js',
    './views/layout.js',
  ];

  var dstFiles = [
    'public/javascripts/editor.js',
    'public/javascripts/publication.js',
    'public/javascripts/creator.js',
    'public/javascripts/layout.js',
  ];

  return browserify(srcFiles)
  .plugin('factor-bundle', {outputs: dstFiles})
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(gulp.dest('public/javascripts'));
}

function compress() {
  return gulp.src('public/javascripts/*.js')
  .pipe(uglify())
  .pipe(gulp.dest('public/javascripts'));
}

gulp.task('default', bundle);
gulp.task('bundle', bundle);
gulp.task('compress', ['bundle'], compress);
gulp.task('watch', function() {
  var watcher = gulp.watch('./views/**/*.js', ['bundle']);
  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});
