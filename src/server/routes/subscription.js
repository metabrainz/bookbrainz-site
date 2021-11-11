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
import * as auth from '../helpers/auth';
import express from 'express';
import log from 'log';


const router = express.Router();

router.get('/entity/isSubscribed/:bbid', auth.isAuthenticated, async (req, res, next) => {
	try {
		const {EntitySubscription} = req.app.locals.orm;
		const editorId = req.user.id;
		const {bbid} = req.params;
		const subscriber = await new EntitySubscription({})
			.where('bbid', bbid)
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
});

router.get('/collection/isSubscribed/:collectionId', auth.isAuthenticated, async (req, res, next) => {
	try {
		const {CollectionSubscription} = req.app.locals.orm;
		const editorId = req.user.id;
		const {collectionId} = req.params;
		const subscriber = await new CollectionSubscription({})
			.where('collection_id', collectionId)
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
});

router.post('/subscribe/entity', auth.isAuthenticated, async (req, res, next) => {
	try {
		const {bbid} = req.body;
		const subscriberId = parseInt(req.user.id, 10);
		const {EntitySubscription} = req.app.locals.orm;
		await new EntitySubscription({
			bbid, subscriberId
		}).save(null, {method: 'insert'});
		return res.send({
			isSubscribed: true
		});
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
});

router.post('/subscribe/collection', auth.isAuthenticated, async (req, res, next) => {
	try {
		const {collectionId} = req.body;
		const subscriberId = parseInt(req.user.id, 10);
		const {CollectionSubscription} = req.app.locals.orm;
		await new CollectionSubscription({
			collectionId, subscriberId
		}).save(null, {method: 'insert'});
		return res.send({
			isSubscribed: true
		});
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
});


router.post('/unsubscribe/collection', auth.isAuthenticated, async (req, res, next) => {
	try {
		const {collectionId} = req.body;
		const subscriberId = parseInt(req.user.id, 10);
		const {CollectionSubscription} = req.app.locals.orm;
		await new CollectionSubscription({}).where('collection_id', collectionId).where('subscriber_id', subscriberId).destroy();
		return res.send({
			isSubscribed: false
		});
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
});

router.post('/unsubscribe/entity', auth.isAuthenticated, async (req, res, next) => {
	try {
		const {bbid} = req.body;
		const subscriberId = parseInt(req.user.id, 10);
		const {EntitySubscription} = req.app.locals.orm;
		await new EntitySubscription({}).where('bbid', bbid).where('subscriber_id', subscriberId).destroy();
		return res.send({
			isSubscribed: false
		});
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
});

router.get('/notifications', auth.isAuthenticated, async (req, res, next) => {
	try {
		console.log('HERE');
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

export default router;
