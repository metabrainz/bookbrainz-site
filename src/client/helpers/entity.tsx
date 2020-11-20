/*
 * Copyright (C) 2016  Daniel Hsing
 * 				 2019  Akhilesh Kumar (@akhilesh26)
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


import * as React from 'react';
// eslint-disable-next-line import/named
import {FontAwesomeIconProps as FAProps, FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {get as _get, isNil as _isNil, kebabCase as _kebabCase, upperFirst} from 'lodash';
import {format, isValid, parseISO} from 'date-fns';
import {dateObjectToISOString} from './utils';


export function extractAttribute(attr, path) {
	if (attr) {
		if (path) {
			return _get(attr, path, '?');
		}
		return attr;
	}
	return '?';
}

export function getLanguageAttribute(entity) {
	const languages = entity.languageSet && entity.languageSet.languages ?
		entity.languageSet.languages.map(
			(language) => language.name
		).join(', ') : '?';
	return {data: languages, title: 'Languages'};
}

export function getTypeAttribute(entityType) {
	return {data: extractAttribute(entityType, 'label'), title: 'Type'};
}

/**
 * Transforms an extended ISO 8601-2004 string to a more human-firendly result
 * @function transformISODateForDisplay
 * @param {string} ISODateString - an extended ISO date string (±YYYYYY-MM-DD)
 * @returns {string} A date string with less padding zeros
 */
export function transformISODateForDisplay(ISODateString) {
	if (_isNil(ISODateString)) {
		return ISODateString;
	}
	const dateStringWithoutSign = ISODateString.slice(1);
	const parts = dateStringWithoutSign.split('-');
	let formatting;
	switch (parts.length) {
		case 1:
			formatting = 'uuuu';
			break;
		case 2:
			formatting = 'uuuu-MM';
			break;
		case 3:
			formatting = 'uuuu-MM-dd';
			break;
		default:
			return ISODateString;
	}
	const parsedDate = parseISO(ISODateString, {additionalDigits: 2});
	if (!isValid(parsedDate)) {
		return ISODateString;
	}
	return format(
		parsedDate,
		formatting
	);
}

/**
 * Transforms an extended ISO 8601-2004 date string to an option fit for react-select
 * @function transformISODateForSelect
 * @param {string|object} dateValue - an extended ISO date string (±YYYYYY-MM-DD) or date object {day,month,year}
 * @returns {object} - A {label,value} object for react-select option
 */
export function transformISODateForSelect(dateValue) {
	let dateString = dateValue;
	if (typeof dateValue !== 'string') {
		dateString = dateObjectToISOString(dateValue);
	}
	return {
		label: transformISODateForDisplay(dateString),
		value: dateString
	};
}

/**
 * Determines whether an entity provided to the EntitySearch component is an
 * Area, using the present attributes.
 *
 * @param {Object} entity the entity to test
 * @returns {boolean} true if the entity looks like an Area
 */
function isArea(entity) {
	if (entity.type === 'Area') {
		return true;
	}

	return Boolean(entity.gid);
}

/**
 * Transforms an Area entity to a react-select component option
 * @param {object} area - The Area entity to transfrom
 * @returns {object} option - A react-select option
 */
export function areaToOption(
	area: {comment: string, id: number, name: string} | null
) {
	if (!area) {
		return null;
	}
	const {id} = area;
	return {
		disambiguation: area.comment,
		id,
		text: area.name,
		type: 'area'
		// value: id
	};
}

/**
 * Transforms an entity to a react-select component option
 * @param {object} entity - The entity to transfrom
 * @returns {object} option - A react-select option
 */
export function entityToOption(entity) {
	if (_isNil(entity)) {
		return null;
	}
	if (isArea(entity)) {
		return areaToOption(entity);
	}

	return {
		disambiguation: entity.disambiguation ?
			entity.disambiguation.comment : null,
		id: entity.bbid,
		text: entity.defaultAlias ?
			entity.defaultAlias.name : '(unnamed)',
		type: entity.type
	};
}

export function getEntityLabel(entity, returnHTML = true) {
	if (entity.defaultAlias) {
		return `${entity.defaultAlias.name} `;
	}

	// Deleted entities
	if (!entity.dataId) {
		let deletedEntityName = `Deleted ${entity.type} ${entity.bbid}`;
		if (entity.parentAlias) {
			deletedEntityName = entity.parentAlias.name;
		}
		if (returnHTML) {
			return <span className="text-muted deleted" title={`Deleted ${entity.type}`}>{deletedEntityName}</span>;
		}
		return `${deletedEntityName}`;
	}
	if (returnHTML) {
		return <span title={`Unnamed ${entity.type} ${entity.bbid}`}>(unnamed)</span>;
	}
	return 'Unnamed';
}

export function getEditionReleaseDate(edition) {
	const hasReleaseEvents = edition.releaseEventSet &&
		edition.releaseEventSet.releaseEvents &&
		edition.releaseEventSet.releaseEvents.length;

	if (hasReleaseEvents) {
		return transformISODateForDisplay(edition.releaseEventSet.releaseEvents[0].date);
	}

	return '?';
}

