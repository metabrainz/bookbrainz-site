/*
 * Copyright (C) 2019  Akhilesh Kumar
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

import * as commonUtils from '../../common/helpers/utils';
import {getEntityRelations} from '../helpers/entityRelations';
import log from 'log';

/**
 * This is a middleware function to load a public Collection along with its items data
 *
 * @param {string} errMessage - Error message, if any error will occur
 *
 * @returns {object} an object containing the error message if any error will occur.
 * If collection is found successfully in the database this function set the collection data along with the items entity data
 * at res.locals.collection and return to next function.
 * @example
 *		const errorMessage = 'collection not found';
 *		makeCollectionLoader(errMessage);
 *
 * @description
 * First, check the collectionId is valid or not.
 * If collectionId is valid then extract the collection data from database by using collectionId
 * If collection items are found successfully then hydrate the entity data in the items array itself using the entities BBID
 * otherwise return an object {message: errMessage} as response with status code 404.
 * If the collectionId is not valid then return a status code 400 and an object {message: 'collectionId is not valid uuid'}.
 */
export function makeCollectionLoader(errMessage) {
	return async (req, res, next) => {
		const {orm} = req.app.locals;
		const {UserCollection} = orm;

		const {collectionId} = req.params;

		if (commonUtils.isValidBBID(collectionId)) {
			try {
				const collection = await new UserCollection({
					id: collectionId
				}).fetch({
					require: true,
					withRelated: [
						'collaborators.collaborator',
						'owner',
						{
							items(queryBuilder) {
								queryBuilder.limit(20);
								queryBuilder.orderBy('added_at', 'asc');
							}
						}
					]
				});

				const collectionJSON = collection.toJSON();
				// Check if its a public collection other wise return error
				if (!collectionJSON.public) {
					return res
						.status(400)
						.send({message: 'Collection is not public '});
				}
				const collectionType = collectionJSON.entityType;

				// Hydrate the items with full Entity data
				const entitiesPromise = collectionJSON.items.map(
					async (item) => {
						try {
							// Get the appropriate relations for this entity type
							const entityRelations =
								getEntityRelations(collectionType);

							const entityData = await orm.func.entity.getEntity(
								orm,
								collectionType,
								item.bbid,
								entityRelations
							);
							return {
								addedAt: item.added_at,
								...entityData
							};
						}
						catch (entityErr) {
							log.error(
								`Failed to load entity ${item.bbid}:`,
								entityErr
							);
							return {
								addedAt: item.added_at,
								bbid: item.bbid,
								error: 'Failed to load entity data'
							};
						}
					}
				);

				collectionJSON.items = await Promise.all(entitiesPromise);

				res.locals.collection = collectionJSON;
				return next();
			}
			catch (err) {
				log.error(err);
				return res
					.status(404)
					.send({context: err, message: errMessage});
			}
		}
		return res
			.status(400)
			.send({message: 'collectionId is not valid uuid'});
	};
}
