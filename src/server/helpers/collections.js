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

import * as error from '../../common/helpers/error';

/**
 * Fetches collections of an Editor
 * Fetches the last 'size' collections with offset 'from'
 *
 * @param {number} from - the offset value
 * @param {number} size - no. of last collections required
 * @param {string} entityType - entityType filter
 * @param {object} req - req is an object containing information about the HTTP request
 * @returns {array} - orderedCollections for particular Editor
 * @description
 * This checks whether Editor is valid or not.
 * If Editor is valid then this extracts and returns collections of that editor;
 * If the user is not the editor, then only "Public' collections are returned
 */
export async function getOrderedCollectionsForEditorPage(from, size, entityType, req) {
	const {Editor, UserCollection} = req.app.locals.orm;
	// If editor isn't present, throw an error
	await new Editor({id: req.params.id})
		.fetch()
		.catch(Editor.NotFoundError, () => {
			throw new error.NotFoundError('Editor not found', req);
		});

	const isThisCurrentUser = req.user && parseInt(req.params.id, 10) === parseInt(req.user.id, 10);

	const allCollections = await new UserCollection()
		.query((qb) => {
			qb.leftJoin('bookbrainz.user_collection_collaborator',
				'bookbrainz.user_collection.id', '=',
				'bookbrainz.user_collection_collaborator.collection_id');
		})
		.where((builder) => {
			if (!isThisCurrentUser) {
				builder.where('public', true);
			}
			if (entityType) {
				builder.where('entity_type', entityType);
			}
		})
		.where((builder) => {
			builder.where('collaborator_id', '=', req.params.id).orWhere('owner_id', '=', req.params.id);
		})
		.orderBy('created_at')
		.fetchPage({
			limit: size,
			offset: from,
			withItemCount: true
		});

	const collectionsJSON = allCollections ? allCollections.toJSON() : [];

	collectionsJSON.forEach((collection) => {
		collection.isOwner = parseInt(req.params.id, 10) === collection.ownerId;
	});

	return collectionsJSON;
}

/**
 * Fetches public collections for Show All Collections/Index Page
 * Fetches the last 'size' number of collections with offset 'from'
 *
 * @param {number} from - the offset value
 * @param {number} size - no. of last collections required
 * @param {string} entityType - entityType filter
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {array} - orderedCollections
 */
export async function getOrderedPublicCollections(from, size, entityType, orm) {
	const {UserCollection} = orm;

	const allCollections = await new UserCollection()
		.where((builder) => {
			builder.where('public', true);
			if (entityType) {
				builder.where('entity_type', entityType);
			}
		})
		.orderBy('last_modified', 'DESC')
		.fetchPage({
			limit: size,
			offset: from,
			withItemCount: true,
			withRelated: ['owner']
		});

	const collectionsJSON = allCollections ? allCollections.toJSON() : [];

	return collectionsJSON;
}

/**
 * Fetches bbids of entities in the collection
 * Fetches the last 'size' number of bbids with offset 'from'
 * @param {uuid} collectionId - collectionId
 * @param {number} from - the offset value
 * @param {number} size - no. of last collections required
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {array} - array of bbids
 */
export async function getCollectionItems(collectionId, from, size, orm) {
	const result = await orm.bookshelf.knex.raw(`
						SELECT bookbrainz.user_collection_item.bbid,
						bookbrainz.user_collection_item.added_at
						FROM bookbrainz.user_collection_item
						WHERE collection_id='${collectionId}'
						ORDER BY user_collection_item.added_at ASC
						LIMIT ${size}
						OFFSET ${from}`);
	return result.rows;
}
