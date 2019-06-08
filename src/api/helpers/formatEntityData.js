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
		editionFormat: _.get(edition, 'editioFormat.label', null),
		weight: _.get(edition, 'waight', null),
		status: _.get(edition, 'editionStatus.label', null)
	}
}

export function getEntityAliases(work: object) { 
	return _.isNil(work) ? null :
		{
			bbid: _.get(work, 'bbid', null),
			aliases: _.get(work, 'aliasSet.aliases', []).map((alias) => {
				return {
					name: alias.name,
					sortName: alias.sortName,
					aliasLanguage: alias.language.name,
					primary: alias.primary
				};
			})
		};
}

export function getEntityIdentifiers(work: object) {
	return _.isNil(work) ? null :
		{
			bbid: _.get(work, 'bbid', null),
			identifiers: _.get(work, 'identifierSet.identifiers', []).map((identifier) => {
				return {
					type: identifier.type.label,
					value: identifier.value
				};
			})
		};
}
