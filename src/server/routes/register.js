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

const Editor = require('bookbrainz-data').Editor;
const EditorType = require('bookbrainz-data').EditorType;
const status = require('http-status');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const RegisterPage = React.createFactory(
	require('../../client/components/forms/registration.jsx')
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

	EditorType.forge({label: 'Editor'})
		.fetch({require: true})
		.then((editorType) =>
			Editor.forge({
				name: req.body.username,
				email: req.body.email,
				password: req.body.password,
				typeId: editorType.id
			})
				.save()
		)
		.then(() => {
			res.redirect(status.SEE_OTHER, '/');
		})
		.catch(next);
});

module.exports = router;
