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

// @flow


import _ from 'lodash';


function getDefaultAlias(entity: object) {
	return {
		aliasLanguage: _.get(entity, 'defaultAlias.language.name', null),
		name: _.get(entity, 'defaultAlias.name', null),
		sortName: _.get(entity, 'defaultAlias.sortName', null)
	};
}

function getLanguages(entity: object) {
	return _.get(entity, 'languageSet.languages', []).map((language) => language.name);
}

export function getWorkBasicInfo(work: object) {
	return _.isNil(work) ? null :
		{
			bbid: _.get(work, 'bbid', null),
			defaultAlias: getDefaultAlias(work),
			disambiguation: _.get(work, 'disambiguation.comment', null),
			entityType: _.get(work, 'type', null),
			languages: getLanguages(work),
			workType: _.get(work, 'workType.label', null)
		};
}

export function getEditionBasicInfo(edition: object) {
	return _.isNil(edition) ? null :
		{
			bbid: _.get(edition, 'bbid', null),
			defaultAlias: getDefaultAlias(edition),
			depth: _.get(edition, 'depth', null),
			disambiguation: _.get(edition, 'disambiguation.comment', null),
			editionFormat: _.get(edition, 'editionFormat.label', null),
			hight: _.get(edition, 'hight', null),
			languages: getLanguages(edition),
			pages: _.get(edition, 'pages', null),
			releaseEventDates: _.get(edition, 'releaseEventSet.releaseEvents', []).map((event) => event.date),
			status: _.get(edition, 'editionStatus.label', null),
			weight: _.get(edition, 'weight', null),
			width: _.get(edition, 'width', null)
		};
}

export function getEditionGroupBasicInfo(editionGroup: object) {
	return _.isNil(editionGroup) ? null :
		{
			bbid: _.get(editionGroup, 'bbid', null),
			defaultAlias: getDefaultAlias(editionGroup),
			disambiguation: _.get(editionGroup, 'disambiguation.comment', null),
			type: _.get(editionGroup, 'editionGroupType.label')
		};
}

export function getAuthorBasicInfo(author: object) {
	return _.isNil(author) ? null :
		{
			bbid: _.get(author, 'bbid', null),
			beginArea: _.get(author, 'beginArea.name', null),
			beginDate: _.get(author, 'beginDate', null),
			defaultAlias: getDefaultAlias(author),
			disambiguation: _.get(author, 'disambiguation.comment', null),
			endArea: _.get(author, 'endArea.name', null),
			endDate: _.get(author, 'endDate', null),
			ended: _.get(author, 'ended', null),
			gender: _.get(author, 'gender.name', null),
			type: _.get(author, 'authorType.label', null)
		};
}

export function getPublisherBasicInfo(publisher: object) {
	return _.isNil(publisher) ? null :
		{
			area: _.get(publisher, 'area.name', null),
			bbid: _.get(publisher, 'bbid', null),
			beginDate: _.get(publisher, 'beginDate', null),
			defaultAlias: getDefaultAlias(publisher),
			disambiguation: _.get(publisher, 'disambiguation.comment', null),
			endDate: _.get(publisher, 'endDate', null),
			ended: _.get(publisher, 'ended', null),
			type: _.get(publisher, 'publisherType.label', null)
		};
}

export function getEntityAliases(entity: object) {
	return _.isNil(entity) ? null :
		{
			aliases: _.get(entity, 'aliasSet.aliases', []).map((alias) => ({
				aliasLanguage: _.get(alias, 'language.name', null),
				name: _.get(alias, 'name', null),
				primary: _.get(alias, 'primary', null),
				sortName: _.get(alias, 'sortName', null)
			})),
			bbid: _.get(entity, 'bbid', null)
		};
}

export function getEntityIdentifiers(entity: object) {
	return _.isNil(entity) ? null :
		{
			bbid: _.get(entity, 'bbid', null),
			identifiers: _.get(entity, 'identifierSet.identifiers', []).map((identifier) => ({
				type: _.get(identifier, 'type.label', null),
				value: _.get(identifier, 'value', null)
			}))
		};
}


export function getEntityRelationships(entity: object) {
	return _.isNil(entity) ? null :
		{
			bbid: _.get(entity, 'bbid', null),
			relationships: _.get(entity, 'relationshipSet.relationships', []).map((relationship) => {
				const isItSourceEntity = entity.bbid === relationship.sourceBbid;
				return {
					direction: isItSourceEntity ? 'forward' : 'backward',
					id: relationship.id,
					linkPhrase: isItSourceEntity ?
						_.get(relationship, 'type.linkPhrase', null) :
						_.get(relationship, 'type.reverseLinkPhrase', null),
					relationshipTypeId: _.get(relationship, 'type.id', null),
					relationshipTypeName: _.get(relationship, 'type.label', null),
					targetBbid: isItSourceEntity ?
						_.get(relationship, 'targetBbid', null) :
						_.get(relationship, 'sourceBbid', null),
					targetEntityType: isItSourceEntity ?
						_.get(relationship, 'type.targetEntityType', null) :
						_.get(relationship, 'type.sourceEntityType', null)
				};
			})
		};
}
