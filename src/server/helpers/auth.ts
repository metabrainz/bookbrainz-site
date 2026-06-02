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

import * as error from '../../common/helpers/error';

import OAuth2Strategy from 'passport-oauth2';
import type {ORM} from 'bookbrainz-data';
import {PrivilegeType} from '../../common/helpers/privileges-utils';
import StrategyMock from './mock-passport-strategy';
import _ from 'lodash';
import config from '../../common/helpers/config';
import log from 'log';
import passport from 'passport';
import request from 'superagent';
import status from 'http-status';


declare module 'express-serve-static-core' {
	interface Request {
		user: any;
	}
}

class MetaBrainzOAuth2Strategy extends OAuth2Strategy {
	userProfile(accessToken:string, done:OAuth2Strategy.VerifyCallback) {
		const {oAuthBaseURL} = config.musicbrainz;
		const introspectUrl = `${oAuthBaseURL}/introspect`;

		request
			.post(introspectUrl.toString())
			.type('form')
			.send({
				/* eslint-disable camelcase */
				client_id: config.musicbrainz.clientID,
				client_secret: config.musicbrainz.clientSecret,
				token: accessToken,
				token_type_hint: 'access_token'
				/* eslint-enable camelcase */
			})
			.then((response) => {
				if (!response?.body?.active) {
					return done(new Error('Access token is not active'));
				}
				return done(null, response.body);
			})
			.catch((err) => {
				if (err.status) {
					return done(new Error(`Introspection request failed with status ${err.status}`));
				}

				return done(err);
			});
	}
}

async function _linkMBAccount(orm:ORM, bbUserJSON, mbUserJSON) {
	const {Editor} = orm;
	const fetchedEditor = await new Editor({id: bbUserJSON.id})
		.fetch({require: true});

	return fetchedEditor.save({
		cachedMetabrainzName: mbUserJSON.sub,
		metabrainzUserId: mbUserJSON.metabrainz_user_id
	});
}

function _getAccountByMBUserId(orm:ORM, mbUserJSON) {
	const {Editor} = orm;
	return new Editor({metabrainzUserId: mbUserJSON.metabrainz_user_id})
		.fetch({require: true});
}

function _updateMetaBrainzUser(bbUserModel, mbUserJSON) {
	return bbUserModel.save({
		cachedMetabrainzName: mbUserJSON.sub,
	});
}

export function init(app) {
	const {orm} = app.locals as {orm: ORM};
	try {
		let strategy;
		// eslint-disable-next-line node/no-process-env
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
			const {oAuthBaseURL} = config.musicbrainz;
			const {clientID, clientSecret, callbackURL} = config.musicbrainz;

			const options:OAuth2Strategy.StrategyOptionsWithRequest = {
				authorizationURL: `${oAuthBaseURL}/authorize`,
				callbackURL,
				clientID,
				clientSecret,
				passReqToCallback: true,
				scope: 'profile',
				tokenURL: `${oAuthBaseURL}/token`
			};
			strategy = new MetaBrainzOAuth2Strategy(
				options,
				async (req: any, accessToken:string, refreshToken:string, profile, done:OAuth2Strategy.VerifyCallback) => {
					try {
						if (req.user) {
							const linkedUser =
								await _linkMBAccount(orm, req.user, profile);

							// Logged in, associate
							return done(null, linkedUser.toJSON());
						}

						// Not logged in, authenticate
						const fetchedUser = await _getAccountByMBUserId(orm, profile);
						const updated = await _updateMetaBrainzUser(fetchedUser, profile);
						return done(null, fetchedUser.toJSON());
					}
					catch (err) {
						return done(err, false, profile);
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

export function isCollectionOwner(req, res, next) {
	if (req.user.id === res.locals.collection.ownerId) {
		return next();
	}

	throw new error.PermissionDeniedError(
		'You do not have permission to edit/delete this collection', req
	);
}

export function isCollectionOwnerOrCollaborator(req, res, next) {
	const {collection} = res.locals;
	if (req.user.id === collection.ownerId ||
		collection.collaborators.filter(collaborator => collaborator.id === req.user.id).length) {
		return next();
	}

	throw new error.PermissionDeniedError(
		'You do not have permission to edit this collection', req
	);
}

export function isAuthenticatedForCollectionView(req, res, next) {
	const {collection} = res.locals;
	if (collection.public) {
		return next();
	}
	if (req.user) {
		return isCollectionOwnerOrCollaborator(req, res, next);
	}
	throw new error.PermissionDeniedError(
		'You do not have permission to view this collection', req
	);
}

export function isAuthorized(priv: PrivilegeType) {
	return async (req, res, next) => {
		try {
			const {Editor} = req.app.locals.orm;
			const editor = await Editor.query({where: {id: req.user.id}})
				.fetch({require: true});
			/* eslint-disable no-bitwise */
			if (editor.get('privs') & priv) {
				return next();
			}
			throw new error.NotAuthorizedError(
				'You do not have the privilege to access this route', req
			);
		}
		catch (err) {
			return next(err);
		}
	};
}
