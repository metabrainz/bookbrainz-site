/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
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
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const User = require('../data/user');
const bbws = require('../helpers/bbws');
const auth = require('../helpers/auth');
const Promise = require('bluebird');
const status = require('http-status');

const NotFoundError = require('../helpers/error').NotFoundError;
const ProfileForm = React.createFactory(
	require('../../client/components/forms/profile.jsx')
);

router.get('/edit', auth.isAuthenticated, (req, res, next) => {
	User.getCurrent(req.session.bearerToken)
		.then((user) => {
			const props = {
				id: user.id,
				bio: user.bio
			};

			const markup = ReactDOMServer.renderToString(ProfileForm(props));

			res.render('editor/edit', {props, markup});
		})
		.catch(() => {
			next(new Error('An internal error occurred while loading profile'));
		});
});

router.post('/edit/handler', auth.isAuthenticated, (req, res) => {
	// Should handle errors in some fashion other than redirecting.
	if (req.body.id !== req.user.id) {
		req.session.error = 'You do not have permission to edit that user';
		res.redirect(status.SEE_OTHER, '/editor/edit');
	}

	bbws.put(
		`/user/${req.body.id}/`,
		{bio: req.body.bio},
		{accessToken: req.session.bearerToken}
	)
		.then((response) => {
			res.send(response);
		})
		.catch(() => {
			req.session.error =
				'An internal error occurred while modifying profile';
			res.redirect(status.SEE_OTHER, '/editor/edit');
		});
});

router.get('/:id', (req, res, next) => {
	let userPromise = null;

	const requestedId = parseInt(req.params.id, 10);
	if (req.user && requestedId === req.user.id) {
		userPromise = User.getCurrent(req.session.bearerToken);
	}
	else {
		userPromise = User.findOne(requestedId);
	}

	userPromise
		.then((editor) => {
			res.render('editor/editor', {editor});
		})
		.catch((err) => {
			console.log(err.stack);
			next(new NotFoundError('Editor not found'));
		});
});

router.get('/:id/revisions', (req, res, next) => {
	const userPromise = User.findOne(req.params.id);
	const revisionsPromise = bbws.get(`/user/${req.params.id}/revisions`);

	Promise.join(userPromise, revisionsPromise, (editor, revisions) => {
		res.render('editor/revisions', {editor, revisions});
	})
		.catch((err) => {
			console.log(err.stack);
			next(new NotFoundError('Editor not found'));
		});
});

module.exports = router;
