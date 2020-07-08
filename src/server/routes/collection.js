/*
 * Copyright (C) 2020 Prabal Singh
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
/* eslint-disable consistent-return*/


import * as auth from '../helpers/auth';
import * as middleware from '../helpers/middleware';
import * as propHelpers from '../../client/helpers/props';
import * as utils from '../helpers/utils';
import {escapeProps, generateProps} from '../helpers/props';
import CollectionPage from '../../client/components/pages/collection';
import Layout from '../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import UserCollectionForm from '../../client/components/forms/userCollection';
import {collectionCreateOrEditHandler} from '../helpers/collectionRouteUtils';
import express from 'express';
import {getCollectionItemBBIDs} from '../helpers/collections';
import log from 'log';
import target from '../templates/target';


const router = express.Router();


function getEntityRelations(entityType) {
	const authorRelations = [
		'defaultAlias.language',
		'disambiguation',
		'authorType',
		'gender'
	];

	const editionRelations = [
		'defaultAlias.language',
		'disambiguation',
		'editionFormat',
		'identifierSet.identifiers.type',
		'releaseEventSet.releaseEvents'
	];

	const editionGroupRelations = [
		'defaultAlias.language',
		'disambiguation',
		'editionGroupType'
	];

	const publisherRelations = [
		'defaultAlias.language',
		'disambiguation',
		'publisherType',
		'area'
	];

	const workRelations = [
		'defaultAlias.language',
		'disambiguation',
		'languageSet.languages',
		'workType'
	];

	const relations = {
		Author: authorRelations,
		Edition: editionRelations,
		EditionGroup: editionGroupRelations,
		Publisher: publisherRelations,
		Work: workRelations
	};
	return relations[entityType];
}

router.get('/create', auth.isAuthenticated, (req, res) => {
	const props = generateProps(req, res, {});
	const script = '/js/collection/create.js';
	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<UserCollectionForm/>
		</Layout>
	);
	res.send(target({
		markup,
		props: escapeProps(props),
		script
	}));
});
router.post('/create/handler', auth.isAuthenticatedForHandler, collectionCreateOrEditHandler);


/* If the route specifies a CollectionId, load the Collection for it. */
router.param(
	'collectionId',
	middleware.makeCollectionLoader()
);

router.get('/:collectionId', auth.isAuthenticatedForCollectionView, async (req, res, next) => {
	try {
		const {collection} = res.locals;
		const {orm} = req.app.locals;
		const size = req.query.size ? parseInt(req.query.size, 10) : 20;
		const from = req.query.from ? parseInt(req.query.from, 10) : 0;
		const relations = getEntityRelations(collection.entityType);

		// fetch 1 more bbid to check next enabled for pagination
		const bbids = await getCollectionItemBBIDs(collection.id, from, size + 1, orm);
		// get next enabled for pagination
		const {newResultsArray, nextEnabled} = utils.getNextEnabledAndResultsArray(bbids, size);
		// load entities from bbids
		const entitiesPromise = newResultsArray.map(bbid => orm.func.entity.getEntity(orm, collection.entityType, bbid, relations));
		const entities = await Promise.all(entitiesPromise);
		const isOwner = req.user && parseInt(collection.ownerId, 10) === parseInt(req.user?.id, 10);
		let showCheckboxes = isOwner;
		if (req.user && collection.collaborators.filter(collaborator => collaborator.id === req.user.id).length) {
			showCheckboxes = true;
		}
		const props = generateProps(req, res, {
			collection,
			entities,
			from,
			isOwner,
			nextEnabled,
			showCheckboxes,
			size
		});
		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<CollectionPage {...propHelpers.extractChildProps(props)}/>
			</Layout>
		);

		const script = '/js/collection.js';
		return res.send(target({
			markup,
			props: escapeProps(props),
			script
		}));
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
});

router.get('/:collectionId/paginate', auth.isAuthenticatedForCollectionView, async (req, res, next) => {
	try {
		const {collection} = res.locals;
		const {orm} = req.app.locals;
		const size = req.query.size ? parseInt(req.query.size, 10) : 20;
		const from = req.query.from ? parseInt(req.query.from, 10) : 0;

		const relations = getEntityRelations(collection.entityType);

		const bbids = await getCollectionItemBBIDs(collection.id, from, size, orm);
		// load entities from bbids
		const entitiesPromise = bbids.map(bbid => orm.func.entity.getEntity(orm, collection.entityType, bbid, relations));
		const entities = await Promise.all(entitiesPromise);
		res.send(entities);
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
});

router.get('/:collectionId/edit', auth.isAuthenticated, auth.isCollectionOwner, (req, res) => {
	const {collection} = res.locals;
	const props = generateProps(req, res, {
		collection
	});
	const script = '/js/collection/create.js';
	const canEditType = collection.items.length === 0;
	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<UserCollectionForm
				canEditType={canEditType}
				collection={props.collection}
			/>
		</Layout>
	);
	res.send(target({
		markup,
		props: escapeProps(props),
		script
	}));
});

router.post('/:collectionId/edit/handler', auth.isAuthenticatedForHandler, auth.isCollectionOwner, collectionCreateOrEditHandler);

router.post('/:collectionId/delete/handler', auth.isAuthenticatedForHandler, auth.isCollectionOwner, async (req, res, next) => {
	try {
		const {UserCollection} = req.app.locals.orm;
		const {collectionId} = req.params;
		await new UserCollection({id: collectionId}).destroy();
		return res.status(200).send({});
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
});

router.post('/:collectionId/remove', auth.isAuthenticated, auth.isCollectionOwnerOrCollaborator, async (req, res, next) => {
	const {bbids = []} = req.body;
	const {collection} = res.locals;
	try {
		if (!bbids.length) {
			throw new Error('bbids is empty');
		}
		const {UserCollection, UserCollectionItem} = req.app.locals.orm;
		await new UserCollectionItem()
			.query((qb) => {
				qb.where('collection_id', collection.id);
				qb.whereIn('bbid', bbids);
			}).destroy();
		const collectionModel = await new UserCollection({id: collection.id}).fetch({
			require: true
		});
		collectionModel.set('last_modified', new Date());
		await collectionModel.save(null, {method: 'update'});
		res.status(200).send();
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
});

/* eslint-disable no-await-in-loop */
router.post('/:collectionId/add', auth.isAuthenticated, auth.isCollectionOwnerOrCollaborator, async (req, res, next) => {
	const {bbids} = req.body;
	const {collection} = res.locals;
	try {
		const {UserCollection, UserCollectionItem} = req.app.locals.orm;
		for (const bbid of bbids) {
			// because of the unique constraint, we can't add duplicate entities to a collection
			// using try catch to make sure code doesn't break if user accidentally adds duplicate entity
			try {
				await new UserCollectionItem({
					bbid,
					collectionId: collection.id
				}).save(null, {method: 'insert'});
				await new UserCollection({id: collection.id}).save({
					lastModified: new Date()
				}, {patch: true});
			}
			catch (err) {
				// throw error if it's not due to unique constraint
				if (err.constraint !== 'user_collection_item_pkey') {
					throw err;
				}
			}
		}
		res.status(200).send();
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
});

export default router;