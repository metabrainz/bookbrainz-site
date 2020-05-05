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

import * as MusicBrainzOAuth from 'passport-musicbrainz-oauth2';
import * as error from '../../common/helpers/error';

import StrategyMock from './mock-passport-strategy';
import _ from 'lodash';
import config from '../../common/helpers/config';
import log from 'log';
import passport from 'passport';
import status from 'http-status';


async function _linkMBAccount(orm, bbUserJSON, mbUserJSON) {
	const {Editor} = orm;
	const fetchedEditor = await new Editor({id: bbUserJSON.id})
		.fetch({require: true});

	return fetchedEditor.save({
		cachedMetabrainzName: mbUserJSON.sub,
		metabrainzUserId: mbUserJSON.metabrainz_user_id
	});
}

function _getAccountByMBUserId(orm, mbUserJSON) {
	const {Editor} = orm;
	return new Editor({metabrainzUserId: mbUserJSON.metabrainz_user_id})
		.fetch({require: true});
}

function _updateCachedMBName(bbUserModel, mbUserJSON) {
	return bbUserModel.save({cachedMetabrainzName: mbUserJSON.sub});
}

export function init(app) {
	const {orm} = app.locals;
	try {
		let strategy;
		// eslint-disable-next-line no-process-env
		if (process.env.NODE_ENV === 'test') {
			strategy = new StrategyMock({userId: 123456},
				async (user, done) => {
					try {
						const linkedUser = await new orm.Editor({id: user.id})
							.fetch({require: true});

						// Logged in, associate
						return done(null, linkedUser.toJSON());
					}
					catch (err) {
						return done(err, false);
					}
				});
		}
		else {
			strategy = new MusicBrainzOAuth.Strategy(
				_.assign(
					{
						passReqToCallback: true,
						scope: 'profile'
					}, config.musicbrainz
				),
				async (req, accessToken, refreshToken, profile, done) => {
					try {
						if (req.user) {
							const linkedUser =
								await _linkMBAccount(orm, req.user, profile);

							// Logged in, associate
							return done(null, linkedUser.toJSON());
						}

						// Not logged in, authenticate
						const fetchedUser = await _getAccountByMBUserId(orm, profile);

						await _updateCachedMBName(fetchedUser, profile);

						return done(null, fetchedUser.toJSON());
					}
					catch (err) {
						return done(null, false, profile);
					}
				}
			);
		}
		passport.use(strategy);

		passport.serializeUser((user, done) => {
			done(null, user);
		});

		passport.deserializeUser((user, done) => {
			done(null, user);
		});

		app.use(passport.initialize());
		app.use(passport.session());
		return true;
	}
	catch (strategyError) {
		log.error('Error setting up OAuth strategy %s. You will not be able to log in', strategyError.message);
		return null;
	}
}

export function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	req.session.redirectTo = req.originalUrl;

	return res.redirect(status.SEE_OTHER, '/auth');
}

export function isAuthenticatedForHandler(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	return error.sendErrorAsJSON(res, new error.NotAuthenticatedError());
}
