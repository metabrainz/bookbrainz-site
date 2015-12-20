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
const User = require('../data/user');
const UserType = require('../data/properties/user-type');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const RegisterPage = React.createFactory(
	require('../../client/components/pages/register.jsx')
);

router.get('/', (req, res) => {
	let error;

	if (req.session) {
		error = req.session.error;
		delete req.session.error;
	}

	res.render('page', {
		error,
		title: 'Register',
		markup: ReactDOMServer.renderToString(RegisterPage())
	});
});

router.post('/handler', (req, res, next) => {
	if (!req.body.password) {
		req.session.error = 'No password set';
		res.redirect(status.SEE_OTHER, '/register');

		return;
	}

	if (req.body.password !== req.body.password2) {
		req.session.error = 'Passwords did not match';
		res.redirect(status.SEE_OTHER, '/register');

		return;
	}

	// This function should post a new user to the /user endpoint of the ws.
	UserType.find()
		.then((results) => {
			let editorType = null;

			const hasEditorType = !results.every((userType) => {
				if (userType.label === 'Editor') {
					editorType = userType;
					return false;
				}

				return true;
			});

			if (!hasEditorType) {
				throw new Error('Editor user type not found');
			}

			return User.create({
				name: req.body.username,
				email: req.body.email,
				password: req.body.password,
				user_type: {
					user_type_id: editorType.id
				}
			});
		})
		.then(() => {
			res.redirect(status.SEE_OTHER, '/');
		})
		.catch(next);
});

module.exports = router;
