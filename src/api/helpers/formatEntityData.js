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

/* eslint-disable */
import _ from 'lodash';

function getDefaultAlias(entity: object){
	return {
		name: _.get(entity, 'defaultAlias.name', null),
		sortName: _.get(entity, 'defaultAlias.sortName', null),
		aliasLanguage: _.get(entity, 'defaultAlias.language.name', null)
	}
}

function getLanguages(entity: object) {
	return _.get(entity, 'languageSet.languages', []).map((language) => language.name)
}

export function getWorkBasicInfo(work: object) {
	return _.isNil(work) ? null :
		{
			bbid: _.get(work, 'bbid', null),
			defaultAlias: getDefaultAlias(work),
			disambiguation: _.get(work, 'disambiguation.comment', null),
			languages: getLanguages(work),
			workType: _.get(work, 'workType.label', null),
			entityType: _.get(work, 'type', null)
		};
}

export function getEditionBasicInfo(edition: object) {
	
	return _.isNil(edition) ? null :
	{
		bbid: _.get(edition, 'bbid', null),
		defaultAlias: getDefaultAlias(edition),
		languages: getLanguages(edition),
		disambiguation: _.get(edition, 'disambiguation.comment', null),
		hight: _.get(edition, 'hight', null),
		width: _.get(edition, 'width', null),
		depth: _.get(edition, 'depth', null),
		pages: _.get(edition, 'pages', null),
		releaseEventDates: _.get(edition, 'releaseEventSet.releaseEvents', []).map((event) => event.date),
		editionFormat: _.get(edition, 'editionFormat.label', null),
		weight: _.get(edition, 'weight', null),
		status: _.get(edition, 'editionStatus.label', null)
	}
}

export function getEditionGroupBasicInfo(editionGroup: object) {
	return _.isNil(editionGroup) ? null :
	{
		bbid: _.get(editionGroup, 'bbid', null),
		defaultAlias: getDefaultAlias(editionGroup),
		disambiguation: _.get(editionGroup, 'disambiguation.comment', null),
		type: _.get(editionGroup, 'editionGroupType.label')
	}
}

export function getAuthorBasicInfo(author: object) {
	return _.isNil(author) ? null : 
	{
		bbid: _.get(author, 'bbid', null),
		defaultAlias: getDefaultAlias(author),
		disambiguation: _.get(author, 'disambiguation.comment', null),
		type: _.get(author, 'authorType.label', null),
		gender: _.get(author, 'gender.name', null),
		beginArea: _.get(author, 'beginArea.name', null),
		beginDate: _.get(author, 'beginDate', null),
		ended: _.get(author, 'ended', null),
		endArea: _.get(author, 'endArea.name', null),
		endDate: _.get(author, 'endDate', null)
	}
}

export function getPublisherBasicInfo(publisher: object) {
	return _.isNil(publisher) ? null : 
	{
		bbid: _.get(publisher, 'bbid', null),
		defaultAlias: getDefaultAlias(publisher),
		disambiguation: _.get(publisher, 'disambiguation.comment', null),
		type: _.get(publisher, 'publisherType.label', null),
		area: _.get(publisher, 'area.name', null),
		beginDate: _.get(publisher, 'beginDate', null),
		ended: _.get(publisher, 'ended', null),
		endDate: _.get(publisher, 'endDate', null)
	}
}

export function getEntityAliases(entity: object) {
	return _.isNil(entity) ? null :
		{
			bbid: _.get(entity, 'bbid', null),
			aliases: _.get(entity, 'aliasSet.aliases', []).map((alias) => {
				return {
					name: _.get(alias, 'name', null),
					sortName: _.get(alias, 'sortName', null),
					aliasLanguage: _.get(alias, 'language.name', null),
					primary: _.get(alias, 'primary', null)
				};
			})
		};
}

export function getEntityIdentifiers(entity: object) {
	return _.isNil(entity) ? null :
		{
			bbid: _.get(entity, 'bbid', null),
			identifiers: _.get(entity, 'identifierSet.identifiers', []).map((identifier) => {
				return {
					type: _.get(identifier, 'type.label', null),
					value: _.get(identifier, 'value', null)
				};
			})
		};
}
