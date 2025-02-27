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
import * as error from '../../common/helpers/error';
import * as handler from '../helpers/handler';
import * as middleware from '../helpers/middleware';
import * as propHelpers from '../../client/helpers/props';
import * as search from '../../common/helpers/search';
import {escapeProps, generateProps} from '../helpers/props';
import CollectionPage from '../../client/components/pages/collection';
import Layout from '../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import UserCollectionForm from '../../client/components/forms/userCollection';
import {addAuthorsDataToWorks} from '../../client/helpers/entity';
import {collectionCreateOrEditHandler} from '../helpers/collectionRouteUtils';
import express from 'express';
import {getCollectionItems} from '../helpers/collections';
import {getNextEnabledAndResultsArray} from '../../common/helpers/utils';
import {groupBy} from 'lodash';
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

	const seriesRelations = [
		'defaultAlias.language',
		'disambiguation',
		'seriesOrderingType'
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
		Series: seriesRelations,
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
router.post('/create/handler', auth.isAuthenticatedForHandler, middleware.validateCollectionParams, collectionCreateOrEditHandler);


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
		const items = await getCollectionItems(collection.id, from, size + 1, orm);
		// get next enabled for pagination
		const {newResultsArray, nextEnabled} = getNextEnabledAndResultsArray(items, size);
		// load entities from bbids
		const entitiesPromise = newResultsArray.map(async item => ({
			addedAt: item.added_at,
			...await orm.func.entity.getEntity(orm, collection.entityType, item.bbid, relations)
		}));
		let entities = await Promise.all(entitiesPromise);
		const isOwner = req.user && parseInt(collection.ownerId, 10) === parseInt(req.user?.id, 10);
		const isCollaborator = req.user && collection.collaborators.filter(collaborator => collaborator.id === req.user.id).length;
		const userId = req.user ? parseInt(req.user.id, 10) : null;
		if (collection.entityType === 'Work') {
			const workBBIDs = entities.map(entity => entity.bbid);
			const authorsData = await orm.func.work.loadAuthorNames(orm, workBBIDs);
			const authorsDataGroupedByWorkBBID = groupBy(authorsData, 'workbbid');
			entities = addAuthorsDataToWorks(authorsDataGroupedByWorkBBID, entities);
		}
		const props = generateProps(req, res, {
			collection,
			entities,
			from,
			isCollaborator,
			isOwner,
			nextEnabled,
			size,
			userId
		});
		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<CollectionPage
					{...propHelpers.extractChildProps(props)}
				/>
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

		const items = await getCollectionItems(collection.id, from, size, orm);
		// load entities from bbids
		const entitiesPromise = items.map(async item => ({
			addedAt: item.added_at,
			...await orm.func.entity.getEntity(orm, collection.entityType, item.bbid, relations)
		}));
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
	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<UserCollectionForm
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

router.post(
	'/:collectionId/edit/handler',
	auth.isAuthenticatedForHandler, auth.isCollectionOwner, middleware.validateCollectionParams, collectionCreateOrEditHandler
);

router.post('/:collectionId/delete/handler', auth.isAuthenticatedForHandler, auth.isCollectionOwner, async (req, res, next) => {
	try {
		const {UserCollection} = req.app.locals.orm;
		const {collection} = res.locals;
		await new UserCollection({id: collection.id}).destroy();
		const collectionPromiseForES = new Promise((resolve) => {
			const collectionForES = {
				aliasSet: {
					aliases: [
						{name: collection.name}
					]
				},
				bbid: collection.id,
				id: collection.id,
				type: 'Collection'
			};
			resolve(collectionForES);
		});
		return handler.sendPromiseResult(res, collectionPromiseForES, search.deleteEntity);
	}
	catch (err) {
		log.debug(err);
		return next(err);
	}
});

router.post(
	'/:collectionId/remove',
	auth.isAuthenticatedForHandler, auth.isCollectionOwnerOrCollaborator, middleware.validateBBIDsForCollectionRemove,
	async (req, res, next) => {
		const {bbids = []} = req.body;
		const {collection} = res.locals;
		try {
			const {UserCollection, UserCollectionItem} = req.app.locals.orm;
			await new UserCollectionItem()
				.query((qb) => {
					qb.where('collection_id', collection.id);
					qb.whereIn('bbid', bbids);
				}).destroy();
			await new UserCollection({id: collection.id}).save({
				lastModified: new Date()
			}, {patch: true});
			res.status(200).send();
		}
		catch (err) {
			log.debug(err);
			return next(err);
		}
	}
);

/* eslint-disable no-await-in-loop */
router.post(
	'/:collectionId/add',
	auth.isAuthenticatedForHandler, auth.isCollectionOwnerOrCollaborator, middleware.validateBBIDsForCollectionAdd,
	async (req, res, next) => {
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
	}
);

router.post(
	'/:collectionId/collaborator/remove',
	auth.isAuthenticatedForHandler, middleware.validateCollaboratorIdsForCollectionRemove,
	async (req, res, next) => {
		try {
			const {collection} = res.locals;
			const collaboratorIdsToRemove = req.body.collaboratorIds;
			const userId = parseInt(req.user.id, 10);
			// user is allowed to make this change if they are owner of the collection OR they are collaborator and they want to remove themselves
			let isAllowedToEdit = userId === collection.ownerId;
			if (!isAllowedToEdit) {
				if (collaboratorIdsToRemove.length === 1 && parseInt(collaboratorIdsToRemove[0], 10) === userId) {
					isAllowedToEdit = true;
				}
			}
			if (!isAllowedToEdit) {
				return next(new error.PermissionDeniedError(
					'You do not have permission to remove collaborators from this collection', req
				));
			}

			const {UserCollection, UserCollectionCollaborator} = req.app.locals.orm;
			await new UserCollectionCollaborator()
				.query((qb) => {
					qb.where('collection_id', collection.id);
					qb.whereIn('collaborator_id', collaboratorIdsToRemove);
				}).destroy();
			await new UserCollection({id: collection.id}).save({
				lastModified: new Date()
			}, {patch: true});
			res.status(200).send();
		}
		catch (err) {
			log.debug(err);
			return next(err);
		}
	}
);

export default router;
