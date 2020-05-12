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

import * as auth from '../helpers/auth';
import * as handler from '../helpers/handler';
import * as middleware from '../helpers/middleware';
import * as propHelpers from '../../client/helpers/props';
import * as search from '../helpers/search';
import {escapeProps, generateProps} from '../helpers/props';
import Layout from '../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import UserCollectionForm from '../../client/components/forms/userCollection';
import express from 'express';
import target from '../templates/target';


const router = express.Router();

/* If the route specifies a CollectionId, load the Collection for it. */
router.param(
	'collectionId',
	middleware.makeCollectionLoader()
);

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

router.post('/create/handler', auth.isAuthenticatedForHandler, async (req, res) => {
	const {UserCollection, UserCollectionCollaborator} = req.app.locals.orm;
	const collection = await new UserCollection({
		description: req.body.description,
		editorId: req.user.id,
		name: req.body.name,
		public: req.body.privacy === 'Public',
		type: req.body.type
	}).save(null, {method: 'insert'});

	const collaboratorPromises = [];
	const collaborators = req.body.collaborators ? req.body.collaborators : [];

	collaborators.forEach((collaborator) => {
		collaboratorPromises.push(
			new UserCollectionCollaborator({
				collectionId: collection.get('id'),
				editorId: collaborator.id
			}).save(null, {method: 'insert'})
		);
	});
	await Promise.all(collaboratorPromises);

	// we need to add this collection in ElasticSearch index
	const collectionPromiseForES = new Promise((resolve) => {
		const collectionForES = {
			aliasSet: {
				aliases: [
					{name: collection.get('name')}
				]
			},
			bbid: collection.get('id'),
			id: collection.get('id'),
			type: 'Collection'
		};
		resolve(collectionForES);
	});

	handler.sendPromiseResult(res, collectionPromiseForES, search.indexEntity);
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

router.post('/:collectionId/edit/handler', auth.isAuthenticated, auth.isCollectionOwner, async (req, res) => {
	const {UserCollection, UserCollectionCollaborator} = req.app.locals.orm;
	const newCollection = await new UserCollection({id: req.params.collectionId}).fetch({
		require: true,
		withRelated: ['collaborators.collaboratorDetail']
	});

	newCollection.set('description', req.body.description);
	newCollection.set('name', req.body.name);
	newCollection.set('public', req.body.privacy === 'Public');
	newCollection.set('type', req.body.type);
	await newCollection.save();

	const oldCollection = res.locals.collection;

	// find difference in collaborator in oldCollection and newCollection
	// we need to add this collection in ElasticSearch index
	const collectionPromiseForES = new Promise((resolve) => {
		const collectionForES = {
			aliasSet: {
				aliases: [
					{name: newCollection.get('name')}
				]
			},
			bbid: newCollection.get('id'),
			id: newCollection.get('id'),
			type: 'Collection'
		};
		resolve(collectionForES);
	});

	handler.sendPromiseResult(res, collectionPromiseForES, search.indexEntity);
});

router.get('/:collectionId', (req, res) => {
	const {collection} = res.locals;
	// eslint-disable-next-line no-console
	res.status(200).send(collection);
});


export default router;
