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

var express = require('express');
var router = express.Router();
var config = require('../helpers/config');
var auth = require('../helpers/auth');

var bbws = require('../helpers/bbws');

var request = require('superagent');
require('superagent-bluebird-promise');

router.get('/send', auth.isAuthenticated, function(req, res) {
	res.render('editor/messageForm', {
		error: req.query.error,
		recipients: req.query.recipients,
		subject: req.query.subject,
		content: req.query.content
	});
});

function renderMessageList(view, req, res) {
	bbws.get('/message/' + view + '/', {
			accessToken: req.session.bearerToken
		})
		.then(function fetchMessageList(list) {
			res.render('editor/messageList', {
				view: view,
				messages: list
			});
		});
}

router.get('/inbox', auth.isAuthenticated, function(req, res) {
	renderMessageList('inbox', req, res);
});

router.get('/archive', auth.isAuthenticated, function(req, res) {
	renderMessageList('archive', req, res);
});

router.get('/sent', auth.isAuthenticated, function(req, res) {
	renderMessageList('sent', req, res);
});

router.get('/:id', auth.isAuthenticated, function(req, res) {
	var ws = config.site.webservice;
	request.get(ws + '/message/' + req.params.id)
		.set('Authorization', 'Bearer ' + req.session.bearerToken).promise()
		.then(function(messageResponse) {
			return messageResponse.body;
		})
		.then(function(message) {
			res.render('editor/message', {
				message: message
			});
		});
});

router.post('/send/handler', auth.isAuthenticated, function(req, res) {
	// This function should post a new message to the /message/send endpoint of the ws.
	var ws = config.site.webservice;

	// Parse recipient ids
	var recipientIds = req.body.recipients.split(',').map(function(substr) {
		return parseInt(substr);
	});

	request.post(ws + '/message/sent/')
		.set('Authorization', 'Bearer ' + req.session.bearerToken)
		.send({
			recipient_ids: recipientIds,
			subject: req.body.subject,
			content: req.body.content
		}).promise()
		.then(function() {
			res.redirect(303, '/message/sent');
		});
});

module.exports = router;
