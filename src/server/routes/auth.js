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

import config from '../../../superagent-mock-config';
import express from 'express';
import mock from 'superagent-mock';
import passport from 'passport';
import request from 'superagent';
import status from 'http-status';


// Setting up mocking agent for test
// eslint-disable-next-line node/no-process-env
if (process.env.NODE_ENV === 'test') {
	mock(request, config);
}


const router = express.Router();

// eslint-disable-next-line node/no-process-env
const authenticationStrategy = process.env.NODE_ENV === 'test' ? 'mock' : 'musicbrainz-oauth2';

router.get('/auth', passport.authenticate(authenticationStrategy));

router.get('/cb', (req, res, next) => {
	passport.authenticate(authenticationStrategy, (authErr, user, info) => {
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

router.post('/delete-user/:uname', async (req, res) => {
	// Special Account on MB
	const USER_DELETER = 'UserDeleter';
	const USER_DELETER_MBID = 2007538;
	const {access_token: accessToken} = req.query;
	const {uname} = req.params;
	try {
		const rBody = await request.get('https://musicbrainz.org/oauth2/userinfo').set('Authorization', `Bearer ${accessToken}`).then((rs) => rs.body);
		if (rBody.metabrainz_user_id !== USER_DELETER_MBID || rBody.sub !== USER_DELETER) {
			return res.status(401).send();
		}
		const {orm} = req.app.locals;
		const {Editor} = orm;
		const editor = await Editor.forge({name: uname}).fetch({require: false});
		if (!editor) {
			return res.status(404).send();
		}
		// deleting all user info
		const deletedUser = `Deleted User#${editor.get('id')}`;
		editor.set('bio', '');
		editor.set('gender_id', null);
		editor.set('area_id', null);
		editor.set('revisions_applied', 0);
		editor.set('revisions_reverted', 0);
		editor.set('total_revisions', 0);
		editor.set('metabrainz_user_id', null);
		editor.set('cached_metabrainz_name', null);
		editor.set('title_unlock_id', null);


		editor.set('name', deletedUser);
		await editor.save();
		// eslint-disable-next-line camelcase
		return res.send({metabrainz_user_id: USER_DELETER_MBID, sub: USER_DELETER});
	}
	catch (err) {
		return res.status(err.status ?? 500).send();
	}
});


export default router;
