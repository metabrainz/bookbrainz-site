/*
 * Copyright (C) 2021  Akash Gupta
 *
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


import {get, validatePositiveInteger} from './base';
import {
	validateAliases,
	validateIdentifiers,
	validateNameSection,
	validateSubmissionSection
} from './common';

import _ from 'lodash';
import type {_IdentifierType} from '../../../types';


export function validateSeriesSectionOrderingType(value: any): boolean {
	return validatePositiveInteger(value, true);
}

export function validateSeriesSectionEntityType(value: any): boolean {
	const entity = ['Author', 'Work', 'Edition', 'EditionGroup', 'Publisher'];
	return entity.includes(value);
}

export function validateSeriesSection(data: any): boolean {
	return (
		validateSeriesSectionOrderingType(get(data, 'orderType', null)) &&
		validateSeriesSectionEntityType(get(data, 'seriesType', null))

	);
}

export function validateForm(
	formData: any, identifierTypes?: Array<_IdentifierType> | null | undefined
): boolean {
	const conditions = [
		validateAliases(get(formData, 'aliasEditor', {})),
		validateIdentifiers(
			get(formData, 'identifierEditor', {}), identifierTypes
		),
		validateNameSection(get(formData, 'nameSection', {})),
		validateSeriesSection(get(formData, 'seriesSection', {})),
		validateSubmissionSection(get(formData, 'submissionSection', {}))
	];

	return _.every(conditions);
}
