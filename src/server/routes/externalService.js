/*
 * Copyright (C) 2022       Ansh Goyal
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


import * as auth from '../helpers/auth';
import * as cbHelper from '../helpers/critiquebrainz';
import {AuthenticationFailedError, BadRequestError} from '../../common/helpers/error';
import express from 'express';
import url from 'url';


const marginTime = 5 * 60 * 1000;
const router = express.Router();


router.get('/critiquebrainz/callback', auth.isAuthenticated, async (req, res, next) => {
	const {orm} = req.app.locals;
	const {code} = req.query;
	const editorId = req.user.id;
	if (!code) {
		return next(new BadRequestError('Response type must be code'));
	}
	const token = await cbHelper.fetchAccessToken(code, editorId, orm);

	let alertType = 'success';
	let alertDetails = 'You have successfully linked your account with CritiqueBrainz.';
	if (!token) {
		alertType = 'danger';
		alertDetails = 'Failed to connect to CritiqueBrainz';
	}
	return res.redirect(
		url.format({
			pathname: '/external-service',
			query: {
				alertDetails,
				alertType
			}
		})
	);
});


router.post('/critiquebrainz/refresh', auth.isAuthenticatedForHandler, async (req, res, next) => {
	const editorId = req.user.id;
	const {orm} = req.app.locals;
	let token = await orm.func.externalServiceOauth.getOauthToken(
		editorId,
		'critiquebrainz',
		orm
	);

	if (!token) {
		return next(new AuthenticationFailedError('User has not authenticated to CritiqueBrainz'));
	}
	const tokenExpired = new Date(token.token_expires).getTime() <= new Date(new Date().getTime() + marginTime).getTime();
	if (tokenExpired) {
		try {
			token = await cbHelper.refreshAccessToken(editorId, token.refresh_token, orm);
		}
		catch (error) {
			return res.json({error: error.message});
		}
	}
	return res.json({accessToken: token?.access_token});
});


router.post('/critiquebrainz/connect', auth.isAuthenticatedForHandler, async (req, res) => {
	const editorId = req.user.id;
	const {orm} = req.app.locals;

	// First we check if the user has already connected to CritiqueBrainz
	// If so, we first delete the existing tokens and then try to connect again.

	const token = await orm.func.externalServiceOauth.getOauthToken(
		editorId,
		'critiquebrainz',
		orm
	);
	if (token?.length) {
		await orm.func.externalServiceOauth.deleteOauthToken(
			editorId,
			'critiquebrainz',
			orm
		);
	}
	const redirectUrl = cbHelper.getAuthURL();

	return res.send(redirectUrl);
});


router.post('/critiquebrainz/disconnect', auth.isAuthenticatedForHandler, async (req, res) => {
	const editorId = req.user.id;
	const {orm} = req.app.locals;

	let alertType = 'success';
	let alertDetails = 'You have successfully disconnected your account with CritiqueBrainz.';
	try {
		await orm.func.externalServiceOauth.deleteOauthToken(
			editorId,
			'critiquebrainz',
			orm
		);
	}
	catch {
		alertType = 'danger';
		alertDetails = 'Failed to disconnect from CritiqueBrainz';
	}

	res.send({alertDetails, alertType});
});

export default router;
