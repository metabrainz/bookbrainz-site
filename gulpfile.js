var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var prettify = require('gulp-jsbeautifier');
var path = require('path');

function bundle() {
	var srcFiles = [
		'./views/editor/editor.js',
		'./views/entity/create/publication.js',
		'./views/entity/create/creator.js',
		'./views/layout.js',
		'./views/relationship/relationship_editor.js',
	];

	var dstFiles = [
		'public/js/editor.js',
		'public/js/publication.js',
		'public/js/creator.js',
		'public/js/layout.js',
		'public/js/relationship_editor.js',
	];

	return browserify(srcFiles)
		.plugin('factor-bundle', {
			outputs: dstFiles
		})
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('public/js'));
}

function compress() {
	return gulp.src('public/js/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('public/js'));
}

function tidy() {
	var srcFiles = [
		'./routes/**/*.js',
		'./views/**/*.js',
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
	var watcher = gulp.watch('./views/**/*.js', ['bundle']);
	watcher.on('change', function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
});
