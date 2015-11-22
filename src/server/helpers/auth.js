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
const config = require('../helpers/config');
const BBWSStrategy = require('./passport-bookbrainz-ws');
const status = require('http-status');

const auth = {};

auth.init = function init(app) {
	passport.use(new BBWSStrategy({
		wsURL: config.site.webservice,
		clientID: config.site.clientID
	}, (req, accessToken, refreshToken, profile, done) => {
		req.session.bearerToken = accessToken;

		done(null, profile);
	}));

	passport.serializeUser((user, done) => {
		done(null, user);
	});

	passport.deserializeUser((user, done) => {
		done(null, user);
	});

	app.use(passport.initialize());
	app.use(passport.session());
};

auth.authenticate = function authenticate() {
	return function authenticateFunc(req, res, next) {
		const options = {
			username: req.body.username,
			password: req.body.password
		};

		passport.authenticate('bbws', options)(req, res, (err) => {
			if (err) {
				console.log(err.stack);
				let newErr;
				switch (err.name) {
					case 'InternalOAuthError':
					case 'TokenError':
						newErr = new Error(
							'An internal error occurred during authentication'
						);
						break;
					case 'AuthorizationError':
						newErr = new Error('Invalid username or password');
						break;
					default:
						newErr = new Error(
							'An unknown error occurred during authentication'
						);
				}

				return next(newErr);
			}

			next();
		});
	};
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

	res.redirect(status.SEE_OTHER, '/login');
};

module.exports = auth;
