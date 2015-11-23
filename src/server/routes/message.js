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
const auth = require('../helpers/auth');
const Promise = require('bluebird');
const _ = require('underscore');
const status = require('http-status');

const Message = require('bookbrainz-data').Message;
const MessageReceipt = require('bookbrainz-data').MessageReceipt;

const NotFoundError = require('../helpers/error').NotFoundError;

router.get('/send', auth.isAuthenticated, (req, res) => {
	res.render('editor/messageForm', {
		error: req.query.error,
		recipients: req.query.recipients,
		subject: req.query.subject,
		content: req.query.content
	});
});

function renderMessageList(view, collectionJSON, res) {
	res.render('editor/messageList', {
		view,
		messages: {
			objects: collectionJSON
		}
	});
}

router.get('/inbox', auth.isAuthenticated, (req, res) => {
	new MessageReceipt().where({recipient_id: req.user.id, archived: false})
		.fetchAll({withRelated: ['message', 'message.sender']})
		.then((collection) => {
			renderMessageList('inbox', _.pluck(collection.toJSON(), 'message'),
				res);
		});
});

router.get('/archive', auth.isAuthenticated, (req, res) => {
	new MessageReceipt().where({recipient_id: req.user.id, archived: true})
		.fetchAll({withRelated: ['message', 'message.sender']})
		.then((collection) => {
			renderMessageList('archive',
				_.pluck(collection.toJSON(), 'message'), res);
		});
});

router.get('/sent', auth.isAuthenticated, (req, res) => {
	new Message().where({sender_id: req.user.id})
		.fetchAll({withRelated: ['sender']})
		.then((collection) => {
			renderMessageList('sent', collection.toJSON(), res);
		});
});

router.get('/:id', auth.isAuthenticated, (req, res, next) => {
	new Message({id: parseInt(req.params.id, 10)})
		.fetch({
			require: true,
			withRelated: [
				'sender',
				{
					receipts(query) {
						query.where('recipient_id', req.user.id);
					}
				}
			]
		})
		.then((message) => {
			if (message.related('receipts').length <= 0) {
				return next(new Error(
					'You do not have permission to view this message'
				));
			}

			res.render('editor/message', {message: message.toJSON()});
		})
		.catch(Message.NotFoundError, () => {
			next(new NotFoundError('Message not found'));
		})
		.catch((err) => {
			const internalError =
				new Error('An internal error occurred while fetching message');
			internalError.stack = err.stack;

			next(internalError);
		});
});

router.post('/send/handler', auth.isAuthenticated, (req, res) => {
	// Parse recipient ids
	const recipientIds = req.body.recipients.split(',').map(
		(recipientId) => parseInt(recipientId, 10)
	);

	// Create new message
	const messageStored = new Message({
		senderId: req.user.id,
		subject: req.body.subject,
		content: req.body.content
	}).save()
		.then((message) => Promise.all(
			recipientIds.map((recipientId) =>
				new MessageReceipt({
					recipientId,
					messageId: message.get('id')
				}).save()
			)
		));

	messageStored.then(() => {
		res.redirect(status.SEE_OTHER, '/message/sent');
	});
});

module.exports = router;
