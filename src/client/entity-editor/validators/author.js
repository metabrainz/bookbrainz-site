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

import {dateIsBefore, get, validateDate, validatePositiveInteger} from './base';
import {
	validateAliases,
	validateIdentifiers,
	validateNameSection,
	validateSubmissionSection
} from './common';

import _ from 'lodash';
import type {_IdentifierType} from '../../../types';

export function validateAuthorSectionBeginArea(value: any): boolean {
	if (!value) {
		return true;
	}

	return validatePositiveInteger(get(value, 'id', null), true);
}

export function validateAuthorSectionBeginDate(value: any): boolean {
	return validateDate(value);
}

export function validateAuthorSectionEndArea(value: any): boolean {
	if (!value) {
		return true;
	}

	return validatePositiveInteger(get(value, 'id', null), true);
}

export function validateAuthorSectionEndDate(
	beginValue: any, endValue: any
): boolean {
	return validateDate(endValue) && dateIsBefore(beginValue, endValue);
}

export function validateAuthorSectionEnded(value: any): boolean {
	return _.isNull(value) || _.isBoolean(value);
}

export function validateAuthorSectionType(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateAuthorSectionGender(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateAuthorSection(data: any): boolean {
	return (
		validateAuthorSectionBeginArea(get(data, 'beginArea', null)) &&
		validateAuthorSectionBeginDate(get(data, 'beginDate', null)) &&
		validateAuthorSectionEndArea(get(data, 'endArea', null)) &&
		validateAuthorSectionEndDate(
			get(data, 'beginDate', null), get(data, 'endDate', null)
		) &&
		validateAuthorSectionEnded(get(data, 'ended', null)) &&
		validateAuthorSectionType(get(data, 'gender', null)) &&
		validateAuthorSectionType(get(data, 'type', null))
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
		validateAuthorSection(get(formData, 'authorSection', {})),
		validateSubmissionSection(get(formData, 'submissionSection', {}))
	];

	return _.every(conditions);
}
