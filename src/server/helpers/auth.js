/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
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

const Promise = require('bluebird');

const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const MusicBrainzOAuth2Strategy =
	require('passport-musicbrainz-oauth2').Strategy;
const status = require('http-status');

const Editor = require('bookbrainz-data').Editor;

const error = require('../helpers/error');

const NotAuthenticatedError = require('../helpers/error').NotAuthenticatedError;

const auth = {};
const _ = require('lodash');

const config = require('./config');

auth.init = (app) => {
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

	passport.use(
		new MusicBrainzOAuth2Strategy(
			_.assign({scope: 'profile'}, config.musicbrainz),
			(accessToken, refreshToken, profile, cb) => {
				new Editor({metabrainzUserId: profile.metabrainz_user_id})
					.fetch()
					.then((model) => {
						if (model) {
							// Update the model with the fetched MB username
							return model.save({
								cachedMetabrainzName: profile.sub
							})
							.then(
								(savedModel) => cb(null, savedModel.toJSON())
							);
						}

						return cb(null, {
							name: profile.sub,
							gender: profile.gender,
							metabrainzUserId: profile.metabrainz_user_id
						});
					});
			}
		)
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

auth.isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}

	req.session.redirectTo = req.originalUrl;

	return res.redirect(status.SEE_OTHER, '/login');
};

auth.isAuthenticatedForHandler = (req, res, next) => {
	new Promise((resolve) => {
		if (req.isAuthenticated()) {
			resolve();
		}

		throw new NotAuthenticatedError();
	})
		.then(() => next())
		.catch((err) => error.sendErrorAsJSON(res, err));
};

module.exports = auth;
