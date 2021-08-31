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

import express from 'express';
import log from 'log';


const router = express.Router();


router.post('/subscribe/entity', async (req, res, next) => {
	try {
		const {bbid} = req.body;
		const subscriberId = parseInt(req.user.id, 10);
		const {EntitySubscription} = req.app.locals.orm;
		await new EntitySubscription({
			bbid, subscriberId
		}).save(null, {method: 'insert'});
		return res.send({
			msg: 'successfully subscribed'
		});
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
});

router.post('/subscribe/collection', async (req, res, next) => {
	try {
		const {collectionId} = req.body;
		const subscriberId = parseInt(req.user.id, 10);
		const {CollectionSubscription} = req.app.locals.orm;
		await new CollectionSubscription({
			collectionId, subscriberId
		}).save(null, {method: 'insert'});
		return res.send({
			msg: 'successfully subscribed'
		});
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
});


router.post('/unsubscribe/collection', async (req, res, next) => {
	try {
		const {collectionId} = req.body;
		const subscriberId = parseInt(req.user.id, 10);
		const {CollectionSubscription} = req.app.locals.orm;
		await new CollectionSubscription({}).where('collection_id', collectionId).where('subscriber_id', subscriberId).destroy();
		return res.send({
			msg: 'successfully unsubscribed'
		});
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
});

router.post('/unsubscribe/entity', async (req, res, next) => {
	try {
		const {bbid} = req.body;
		const subscriberId = parseInt(req.user.id, 10);
		const {EntitySubscription} = req.app.locals.orm;
		await new EntitySubscription({}).where('bbid', bbid).where('subscriber_id', subscriberId).destroy();
		return res.send({
			msg: 'successfully unsubscribed'
		});
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
});


export default router;
