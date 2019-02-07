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
/* eslint-disable react/display-name */

import * as bootstrap from 'react-bootstrap';

import FontAwesome from 'react-fontawesome';
import React from 'react';
import _ from 'lodash';


const {Button, Table} = bootstrap;

export function extractAttribute(attr, path) {
	if (attr) {
		if (path) {
			return _.get(attr, path, '?');
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

export function getDateAttributes(entity) {
	const attributes = [{
		data: extractAttribute(entity.beginDate),
		title: 'Begin Date'
	}];
	if (entity.ended) {
		attributes.push({
			data: extractAttribute(entity.endDate),
			title: 'End Date'
		});
	}
	return attributes;
}

export function showEntityEditions(entity) {
	return (
		<div>
			<h2>
				Editions
				<Button
					bsStyle="success"
					className="pull-right"
					href={`/edition/create?${
						entity.type.toLowerCase()}=${entity.bbid}`}
				>
					<FontAwesome name="plus"/>
					{'  Add Edition'}
				</Button>
			</h2>
			<Table striped>
				<thead>
					<tr>
						<th>Name</th>
						<th>Release Date</th>
					</tr>
				</thead>
				<tbody>
					{entity.editions.map((edition) => {
						const editionName = edition.defaultAlias ?
							edition.defaultAlias.name : '(unnamed)';
						const editionComment = edition.disambiguation &&
							edition.disambiguation.comment ?
							` (${edition.disambiguation.comment})` : '';
						const releaseEventDate = (edition.releaseEventSet &&
							edition.releaseEventSet.releaseEvents &&
							edition.releaseEventSet.releaseEvents[0]) &&
							edition.releaseEventSet.releaseEvents[0].date;
						return (
							<tr
								key={`${edition.bbid}`}
							>
								<td>
									<a href={`/edition/${edition.bbid}`}>
										{editionName}
									</a>
									<span className="text-muted">
										{editionComment}
									</span>
								</td>
								<td>
									{releaseEventDate}
								</td>
							</tr>
						);
					})}
				</tbody>
			</Table>
		</div>
	);
}

export function getEntityLabel(entity) {
	if (entity.revision && !entity.revision.dataId) {
		return `${entity.type} ${entity.bbid}`;
	}

	if (entity.defaultAlias) {
		return `${entity.defaultAlias.name} `;
	}

	return '(unnamed)';
}

export function getEditionReleaseDate(edition) {
	const hasReleaseEvents = edition.releaseEventSet &&
		edition.releaseEventSet.releaseEvents &&
		edition.releaseEventSet.releaseEvents.length;

	if (hasReleaseEvents) {
		return edition.releaseEventSet.releaseEvents[0].date;
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
					{publisher.defaultAlias.name}
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
	const entityType = entity.type.toLowerCase();
	const entityId = entity.bbid;

	return `/${entityType}/${entityId}`;
}

export const ENTITY_TYPE_ICONS = {
	Area: 'globe',
	Creator: 'user',
	Edition: 'book',
	Publication: 'window-restore',
	Publisher: 'university',
	Work: 'pen-nib'
};

export function genEntityIconHTMLElement(entityType, size = '', margin = true) {
	if (!ENTITY_TYPE_ICONS[entityType]) { return null; }
	return (
		<FontAwesome
			ariaLabel={entityType}
			className={margin ? 'margin-right-0-5' : ''}
			name={ENTITY_TYPE_ICONS[entityType]}
			size={size}
		/>);
}

export function getSortNameOfDefaultAlias(entity) {
	return entity.defaultAlias.sortName;
}

export function getISBNOfEdition(entity) {
	if (entity.identifierSetId) {
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

// relationshipTypeId = 10 refers the relation (<Work> is contained by <Edition>)
const relationshipTypeId = 10;

/**
 * Filter the relationship according to relationshipTypeId
 *
 * @param {object} entity - Entity with all relationships
 * @returns {object} retrun the all relationshiops after removing the relatioship with relationshipTypeId = 10
 */
export function getFilteredRelationship(entity) {
	return entity.relationships.filter((relation) => relation.typeId !== relationshipTypeId);
}


/**
 * Get all works constained by entity according to relationshipTypeId
 *
 * @param {object} entity - Edition with all relationships
 * @returns {object} Return all the works of Edition with relationshipTypeId = 10
 */
export function getWorksContainedByEdition(entity) {
	let works = null;
	if (entity.relationships) {
		works = entity.relationships
			.filter(
				(relation) => relation.typeId === relationshipTypeId
			)
			.map((relation) => {
				const {target} = relation;
				return target;
			});
	}
	return {bbid: entity.bbid, type: entity.type, works};
}

/**
 * Get all editions who contains the work according to relationshipTypeId
 *
 * @param {object} entity - Work with all relationships
 * @returns {object} Return all the editions related to woork with relationshipTypeId = 10
 */
export function getEditionsContainsWork(entity) {
	let editions = null;
	if (entity.relationships) {
		editions = entity.relationships
			.filter(
				(relation) => relation.typeId === relationshipTypeId
			)
			.map((relation) => {
				const {source} = relation;
				return source;
			});
	}
	return {bbid: entity.bbid, editions, type: entity.type};
}
