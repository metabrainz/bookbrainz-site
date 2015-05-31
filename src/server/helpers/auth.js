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

var passport = require('passport');
var config = require('../helpers/config');
var BBWSStrategy = require('./passport-bookbrainz-ws');

var auth = {};

auth.init = function(app) {
	passport.use(new BBWSStrategy({
		wsURL: config.site.webservice,
		clientID: config.site.clientID
	}, function(req, accessToken, refreshToken, profile, done) {
		req.session.bearerToken = accessToken;

		done(null, profile);
	}));

	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(user, done) {
		done(null, user);
	});

	app.use(passport.initialize());
	app.use(passport.session());
};

auth.authenticate = function() {
	return function(req, res, next) {
		var options = {
			username: req.body.username,
			password: req.body.password
		};

		var callback = function(err) {
			if (err) {
				console.log(err.stack);

				var newErr;

				switch (err.name) {
					case 'InternalOAuthError':
					case 'TokenError':
						newErr = new Error('An internal error occurred during authentication');
						break;
					case 'AuthorizationError':
						newErr = new Error('Invalid username or password');
						break;
				}

				return next(newErr);
			}

			next();
		};

		passport.authenticate('bbws', options)(req, res, callback);
	};
};

auth.isAuthenticated = function(req, res, next) {
	if (req.isAuthenticated())
		return next();

	if (req.route.path == '/handler')
		req.session.redirectTo = req.baseUrl;
	else
		req.session.redirectTo = req.originalUrl;

	res.redirect(303, '/login');
};

module.exports = auth;
