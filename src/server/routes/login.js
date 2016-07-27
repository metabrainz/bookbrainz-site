/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
 *               2015       Annie Zhou
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

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const express = require('express');
const passport = require('passport');
const status = require('http-status');

const handler = require('../helpers/handler');

const AuthenticationFailedError =
	require('../helpers/error').AuthenticationFailedError;

const LoginPage = React.createFactory(
	require('../../client/components/forms/login.jsx')
);

const router = express.Router();

router.get('/login', (req, res) => {
	// Check whether the user is logged in - if so, redirect to profile page
	if (req.user) {
		return res.redirect(`/editor/${req.user.id}`);
	}

	return res.render('login', {
		title: 'Log In',
		markup: ReactDOMServer.renderToString(LoginPage())
	});
});

router.get('/logout', (req, res) => {
	req.logOut();
	res.redirect(status.SEE_OTHER, '/');
});

router.post('/login/handler', (req, res, next) => {
	passport.authenticate('local', (authErr, user) => {
		const authPromise = new Promise((resolve, reject) => {
			if (authErr) {
				reject(authErr);
			}

			// If the user is not set by the passport strategy, authentication
			// failed
			if (!user) {
				throw new AuthenticationFailedError(
					'Invalid username or password'
				);
			}

			req.logIn(user, (loginErr) => {
				// If `loginErr` is set, serialization of the user failed
				if (loginErr) {
					reject(loginErr);
				}

				resolve();
			});
		})
			.then(() => {
				const redirectTo =
					req.session.redirectTo ? req.session.redirectTo : '/';

				delete req.session.redirectTo;

				return {
					redirectTo
				};
			});

		handler.sendPromiseResult(res, authPromise);
	})(req, res, next);
});

module.exports = router;
