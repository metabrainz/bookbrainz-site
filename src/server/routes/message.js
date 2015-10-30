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

var express = require('express');
var router = express.Router();
var Message = require('bookbrainz-data').Message;
var MessageReceipt = require('bookbrainz-data').MessageReceipt;
var config = require('../helpers/config');
var auth = require('../helpers/auth');
var Promise = require('bluebird');
var _ = require('underscore');

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

function renderMessageList(view, collectionJSON, res) {
	res.render('editor/messageList', {
		view: view,
		messages: {
			objects: collectionJSON
		}
	});
}

router.get('/inbox', auth.isAuthenticated, function(req, res) {
	new MessageReceipt().where({recipient_id: req.user.id, archived: false})
	.fetchAll({withRelated: ['message', 'message.sender']})
	.then(function renderInbox(collection) {
		renderMessageList('inbox', _.pluck(collection.toJSON(), 'message'), res);
	});
});

router.get('/archive', auth.isAuthenticated, function(req, res) {
	new MessageReceipt().where({recipient_id: req.user.id, archived: true})
	.fetchAll({withRelated: ['message', 'message.sender']})
	.then(function renderInbox(collection) {
		renderMessageList('archive', _.pluck(collection.toJSON(), 'message'), res);
	});
});

router.get('/sent', auth.isAuthenticated, function(req, res) {
	new Message().where({sender_id: req.user.id})
	.fetchAll({withRelated: ['sender']})
	.then(function renderInbox(collection) {
		renderMessageList('sent', collection.toJSON(), res);
	});
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
	// Parse recipient ids
	var recipientIds = req.body.recipients.split(',').map(parseInt);

	// Create new message
	var messageStored = new Message({
		senderId: req.user.id, subject: req.body.subject, content: req.body.content
	}).save()
	.then(function addRecipients(message) {
		return Promise.all(
			recipientIds.map(function addRecipient(recipientId) {
				return new MessageReceipt({
					recipientId: recipientId, messageId: message.get('id')
				}).save();
			})
		);
	});

	messageStored.then(function redirect() {
		res.redirect(303, '/message/sent');
	});
});

module.exports = router;
