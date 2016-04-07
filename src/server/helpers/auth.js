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

const passport = require('passport');
const Editor = require('bookbrainz-data').Editor;
const LocalStrategy = require('passport-local').Strategy;
const status = require('http-status');

const auth = {};

auth.init = function init(app) {
	passport.use(
		new LocalStrategy((username, password, done) => {
			new Editor({name: username}).fetch({require: true})
				.then((model) =>
					model.checkPassword(password)
						.then((res) => {
							if (res) {
								return done(null, model.toJSON());
							}

							return done(null, false, {
								message: 'Incorrect password.'
							});
						})
				)
				.catch(Editor.NotFoundError, () => {
					done(null, false, {message: 'Incorrect username.'});
				})
				.catch(done);
		})
	);

	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((user, done) => {
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

	return res.redirect(status.SEE_OTHER, '/login');
};

module.exports = auth;
