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
			bbid: work.bbid,
			defaultAlias: {
				name: work.defaultAlias.name,
				sortName: work.defaultAlias.sortName,
				aliasLanguage: work.defaultAlias.language.name
			},
			disambiguation: work.disambiguation ?
				work.disambiguation.comment : null,
			languages: work.languageSet ?
				work.languageSet.languages.map((language) => language.name) : null,
			workType: work.workType.label,
			entityType: work.type ? work.type : null
		};
}

export function getWorkAliases(work: object) { 
	return _.isNil(work) ? null :
		{
			bbid: work.bbid,
			aliases: work.aliasSet.aliases.map((alias) => {
				return {
					name: alias.name,
					sortName: alias.sortName,
					aliasLanguage: alias.language.name,
					primary: alias.primary
				};
			})
		};
}

export function getWorkIdentifiers(work: object) {
	return _.isNil(work) ? null :
		{
			bbid: work.bbid,
			identifiers: work.identifierSet.identifiers.map((identifier) => {
				return {
					type: identifier.type.label,
					value: identifier.value
				};
			})
		};
}
