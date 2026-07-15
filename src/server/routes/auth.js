/*
 * Copyright (C) 2016       Ben Ockmore
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

import {
	clearPendingRegistrationRequest,
	exchangeRegistrationRequestCode,
	fetchUserInfo,
	getRegistrationRequestErrorMessage,
	isPendingRegistrationRequestExpired,
	isRegistrationRequestCallback
} from '../helpers/metabrainz-registration';
import express from 'express';
import log from 'log';
import passport from 'passport';
import status from 'http-status';
import {updateMetaBrainzUser} from '../helpers/auth';


const router = express.Router();

// eslint-disable-next-line node/no-process-env
const authenticationStrategy = process.env.NODE_ENV === 'test' ? 'mock' : 'oauth2';

router.get('/auth', passport.authenticate(authenticationStrategy));

function logInUser(req, res, next, user) {
	const redirectTo =
		req.session.redirectTo ? req.session.redirectTo : '/';
	req.session.redirectTo = null;

	return req.logIn(user, async (loginErr) => {
		if (loginErr) {
			return next(loginErr);
		}

		const {Editor} = req.app.locals.orm;
		// lastLoginDate is current login date with time in ISO format
		const lastLoginDate = new Date().toISOString();
		// Query for update activeAt with current login timestamp
		try {
			await Editor.where({id: req.user.id}).save({activeAt: lastLoginDate}, {patch: true});
		}
		catch (error) {
			return next(error);
		}

		return res.redirect(redirectTo);
	});
}

async function handleRegistrationRequestCallback(req, res, next) {
	if (isPendingRegistrationRequestExpired(req.session.metabrainzRegistrationRequest)) {
		clearPendingRegistrationRequest(req);
		req.session.registrationRequestError =
			'The MetaBrainz registration request expired. Please try again.';
		return res.redirect(status.SEE_OTHER, '/register');
	}

	if (!req.query.code) {
		clearPendingRegistrationRequest(req);
		req.session.registrationRequestError =
			'MetaBrainz did not return an authorization code. Please try again.';
		return res.redirect(status.SEE_OTHER, '/register');
	}

	try {
		const tokenResponse = await exchangeRegistrationRequestCode(req);
		const userInfo = await fetchUserInfo(tokenResponse.access_token);
		const metabrainzUserId = parseInt(userInfo.sub, 10);
		if (!Number.isInteger(metabrainzUserId) || metabrainzUserId < 0) {
			throw new Error('MetaBrainz UserInfo did not include a valid user id');
		}

		const mbProfile = {
			...userInfo,
			metabrainzOauthAccessToken: tokenResponse.access_token,
			metabrainzOauthRefreshToken: tokenResponse.refresh_token,
			// eslint-disable-next-line camelcase
			metabrainz_user_id: metabrainzUserId
		};
		const {orm} = req.app.locals;
		const updatedUser = await updateMetaBrainzUser(orm, req.user, mbProfile);

		clearPendingRegistrationRequest(req);
		if (!updatedUser) {
			req.session.mbProfile = mbProfile;
			return res.redirect('/register/details');
		}

		return logInUser(req, res, next, updatedUser.toJSON());
	}
	catch (err) {
		clearPendingRegistrationRequest(req);
		log.error('MetaBrainz registration callback failed', err?.response?.body || err);
		req.session.registrationRequestError =
			getRegistrationRequestErrorMessage(err);
		return res.redirect(status.SEE_OTHER, '/register');
	}
}

router.get('/cb', (req, res, next) => {
	if (isRegistrationRequestCallback(req)) {
		return handleRegistrationRequestCallback(req, res, next);
	}

	return passport.authenticate(authenticationStrategy, (authErr, user, info) => {
		if (authErr) {
			res.locals.alerts.push({
				level: 'danger',
				message: `We encountered an error while trying to sign in: ${authErr}`
			});
			return next(authErr);
		}

		if (!user) {
			// Set profile in session, and continue to registration
			req.session.mbProfile = info;
			return res.redirect('/register/details');
		}

		return logInUser(req, res, next, user);
	})(req, res, next);
});

router.get('/logout', (req, res) => {
	req.logOut(() => {
		res.redirect(status.SEE_OTHER, '/');
	});
});

export default router;
