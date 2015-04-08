var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var prettify = require('gulp-jsbeautifier');
var path = require('path');
var glob = require('glob');
var mkdirp = require('mkdirp');

function bundle() {
	var srcFiles =
		glob.sync('./templates/**/*.js').concat(glob.sync('./templates/*.js'));

	var dstFiles = srcFiles.map(function(f) {
		return path.join('./static', 'js', path.relative('./templates', f));
	});

	dstFiles.forEach(function(f) {
		mkdirp.sync(path.dirname(f));
	});

	return browserify(srcFiles)
		.plugin('factor-bundle', {
			outputs: dstFiles
		})
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('./static/js'));
}

function compress() {
	return gulp.src('static/js/**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('static/js'));
}

function tidy() {
	var srcFiles = [
		'./src/**/*.js',
		'./test/**/*.js',
		'./app.js',
		'./gulpfile.js',
	];

	gulp.src(srcFiles)
		.pipe(prettify({
			js: {
				indent_with_tabs: true
			},
			mode: 'VERIFY_AND_WRITE'
		}))
		.pipe(gulp.dest(function(f) {
			return f.base;
		}));
}

gulp.task('default', bundle);
gulp.task('bundle', bundle);
gulp.task('compress', ['bundle'], compress);
gulp.task('tidy', tidy);
gulp.task('watch', function() {
	var watcher = gulp.watch('./src/**/*.js', ['bundle']);
	watcher.on('change', function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
});