export function getEditionPublishers(edition) {
	const hasPublishers = edition.publisherSet &&
		edition.publisherSet.publishers.length > 0;

	if (hasPublishers) {
		return edition.publisherSet.publishers.map(
			(publisher) => (
				<a href={`/publisher/${publisher.bbid}`} key={publisher.bbid}>
					{_get(publisher, 'defaultAlias.name', publisher.bbid)}
				</a>
			)
		);
	}

	return '?';
}

export function getEntityDisambiguation(entity) {
	if (entity.disambiguation) {
		return <small>{` (${entity.disambiguation.comment})`}</small>;
	}

	return null;
}

export function getEntitySecondaryAliases(entity) {
	if (entity.aliasSet && Array.isArray(entity.aliasSet.aliases) && entity.aliasSet.aliases.length > 1) {
		const aliases = entity.aliasSet.aliases
			.filter(item => item.id !== entity.defaultAlias.id)
			.map(item => item.name)
			.join(', ');
		return <h4>{aliases}</h4>;
	}

	return null;
}

export function getEntityUrl(entity) {
	const entityType = _kebabCase(entity.type);
	const entityId = entity.bbid;

	return `/${entityType}/${entityId}`;
}

export const ENTITY_TYPE_ICONS = {
	Area: 'globe',
	Author: 'user',
	Collection: 'grip-vertical',
	Edition: 'book',
	EditionGroup: 'window-restore',
	Editor: 'user-circle',
	Publisher: 'university',
	Work: 'pen-nib'
};

type FASize = FAProps['size'];
export function genEntityIconHTMLElement(entityType: string, size: FASize = '1x', margin = true) {
	const correctCaseEntityType = upperFirst(entityType);
	if (!ENTITY_TYPE_ICONS[correctCaseEntityType]) { return null; }
	return (
		<FontAwesomeIcon
			className={margin ? 'margin-right-0-3' : ''}
			icon={ENTITY_TYPE_ICONS[correctCaseEntityType]}
			size={size}
			title={correctCaseEntityType}
		/>);
}

export function getSortNameOfDefaultAlias(entity) {
	return entity.defaultAlias ? entity.defaultAlias.sortName : '?';
}

export function getISBNOfEdition(entity) {
	if (entity.identifierSet && entity.identifierSet.identifiers) {
		const {identifiers} = entity.identifierSet;
		return identifiers.find(
			identifier =>
				identifier.type.label === 'ISBN-13' || identifier.type.label === 'ISBN-10'
		);
	}
	return null;
}

export function getEditionFormat(entity) {
	return (entity.editionFormat && entity.editionFormat.label) || '?';
}


/**
 * Remove the all relationships which are belongs to given relationshipTypeId.
 *
 * @param {object} entity - Entity with all relationships
 * @param {number} relationshipTypeId - typeId of spacific relationshipType
 * @returns {array} retrun the all relationships after removing the relatioships for given relationshipTypeId
 */
export function filterOutRelationshipTypeById(entity, relationshipTypeId: number) {
	return (Array.isArray(entity.relationships) &&
				entity.relationships.filter((relation) => relation.typeId !== relationshipTypeId)) || [];
}


/**
 * Get an array of all targets from relationships of an entity belongs to given relationshipTypeId
 *
 * @param {object} entity - an entity with all relationships
 * @param {number} relationshipTypeId - typeId of spacific relationshipType
 * @returns {array} Return array of all the targets belongs to entity relationships for given relationshipTypeId
 */
export function getRelationshipTargetByTypeId(entity, relationshipTypeId: number) {
	let targets = [];
	if (Array.isArray(entity.relationships)) {
		targets = entity.relationships
			.filter(
				(relation) => relation.typeId === relationshipTypeId
			)
			.map((relation) => {
				const {target} = relation;
				return target;
			});
	}
	return targets;
}

/**
 * Get an array of all sources from relationships of an entity belongs to given relationshipTypeId
 *
 * @param {object} entity - main entity
 * @param {number} relationshipTypeId - typeId of spacific relationshipType
 * @returns {array} Return array of all the sources belongs to entity relationships for given relationshipTypeId
 */
export function getRelationshipSourceByTypeId(entity, relationshipTypeId: number) {
	let sources = [];
	if (Array.isArray(entity.relationships)) {
		sources = entity.relationships
			.filter(
				(relation) => relation.typeId === relationshipTypeId
			)
			.map((relation) => {
				const {source} = relation;
				return source;
			});
	}
	return sources;
}

export const deletedEntityMessage = (
	<p>
		This entity has been deleted by an editor.
		This is most likely because it was added accidentally or incorrectly.
		<br/>The edit history has been preserved, and you can see the revisions by clicking the history button below.
		<br/>If you’re sure this entity should still exist, you will be able to
		restore it to a previous revision in a future version of BookBrainz, but that’s not quite ready yet.
	</p>
);
