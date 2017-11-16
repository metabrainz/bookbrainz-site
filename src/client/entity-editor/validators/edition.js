/*
 * Copyright (C) 2017  Ben Ockmore
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

import {get, validateDate, validatePositiveInteger} from './base';
import {
	validateAliases, validateIdentifiers, validateNameSection,
	validateSubmissionSection
} from './common';
import _ from 'lodash';


export function validateEditionSectionDepth(value: ?any): boolean {
	return true;
}

export function validateEditionSectionFormat(value: ?any): boolean {
	return true;
}

export function validateEditionSectionHeight(value: ?any): boolean {
	return true;
}

export function validateEditionSectionLanguage(value: ?any): boolean {
	return true;
}

export function validateEditionSectionLanguages(data: ?any): boolean {
	return true;
}

export function validateEditionSectionPages(value: ?any): boolean {
	return true;
}

export function validateEditionSectionPublication(value: ?any): boolean {
	return true;
}

export function validateEditionSectionPublisher(value: ?any): boolean {
	return true;
}

export function validateEditionSectionReleaseDate(value: ?any): boolean {
	return true;
}

export function validateEditionSectionStatus(value: ?any): boolean {
	return true;
}

export function validateEditionSectionWeight(value: ?any): boolean {
	return true;
}

export function validateEditionSectionWidth(value: ?any): boolean {
	return true;
}

export function validateEditionSection(data: any): boolean {
	return true;
}

export function validateForm(
	formData: any, identifierTypes?: ?Array<_IdentifierType>
): boolean {
	const conditions = [
		validateAliases(get(formData, 'aliasEditor', {})),
		validateIdentifiers(
			get(formData, 'identifierEditor', {}), identifierTypes
		),
		validateNameSection(get(formData, 'nameSection', {})),
		validateEditionSection(get(formData, 'editionSection', {})),
		validateSubmissionSection(get(formData, 'submissionSection', {}))
	];

	return _.every(conditions);
}
