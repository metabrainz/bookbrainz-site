/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
 *               2015  Leo Verto
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
const config = require('../helpers/config');
const auth = require('../helpers/auth');
const status = require('http-status');

const bbws = require('../helpers/bbws');

const request = require('superagent');
require('superagent-bluebird-promise');

router.get('/send', auth.isAuthenticated, (req, res) => {
	res.render('editor/messageForm', {
		error: req.query.error,
		recipients: req.query.recipients,
		subject: req.query.subject,
		content: req.query.content
	});
});

function renderMessageList(view, req, res) {
	bbws.get(`/message/${view}/`, {
		accessToken: req.session.bearerToken
	})
		.then((messages) => {
			res.render('editor/messageList', {view, messages});
		});
}

router.get('/inbox', auth.isAuthenticated, (req, res) => {
	renderMessageList('inbox', req, res);
});

router.get('/archive', auth.isAuthenticated, (req, res) => {
	renderMessageList('archive', req, res);
});

router.get('/sent', auth.isAuthenticated, (req, res) => {
	renderMessageList('sent', req, res);
});

router.get('/:id', auth.isAuthenticated, (req, res) => {
	const ws = config.site.webservice;
	request.get(`${ws}/message/${req.params.id}`)
		.set('Authorization', `Bearer ${req.session.bearerToken}`).promise()
		.then((messageResponse) => messageResponse.body)
		.then((message) => {
			res.render('editor/message', {message});
		});
});

router.post('/send/handler', auth.isAuthenticated, (req, res) => {
	// This function should post a new message to the /message/send endpoint
	// of the ws.
	const ws = config.site.webservice;

	// Parse recipient ids
	const recipientIds = req.body.recipients.split(',').map(
		(recipientId) => parseInt(recipientId, 10)
	);

	request.post(`${ws}/message/sent/`)
		.set('Authorization', `Bearer ${req.session.bearerToken}`)
		.send({
			recipient_ids: recipientIds,
			subject: req.body.subject,
			content: req.body.content
		}).promise()
		.then(() => {
			res.redirect(status.SEE_OTHER, '/message/sent');
		});
});

module.exports = router;
