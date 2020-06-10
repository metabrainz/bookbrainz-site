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

import {get, validateDate, validatePositiveInteger, validateUUID} from './base';
import {
	validateAliases,
	validateAuthorCreditSection,
	validateIdentifiers,
	validateNameSection,
	validateSubmissionSection
} from './common';

import {Iterable} from 'immutable';
import _ from 'lodash';
import type {_IdentifierType} from '../../../types';


export function validateEditionSectionDepth(value: ?any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionSectionFormat(value: ?any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionSectionHeight(value: ?any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionSectionLanguage(value: ?any): boolean {
	return validatePositiveInteger(get(value, 'value', null), true);
}

export function validateEditionSectionLanguages(values: ?any): boolean {
	if (!values) {
		return true;
	}

	let every = (object, predicate) => _.every(object, predicate);
	if (Iterable.isIterable(values)) {
		every = (object, predicate) => object.every(predicate);
	}
	else if (!_.isObject(values)) {
		return false;
	}

	return every(values, (value) => validateEditionSectionLanguage(value));
}

export function validateEditionSectionPages(value: ?any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionSectionEditionGroup(value: ?any, editionGroupRequired: ?boolean): boolean {
	return validateUUID(get(value, 'id', null), editionGroupRequired);
}

export function validateEditionSectionPublisher(value: ?any): boolean {
	if (!value) {
		return true;
	}

	return validateUUID(get(value, 'id', null), true);
}

export function validateEditionSectionReleaseDate(value: ?any): boolean {
	const {isValid, errorMessage} = validateDate(value);
	return {errorMessage, isValid};
}

export function validateEditionSectionStatus(value: ?any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionSectionWeight(value: ?any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionSectionWidth(value: ?any): boolean {
	return validatePositiveInteger(value);
}

export function validateEditionSection(data: any): boolean {
	return (
		validateEditionSectionDepth(get(data, 'depth', null)) &&
		validateEditionSectionFormat(get(data, 'format', null)) &&
		validateEditionSectionHeight(get(data, 'height', null)) &&
		validateEditionSectionLanguages(get(data, 'languages', null)) &&
		validateEditionSectionPages(get(data, 'pages', null)) &&
		validateEditionSectionEditionGroup(
			get(data, 'editionGroup', null),
			get(data, 'editionGroupRequired', null) || get(data, 'matchingNameEditionGroups', []).length
		) &&
		validateEditionSectionPublisher(get(data, 'publisher', null)) &&
		validateEditionSectionReleaseDate(get(data, 'releaseDate', null)).isValid &&
		validateEditionSectionStatus(get(data, 'status', null)) &&
		validateEditionSectionWeight(get(data, 'weight', null)) &&
		validateEditionSectionWidth(get(data, 'width', null))
	);
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
		validateAuthorCreditSection(get(formData, 'authorCreditEditor', {})),
		validateSubmissionSection(get(formData, 'submissionSection', {}))
	];

	return _.every(conditions);
}
