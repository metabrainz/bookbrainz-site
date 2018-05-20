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

import _ from 'lodash';
import express from 'express';
import passport from 'passport';
import request from 'superagent';
import status from 'http-status';


const router = express.Router();

router.get('/auth', passport.authenticate('musicbrainz-oauth2'));

router.get('/cb', (req, res, next) => {
	passport.authenticate('musicbrainz-oauth2', (authErr, user, info) => {
		if (authErr) {
			return next(authErr);
		}

		if (!user) {
			// Set profile in session, and continue to registration
			req.session.mbProfile = info;
			return res.redirect('/register/details');
		}

		return req.logIn(user, (loginErr) => {
			if (loginErr) {
				return next(loginErr);
			}

			const redirectTo =
				req.session.redirectTo ? req.session.redirectTo : '/';
			req.session.redirectTo = null;
			return res.redirect(redirectTo);
		});
	})(req, res, next);
});

router.get('/logout', (req, res) => {
	req.logOut();
	res.redirect(status.SEE_OTHER, '/');
});

async function deleteUserAndGetResCode(orm, metabrainzUserID, accessToken) {
	if (!_.isString(accessToken)) {
		return status.BAD_REQUEST;
	}

	const USER_INFO_URL = 'https://musicbrainz.org/oauth2/userinfo';
	const CORRECT_MUSICBRAINZ_USER = 'UserDeleter';
	const CORRECT_METABRAINZ_USER_ID = 2007538;

	// First, query MusicBrainz to check that the accessToken is valid
	const deleteAuthorizationGranted = await request.get(USER_INFO_URL)
		.set('Authorization', `Bearer ${accessToken}`)
		.then(
			(res) =>
				res.ok &&
				res.body.sub === CORRECT_MUSICBRAINZ_USER &&
				res.body.metabrainz_user_id === CORRECT_METABRAINZ_USER_ID
		)
		.catch(
			// Any kind of error -> handle by saying that authorization is not
			// granted.
			() => false
		);

	// If not valid, return a 400 response.
	if (!deleteAuthorizationGranted) {
		// Return an error status code - not able to get authorization
		return status.BAD_REQUEST;
	}

	// Try to delete the user
	const deleteUserByMetaBrainzID =
		orm.func.user.deleteUserByMetaBrainzID(orm.knex);

	let success = false;
	try {
		success = await deleteUserByMetaBrainzID(metabrainzUserID);
	}
	catch (err) {
		// Any kind of uncaught error here, give an ISE
		return status.INTERNAL_SERVER_ERROR;
	}

	if (success) {
		// If the user could be deleted, return a 200 response.
		return status.OK;
	}

	// Otherwise, the user was not found, return a 404 response.
	return status.NOT_FOUND;
}

router.get('/delete-user/:metabrainzUserID', (req, res) => {
	const {metabrainzUserID} = req.params;
	const accessToken = req.query.access_token;

	return deleteUserAndGetResCode(
		req.app.locals.orm, metabrainzUserID, accessToken
	)
		.then((statusCode) => {
			res.sendStatus(statusCode);
		});
});

export default router;
