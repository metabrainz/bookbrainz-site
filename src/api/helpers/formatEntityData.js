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

export function getWorkBasicInfo(work: object) {
	return _.isNil(work) ? null :
		{
			bbid: _.get(work, 'bbid', null),
			defaultAlias: {
				name: _.get(work, 'defaultAlias.name', null),
				sortName: _.get(work, 'defaultAlias.sortName', null),
				aliasLanguage: _.get(work, 'defaultAlias.language.name', null)
			},
			disambiguation: _.get(work, 'disambiguation.comment', null),
			languages: _.get(work, 'languageSet.languages', []).map((language) => language.name),
			workType: _.get(work, 'workType.label', null),
			entityType: _.get(work, 'type', null)
		};
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
