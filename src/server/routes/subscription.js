/*
 * Copyright (C) 2021 Prabal Singh
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
import {map, snakeCase} from 'lodash';
import express from 'express';
import {isAuthenticated} from '../helpers/auth';
import log from 'log';
import {sendPromiseResult} from '../helpers/handler';


const router = express.Router();

const allowedTypes = ['collection', 'author', 'editionGroup', 'edition', 'publisher', 'work', 'series'];
function getTypeSubscription(type, orm) {
	let TypeSubscription;
	let idKey;
	if (type === 'collection') {
		idKey = 'collectionId';
		TypeSubscription = orm.CollectionSubscription;
	}
	else {
		idKey = 'bbid';
		TypeSubscription = orm.EntitySubscription;
	}
	return {
		TypeSubscription,
		idKey
	};
}
export async function handleSubscribe(req, res, next) {
	const {type, id} = req.params;
	if (!allowedTypes.includes(type)) {
		return next();
	}
	try {
		const {orm} = req.app.locals;
		const subscriberId = parseInt(req.user.id, 10);
		const {TypeSubscription, idKey} = getTypeSubscription(type, orm);

		await new TypeSubscription({
			[idKey]: id, subscriberId
		}).save(null, {method: 'insert'});
		return res.send({
			isSubscribed: true
		});
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
}

export async function handleUnSubscribe(req, res, next) {
	const {type, id} = req.params;
	if (!allowedTypes.includes(type)) {
		return next();
	}
	try {
		const {orm} = req.app.locals;
		const subscriberId = parseInt(req.user.id, 10);
		const {TypeSubscription, idKey} = getTypeSubscription(type, orm);

		await new TypeSubscription({}).where(snakeCase(idKey), id).where('subscriber_id', subscriberId).destroy();
		return res.send({
			isSubscribed: false
		});
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
}

export async function handleIsSubscribed(req, res, next) {
	const {type, id} = req.params;
	if (!allowedTypes.includes(type)) {
		return next();
	}
	try {
		const editorId = req.user.id;
		const {orm} = req.app.locals;
		const {TypeSubscription, idKey} = getTypeSubscription(type, orm);

		const subscriber = await new TypeSubscription({})
			.where(snakeCase(idKey), id)
			.where('subscriber_id', editorId)
			.fetchAll({
				required: false
			});
		const isSubscribed = subscriber.length > 0;
		return res.send({isSubscribed});
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
}

router.get('/notifications', isAuthenticated, async (req, res, next) => {
	try {
		const editorId = req.user.id;
		const size = req.query.size ? parseInt(req.query.size, 10) : 5;
		const from = req.query.from ? parseInt(req.query.from, 10) : 0;
		const {Notification} = req.app.locals.orm;
		const allNotifications = await new Notification()
			.query('where', 'subscriber_id', '=', editorId)
			.fetchPage({
				limit: size,
				offset: from
			});
		return res.send({
			notifications: allNotifications.toJSON()
		});
	}
	catch (err) {
		return next(err);
	}
});

router.post('/read', (req, res, next) => {
	const {Notification} = req.app.locals.orm;
	async function readNotification(notificationId) {
		const notification = await new Notification({id: notificationId}).fetch({require: false});
		if (notification) {
			notification.set('read', true);
			return notification.save();
		}
		return {};
	}
	try {
		const notificationsToRead = req.body;
		const readPromises = [];
		map(notificationsToRead, (id) => {
			readPromises.push(readNotification(id));
		});
		return sendPromiseResult(res, readPromises);
	}
	catch (err) {
		return next(err);
	}
});

export default router;
