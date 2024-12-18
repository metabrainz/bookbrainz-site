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
 * allowOnlyGetMethod is a function to allow the API to send a response only for GET requests.
 *
 * @param {object} req - Object containing information about the HTTP request.
 * @param {object} res - Object to send back the desired HTTP response.
 * @param {function} next - Callback function to proceed to the next middleware.
 * @returns {object} - Returns to the endpoint if the request type is GET; otherwise, responds with an error and status code 405.
 */
export function allowOnlyGetMethod(req, res, next) {
    if (req.method === 'GET') {
        return next();
    }
    return res.set('Allow', 'GET')
        .status(405)
        .send({message: `${req.method} method for the "${req.path}" route is not supported. Only GET method is allowed.`});
}

/**
 * Fetch and filter browsed relationships based on the provided entity type and filtering methods.
 *
 * @param {object} orm - ORM instance for database operations.
 * @param {object} locals - Local variables containing the entity and relationships.
 * @param {string} browsedEntityType - The type of entity being browsed.
 * @param {function} getEntityInfoMethod - Method to extract information from the entity.
 * @param {Array<string>} fetchRelated - Relationships to fetch for the entity.
 * @param {function} filterRelationshipMethod - Method to filter relationships based on custom criteria.
 * @returns {Array<object>} - Returns an array of filtered relationships.
 */
export async function getBrowsedRelationships(
    orm,
    locals,
    browsedEntityType,
    getEntityInfoMethod,
    fetchRelated,
    filterRelationshipMethod
) {
    const {entity, relationships} = locals;

    if (!relationships.length) {
        return [];
    }

    try {
        const fetchedRelationships = await Promise.all(
            relationships.map(async (relationship) => {
                let relEntity;

                if (
                    entity.bbid === relationship.sourceBbid &&
                    relationship.target.type.toLowerCase() === browsedEntityType.toLowerCase()
                ) {
                    relEntity = relationship.target;
                } else if (
                    relationship.source.type.toLowerCase() === browsedEntityType.toLowerCase()
                ) {
                    relEntity = relationship.source;
                }

                if (relEntity) {
                    try {
                        const loadedRelEntity = await loadEntity(orm, relEntity, fetchRelated);
                        const formattedRelEntity = getEntityInfoMethod(loadedRelEntity);

                        if (!filterRelationshipMethod(formattedRelEntity)) {
                            return null;
                        }

                        return {
                            entity: formattedRelEntity,
                            relationships: [
                                {
                                    relationshipType: _get(relationship, 'type.label', null),
                                    relationshipTypeID: _get(relationship, 'type.id', null),
                                },
                            ],
                        };
                    } catch (err) {
                        console.error('Error loading related entity:', err);
                        return null;
                    }
                }
                return null;
            })
        );

        // Remove falsy values (nulls returned above)
        const filteredRelationships = fetchedRelationships.filter(Boolean);

        return filteredRelationships.reduce((accumulator, relationship) => {
            const entityAlreadyExists = accumulator.find(
                (rel) => rel.entity.bbid === relationship.entity.bbid
            );
            if (entityAlreadyExists) {
                entityAlreadyExists.relationships.push(...relationship.relationships);
            } else {
                accumulator.push(relationship);
            }
            return accumulator;
        }, []);
    } catch (error) {
        console.error('Error fetching browsed relationships:', error);
        throw new Error('Failed to fetch browsed relationships.');
    }
}


