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

const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const path = require('path');
const glob = require('glob');
const mkdirp = require('mkdirp');
const gulpless = require('gulp-less');
const minifyCSS = require('gulp-minify-css');
const prefixer = require('gulp-autoprefixer');
const babelify = require('babelify');

function bundle() {
	let srcFiles =
		glob.sync('./templates/**/*.js')
		.concat(glob.sync('./templates/*.js'));

	const srcFiles2 =
		glob.sync('./src/client/controllers/**/*.js')
		.concat(glob.sync('./src/client/controllers/*.js'));

	let dstFiles = srcFiles.map((filename) =>
		path.join(
			'./static', 'js', path.relative('./templates', filename)
		)
	);

	const dstFiles2 = srcFiles2.map((filename) =>
		path.join(
			'./static', 'js',
			path.relative('./src/client/controllers', filename)
		)
	);

	srcFiles = srcFiles.concat(srcFiles2);
	dstFiles = dstFiles.concat(dstFiles2);

	dstFiles.forEach((filename) => {
		mkdirp.sync(path.dirname(filename));
	});

	return browserify(srcFiles)
		.transform(babelify, {presets: ['es2015', 'react']})
		.plugin('factor-bundle', {
			outputs: dstFiles
		})
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('./static/js'));
}

function less() {
	return gulp.src([
		'./src/client/stylesheets/style.less',
		'./src/client/stylesheets/font-awesome.less'
	])
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

gulp.task('default', ['bundle', 'less']);
gulp.task('bundle', bundle);
gulp.task('less', less);
gulp.task('compress', ['bundle'], compress);
gulp.task('watch', () => {
	const watcher = gulp.watch(
		['./src/**/*.js', './src/**/*.jsx', './templates/**/*.js'], ['bundle']
	);
	watcher.on('change', (event) =>
		console.log(`File ${event.path} was ${event.type} running tasks...`)
	);
});
