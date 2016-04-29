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

const Promise = require('bluebird');

const express = require('express');
const router = express.Router();

const Editor = require('bookbrainz-data').Editor;
const EditorType = require('bookbrainz-data').EditorType;
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const error = require('../helpers/error');

const FormSubmissionError = require('../helpers/error').FormSubmissionError;

const RegisterPage = React.createFactory(
	require('../../client/components/forms/registration.jsx')
);

router.get('/', (req, res) =>
	res.render('register', {
		title: 'Register',
		markup: ReactDOMServer.renderToString(RegisterPage())
	})
);

router.post('/handler', (req, res) => {
	new Promise((resolve) => {
		if (!req.body.password) {
			throw new FormSubmissionError('No password set');
		}

		if (req.body.password !== req.body.passwordRepeat) {
			throw new FormSubmissionError('Passwords do not match');
		}

		resolve();
	})
		.then(() =>
			// Fetch the default EditorType from the database
			EditorType.forge({label: 'Editor'})
				.fetch({require: true})
		)
		.then((editorType) =>
			// Create a new Editor and add to the database
			new Editor({
				name: req.body.username,
				email: req.body.email,
				password: req.body.password,
				typeId: editorType.id
			})
			.save()
		)
		.then((editor) =>
			res.send(editor.toJSON())
		)
		.catch((err) => error.sendErrorAsJSON(res, err));
});

module.exports = router;
