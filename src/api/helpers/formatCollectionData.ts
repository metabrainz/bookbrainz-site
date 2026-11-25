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

import {
	getAuthorBasicInfo,
	getEditionBasicInfo,
	getEditionGroupBasicInfo,
	getPublisherBasicInfo,
	getSeriesBasicInfo,
	getWorkBasicInfo
} from './formatEntityData';
import _ from 'lodash';

/**
 * A helper function to select the appropriate formatter based on entity type
 * @function
 * @param {string} entityType - the type of entity (e.g., 'Edition', 'Work', 'Author')
 * @returns {function} the formatting function corresponding to the entity type
 * @example
 *      getFormatterByEntityType('Edition'); // returns getEditionBasicInfo
 */

function getFormatterByEntityType(entityType: string): (entity: any) => any {
	const formatterMap: Record<string, (entity: any) => any> = {
		Author: getAuthorBasicInfo,
		Edition: getEditionBasicInfo,
		EditionGroup: getEditionGroupBasicInfo,
		Publisher: getPublisherBasicInfo,
		Series: getSeriesBasicInfo,
		Work: getWorkBasicInfo
	};

	return formatterMap[entityType] || ((entity: any) => entity);
}

/**
 * A function to format collection items based on the collection's entity type
 * @function
 * @param {object} collection - the user collection object containing items
 * @returns {Array} an array of formatted items based on the collection's entityType,
 * or an empty array if collection or items are null/undefined
 *
 * @example
 *      const collection = {
 *          entityType: 'Edition',
 *          items: [...]
 *      };
 *      formatCollectionItems(collection);
 *      // => [formattedEdition1, formattedEdition2, ...]
 */

export function formatCollectionItems(collection: any): any[] {
	if (_.isNil(collection) || _.isNil(collection.items)) {
		return [];
	}

	const formatter = getFormatterByEntityType(collection.entityType);
	return collection.items.map((item) => formatter(item));
}

/**
 * A function to extract the basic details of a userCollection ORM object
 * @function
 * @param {object} userCollection - a userCollection ORM object
 * @returns {object|null} an object containing the basic data of a userCollection including
 * description, entityType, id, name, owner info, and public status. Returns null if the
 * input is null or undefined.
 *
 * @example
 *      getCollectionBasicInfo(userCollection);
 *      // => {
 *          "description": "My favorite science fiction novels",
 *          "entityType": "Work",
 *          "id": 1,
 *          "name": "Sci-Fi Collection",
 *          "owner": {
 *              "id": 42,
 *              "metabrainzUserId": 12345,
 *              "name": "john_doe"
 *          },
 *          "public": true
 *      }
 */

export function getCollectionBasicInfo(userCollection: any) {
	if (_.isNil(userCollection)) {
		return null;
	}
	return {
		description: _.get(userCollection, 'description', null),
		entityType: _.get(userCollection, 'entityType', null),
		id: _.get(userCollection, 'id', null),
		name: _.get(userCollection, 'name', null),
		owner: {
			id: _.get(userCollection, 'owner.id', null),
			metabrainzUserId: _.get(
				userCollection,
				'owner.metabrainzUserId',
				null
			),
			name: _.get(userCollection, 'owner.name', null)
		},
		public: _.get(userCollection, 'public', null)
	};
}

/**
 * A function to extract and format collection data including formatted items
 * @function
 * @param {object} collection - the user collection object
 * @returns {object} an object containing the collection's basic info and formatted items
 *
 * @example
 *      const collection = {...};
 *      getFormattedCollection(collection);
 *      // => {
 *          id: 1,
 *          name: "My Collection",
 *          description: "...",
 *          entityType: "Edition",
 *          public: true,
 *          owner: {...},
 *          items: [...]
 *      }
 */

export function getFormattedCollection(collection: any) {
	if (_.isNil(collection)) {
		return null;
	}
	return {
		...getCollectionBasicInfo(collection),
		items: formatCollectionItems(collection)
	};
}
