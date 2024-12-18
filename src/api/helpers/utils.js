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

import { get as _get } from 'lodash';
import { loadEntity } from './middleware';

export const aliasesRelations = ['aliasSet.aliases.language'];
export const identifiersRelations = ['identifierSet.identifiers.type'];
export const relationshipsRelations = ['relationshipSet.relationships.type'];

/**
 * Allows only GET method for the API
 *
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {function} next - Callback function
 * @returns {object} Response object if method is not GET
 */
export function allowOnlyGetMethod(req, res, next) {
    if (req.method === 'GET') {
        return next();
    }

    return res
        .set('Allow', 'GET')
        .status(405)
        .send({
            message: `${req.method} method for the "${req.path}" route is not supported. Only GET method is allowed.`,
        });
}

/**
 * Fetch browsed relationships based on the entity type
 *
 * @param {object} orm - ORM instance
 * @param {object} locals - Local variables
 * @param {string} browsedEntityType - Entity type to browse
 * @param {function} getEntityInfoMethod - Method to get entity info
 * @param {boolean} fetchRelated - Flag to fetch related entities
 * @param {function} filterRelationshipMethod - Method to filter relationships
 * @returns {Array} Array of browsed relationships
 */
export async function getBrowsedRelationships(
    orm,
    locals,
    browsedEntityType,
    getEntityInfoMethod,
    fetchRelated,
    filterRelationshipMethod
) {
    const { entity, relationships } = locals;

    if (!relationships.length) {
        return [];
    }

    try {
        const relationshipsResults = [];

        for (const relationship of relationships) {
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
                        continue;
                    }

                    relationshipsResults.push({
                        entity: formattedRelEntity,
                        relationships: [
                            {
                                relationshipType: _get(relationship, 'type.label', null),
                                relationshipTypeID: _get(relationship, 'type.id', null),
                            },
                        ],
                    });
                } catch (err) {
                    console.error(
                        `Error loading entity for relationship: ${err.message}`,
                        err
                    );
                }
            }
        }

        return relationshipsResults.reduce((accumulator, relationship) => {
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
    } catch (err) {
        console.error(`Error processing relationships: ${err.message}`, err);
        throw new Error('Failed to fetch browsed relationships.');
    }
}

