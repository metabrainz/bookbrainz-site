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

/**
 * Maps entity types to their basic relations required for loading
 * These relations are essential for proper entity data fetching
 */
const entityRelationsMap = {
	Author: [
		'defaultAlias.language',
		'disambiguation',
		'authorType',
		'gender',
		'beginArea',
		'endArea'
	],
	Edition: [
		'defaultAlias.language',
		'languageSet.languages',
		'disambiguation',
		'editionFormat',
		'editionStatus',
		'releaseEventSet.releaseEvents',
		'authorCredit.names',
		'publisherSet.publishers'
	],
	EditionGroup: [
		'defaultAlias.language',
		'disambiguation',
		'editionGroupType'
	],
	Publisher: [
		'defaultAlias.language',
		'disambiguation',
		'publisherType',
		'area'
	],
	Series: ['defaultAlias.language', 'disambiguation', 'seriesOrderingType'],
	Work: [
		'defaultAlias.language',
		'languageSet.languages',
		'disambiguation',
		'workType'
	]
};

/**
 * Get the basic relations for a specific entity type
 *
 * @param {string} entityType - The type of entity (e.g., 'Author', 'Edition', 'Work')
 * @returns {array} An array of relation strings for the entity type
 * @throws {Error} If the entity type is not found in the map
 *
 * @example
 *   const authorRelations = getEntityRelations('Author');
 *    Returns: ['defaultAlias.language', 'disambiguation', 'authorType', ...]
 */
export function getEntityRelations(entityType: string): string[] {
	if (!entityType || !entityRelationsMap[entityType]) {
		throw new Error(
			`Entity relations not defined for entity type: ${entityType}`
		);
	}
	return entityRelationsMap[entityType];
}
