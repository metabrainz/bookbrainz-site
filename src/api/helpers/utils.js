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

import {get as _get} from 'lodash';
import {loadEntity} from './middleware';


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


export async function getBrowsedRelationships(orm, locals, browsedEntityType,
											  getEntityInfoMethod, fetchRelated, filterRelationshipMethod) {
	const {entity, relationships} = locals;

	if (!relationships.length > 0) {
		return [];
	}
	const relationshipsPromises = relationships
		.map(async relationship => {
			let relEntity;
			if (entity.bbid === relationship.sourceBbid &&
				relationship.target.type.toLowerCase() === browsedEntityType.toLowerCase()) {
				relEntity = relationship.target;
			}
			else if (relationship.source.type.toLowerCase() === browsedEntityType.toLowerCase()) {
				relEntity = relationship.source;
			}

			if (relEntity) {
				const loadedRelEntity = await loadEntity(orm, relEntity, fetchRelated);
				const formattedRelEntity = getEntityInfoMethod(loadedRelEntity);
				if (!filterRelationshipMethod(formattedRelEntity)) {
					return null;
				}
				return {
					entity: formattedRelEntity,
					relationship: [{
						relationshipType: _get(relationship, 'type.label', null),
						relationshipTypeID: _get(relationship, 'type.id', null)
					}]
				};
			}
			return null;
		});
	const fetchedRelationshipsPromises = await Promise.all(relationshipsPromises);
	// Remove falsy values (nulls returned above)
	const filteredRelationships = fetchedRelationshipsPromises.filter(Boolean);

	return filteredRelationships
		.reduce((accumulator, relationship) => {
			const entityAlreadyExists = accumulator.find(rel => rel.entity.bbid === relationship.entity.bbid);
			if (entityAlreadyExists) {
				entityAlreadyExists.relationships.push(...relationship.relationships);
			}
			else {
				accumulator.push(relationship);
			}
			return accumulator;
		}, []);
}
