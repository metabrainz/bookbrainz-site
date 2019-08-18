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

import _ from 'lodash';


export const aliasesRelations = ['aliasSet.aliases.language'];
export const identifiersRelations = ['identifierSet.identifiers.type'];
export const relationshipsRelations = ['relationshipSet.relationships.type'];

/**
 * allowOnlyGetMethod is function to allow api to send response only for get requests
 *
 * @param {object} req - req is an object containing information about the HTTP request
 * @param {object} res - res to send back the desired HTTP response
 * @param {function} next - this is a callback
 * @returns {object} - return to endpoint if request type is GET otherwise respond error with status code 405
 * @example
 *
 *		allowOnlyGetMethod(req, res, next)
 */

export function allowOnlyGetMethod(req, res, next) {
	if (req.method === 'GET') {
		return next();
	}
	return res.set('Allow', 'GET')
		.status(405)
		.send({message: `${req.method} method for the "${req.path}" route is not supported. Only GET method is allowed`});
}

/* eslint-disable*/

export async function getBrowsedRelationships(locals, browsedEntityType, getEntityInfoMethod) {
	const entity = locals.entity;
	const {orm} = locals;
 	const relationships = locals.relationships;
	
	if(! relationships.length > 0) {
		return [];
	}

	const filteredRelationships = await relationships
		.map(relationship => {
			// Current entity is the source of the relationship
			if (entity.bbid === relationship.sourceBbid) {
				// The other entity is of the browsed type we are looking for
				// We need a good way to compare entity type strings here and same thing below
				// Allow for capitalization mistakes? (.toLowercase() on both?)
				if (relationship.target.type === browsedEntityType) {
					return {
						entity: relationship.target,
						relationships: [{
							relationshipTypeID: _.get(relationship, 'type.id', null),
							relationshipType: _.get(relationship, 'type.label', null)
						}]
					};
				}
			}
			// Current entity is the target of the relationship
			// and the other entity is of the browsed type we are looking for
			else if (relationship.source.type === browsedEntityType) {
				return {
					entity: relationship.source,
					relationships: [{
						relationshipTypeID: _.get(relationship, 'type.id', null),
						relationshipType: _.get(relationship, 'type.label', null)
					}]
				};
			}
			return null;
		})
		// Remove falsy values (nulls returned above)
		.filter(Boolean);

	const flattenedRelationships = await filteredRelationships
		.reduce((accumulator, relationship, index, array) => {
			const entityAlreadyExists = accumulator.find(rel => rel.entity.bbid === relationship.entity.bbid);
			if (entityAlreadyExists) {
				entityAlreadyExists.relationships.push(...relationship.relationships);
			}
			else {
				accumulator.push(relationship);
			}
			return accumulator;
		}, []);

	return flattenedRelationships;
}