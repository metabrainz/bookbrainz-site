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

'use strict';

const express = require('express');
const router = express.Router();
const status = require('http-status');
const auth = require('../helpers/auth');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const LoginPage = React.createFactory(
	require('../../client/components/pages/login.jsx')
);

router.get('/login', (req, res) => {
	res.render('page', {
		title: 'Log in',
		error: req.query.error,
		markup: ReactDOMServer.renderToString(LoginPage())
	});
});

router.get('/logout', (req, res) => {
	delete req.session.bearerToken;
	req.logout();
	res.redirect(status.SEE_OTHER, '/');
});

router.post('/login/handler', auth.authenticate(), (req, res) => {
	const redirect = req.session.redirectTo ? req.session.redirectTo : '/';
	delete req.session.redirectTo;

	res.redirect(status.SEE_OTHER, redirect);
}, (err, req, res) => {
	// If an error occurs during login, send the user back.
	res.redirect(status.MOVED_PERMANENTLY, `/login?error=${err.message}`);
});

module.exports = router;
