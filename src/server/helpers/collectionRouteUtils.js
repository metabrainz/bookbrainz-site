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

import * as search from '../../common/helpers/search';
import {camelCase, differenceWith, isEqual, toLower, upperFirst} from 'lodash';
import {BadRequestError} from '../../common/helpers/error';
import log from 'log';

/**
 * A handler for create or edit actions on collections.
 * @param {object} req - request object
 * @param {object} res - response object
 * @param {object} next - next object
 * @returns {promise} res.send promise
 * @description
 * Creates a new collection or updates the existing collection
 * If it's a new collection or it's name is changed, ElasticSearch index is also updated
 */
export async function collectionCreateOrEditHandler(req, res, next) {
	try {
		const {UserCollection, UserCollectionCollaborator} = req.app.locals.orm;
		const isNew = !res.locals.collection;
		let newCollection;
		let method;
		if (isNew) {
			newCollection = await new UserCollection({
				ownerId: req.user.id
			});
			method = 'insert';
		}
		else {
			if (res.locals.collection?.items?.length && (upperFirst(camelCase(req.body.entityType)) !== res.locals.collection.entityType)) {
				throw new BadRequestError('Trying to change entityType of a non empty collection');
			}
			newCollection = await new UserCollection({id: req.params.collectionId}).fetch({
				require: true
			});
			method = 'update';
			newCollection.set('last_modified', new Date());
		}
		newCollection.set('description', req.body.description);
		newCollection.set('name', req.body.name);
		newCollection.set('public', toLower(req.body.privacy) === 'public');
		newCollection.set('entity_type', upperFirst(camelCase(req.body.entityType)));
		await newCollection.save(null, {method});

		const oldCollaborators = res.locals.collection ? res.locals.collection.collaborators : [];
		const newCollaborators = req.body.collaborators ? req.body.collaborators : [];

		const newlyAddedCollaborators = differenceWith(newCollaborators, oldCollaborators, isEqual);
		const removedCollaborators = differenceWith(oldCollaborators, newCollaborators, isEqual);

		const collaboratorPromises = [];
		newlyAddedCollaborators.forEach((collaborator) => {
			collaboratorPromises.push(
				new UserCollectionCollaborator({
					collaboratorId: collaborator.id,
					collectionId: newCollection.get('id')
				}).save(null, {method: 'insert'})
			);
		});
		removedCollaborators.forEach((collaborator) => {
			collaboratorPromises.push(
				new UserCollectionCollaborator({})
					.where('collection_id', newCollection.get('id'))
					.where('collaborator_id', collaborator.id)
					.destroy()
			);
		});

		await Promise.all(collaboratorPromises);

		// if it's new or the name is changed,
		// we need to update this collection in ElasticSearch index
		if (isNew || res.locals.collection.name !== newCollection.get('name')) {
			// Type needed for indexing
			newCollection.set('type', 'Collection');
			await search.indexEntity(newCollection);
		}
		return res.status(200).send(newCollection.toJSON());
	}
	catch (err) {
		return next(err);
	}
}
