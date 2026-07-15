/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
 *               2015  Annie Zhou
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

import * as propHelpers from '../../client/helpers/props';
import {
	clearPendingRegistrationRequest,
	createRegistrationRequest,
	getRegistrationRequestErrorMessage
} from '../helpers/metabrainz-registration';
import Layout from '../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import RegisterAuthPage from '../../client/components/pages/registration-auth';
import _ from 'lodash';
import express from 'express';
import {generateProps} from '../helpers/props';
import log from 'log';
import status from 'http-status';
import target from '../templates/target';
import validator from 'validator';


const router = express.Router();

router.get('/', (req, res) => {
	// Check whether the user is logged in - if so, redirect to profile page
	if (req.user) {
		return res.redirect(`/editor/${req.user.id}`);
	}

	const {registrationRequestError} = req.session;
	const registrationRequestValues = req.session.registrationRequestValues || {};
	req.session.registrationRequestError = null;
	req.session.registrationRequestValues = null;

	const props = generateProps(req, res, {
		email: registrationRequestValues.email,
		error: registrationRequestError,
		signUpDisabled: req.signUpDisabled,
		username: registrationRequestValues.username
	});

	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<RegisterAuthPage
				email={props.email}
				error={props.error}
				signUpDisabled={props.signUpDisabled}
				username={props.username}
			/>
		</Layout>
	);

	return res.send(target({markup, title: 'Register'}));
});

router.post('/metabrainz-request', async (req, res) => {
	const username = _.trim(req.body.username);
	const email = _.trim(req.body.email);

	req.session.registrationRequestValues = {email, username};

	if (!username) {
		req.session.registrationRequestError = 'Please enter a MetaBrainz username.';
		return res.redirect(status.SEE_OTHER, '/register');
	}

	if (!validator.isEmail(email)) {
		req.session.registrationRequestError = 'Please enter a valid email address.';
		return res.redirect(status.SEE_OTHER, '/register');
	}

	try {
		const responseBody = await createRegistrationRequest(req, username, email);
		if (!responseBody?.redirect_to) {
			clearPendingRegistrationRequest(req);
			req.session.registrationRequestError =
				'MetaBrainz did not return a registration redirect. Please try again.';
			return res.redirect(status.SEE_OTHER, '/register');
		}

		req.session.registrationRequestValues = null;
		return res.redirect(status.SEE_OTHER, responseBody.redirect_to);
	}
	catch (err) {
		clearPendingRegistrationRequest(req);
		log.error('MetaBrainz registration request failed', err?.response?.body || err);
		req.session.registrationRequestError =
			getRegistrationRequestErrorMessage(err);
		return res.redirect(status.SEE_OTHER, '/register');
	}
});

export default router;
