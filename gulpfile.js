/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

'use strict';

var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var prettify = require('gulp-jsbeautifier');
var path = require('path');
var glob = require('glob');
var mkdirp = require('mkdirp');
var reactify = require('reactify');
var gulpless = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var prefixer = require('gulp-autoprefixer');

function bundle() {
	var srcFiles =
		glob.sync('./templates/**/*.js')
		.concat(glob.sync('./templates/*.js'));

	var srcFiles2 =
		glob.sync('./src/client/controllers/**/*.js')
		.concat(glob.sync('./src/client/controllers/*.js'));

	console.log(srcFiles2);

	var dstFiles = srcFiles.map(function(f) {
		return path.join('./static', 'js', path.relative('./templates', f));
	});

	var dstFiles2 = srcFiles2.map(function(f) {
		return path.join('./static', 'js', path.relative('./src/client/controllers', f));
	});

	srcFiles = srcFiles.concat(srcFiles2);
	dstFiles = dstFiles.concat(dstFiles2);

	dstFiles.forEach(function(f) {
		mkdirp.sync(path.dirname(f));
	});

	return browserify(srcFiles)
		.transform(reactify)
		.plugin('factor-bundle', {
			outputs: dstFiles
		})
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('./static/js'));
}

function less() {
	return gulp.src(['./src/client/stylesheets/style.less', './src/client/stylesheets/font-awesome.less'])
		.pipe(gulpless({
			paths: [path.join(__dirname, './node_modules/bootstrap/less')]
		}))
		.pipe(prefixer('last 4 versions'))
		.pipe(minifyCSS())
		.pipe(gulp.dest('./static/stylesheets'));
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
		'./templates/**/*.js',
		'./app.js',
		'./gulpfile.js'
	];

	gulp.src(srcFiles)
		.pipe(prettify({
			js: {
				indent_with_tabs: true,
				brace_style: 'end-expand'
			},
			mode: 'VERIFY_AND_WRITE'
		}))
		.pipe(gulp.dest(function(f) {
			return f.base;
		}));
}

gulp.task('default', ['bundle', 'less']);
gulp.task('bundle', bundle);
gulp.task('less', less);
gulp.task('compress', ['bundle'], compress);
gulp.task('tidy', tidy);
gulp.task('watch', function() {
	var watcher = gulp.watch(['./src/**/*.js', './src/**/*.jsx', './templates/**/*.js'], ['bundle']);
	watcher.on('change', function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
});
