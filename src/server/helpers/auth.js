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

var passport = require('passport');
var Editor = require('bookbrainz-data').Editor;
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');

var auth = {};

auth.init = function init(app) {
	passport.use(
		new LocalStrategy(
			function strategy(username, password, done) {
				new Editor({ name: username }).fetch({ require: true })
					.then(function processEditor(model) {
						bcrypt.compare(password, model.get('password'),
							function handleResult(err, res) {
								if (err) {
									done(err);
								}
								else if (res) {
									done(null, model.toJSON());
								}
								else {
									done(null, false, {
										message: 'Incorrect password.'
									});
								}
							}
						);
					})
					.catch(Editor.NotFoundError, function handleNotFound() {
						done(null, false, { message: 'Incorrect username.' });
					})
					.catch(done);
			}
		)
	);

	passport.serializeUser(function serialize(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function deserialize(user, done) {
		done(null, user);
	});

	app.use(passport.initialize());
	app.use(passport.session());
};

auth.isAuthenticated = function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	if (req.route.path === '/handler') {
		req.session.redirectTo = req.baseUrl;
	}
	else {
		req.session.redirectTo = req.originalUrl;
	}

	res.redirect(303, '/login');
};

module.exports = auth;
