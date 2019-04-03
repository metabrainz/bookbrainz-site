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
	validateAliases, validateIdentifiers, validateNameSection,
	validateSubmissionSection
} from './common';
import _ from 'lodash';
import type {_IdentifierType} from '../../../types';
import {convertMapToObject} from '../../helpers/utils';

export function validateCreatorSectionBeginArea(value: any): boolean {
	if (!value) {
		return true;
	}

	return validatePositiveInteger(get(value, 'id', null), true);
}

export function validateCreatorSectionBeginDate(value: any): object {
	const {isValid, errorMessage} = validateDate(value);
	return {errorMessage, isValid};
}

export function validateCreatorSectionEndArea(value: any): boolean {
	if (!value) {
		return true;
	}

	return validatePositiveInteger(get(value, 'id', null), true);
}

export function validateCreatorSectionEndDate(
	beginValue: any, endValue: any
): object {
	const {isValid, errorMessage} = validateDate(endValue);

	if (isValid) {
		if (dateIsBefore(beginValue, endValue)) {
			return {errorMessage: '', isValid: true};
		}
		return {errorMessage: 'Date of death must be greated than Date of birth', isValid: false};
	}
	return {errorMessage, isValid};
}

export function validateCreatorSectionEnded(value: any): boolean {
	return _.isNull(value) || _.isBoolean(value);
}

export function validateCreatorSectionType(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateCreatorSectionGender(value: any): boolean {
	return validatePositiveInteger(value);
}

export function validateCreatorSection(data: any): boolean {
	return (
		validateCreatorSectionBeginArea(get(data, 'beginArea', null)) &&
		validateCreatorSectionBeginDate(convertMapToObject(get(data, 'beginDate', null))).isValid &&
		validateCreatorSectionEndArea(get(data, 'endArea', null)) &&
		validateCreatorSectionEndDate(
			convertMapToObject(get(data, 'beginDate', null)), convertMapToObject(get(data, 'endDate', null))
		).isValid &&
		validateCreatorSectionEnded(get(data, 'ended', null)) &&
		validateCreatorSectionType(get(data, 'gender', null)) &&
		validateCreatorSectionType(get(data, 'type', null))
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
		validateCreatorSection(get(formData, 'creatorSection', {})),
		validateSubmissionSection(get(formData, 'submissionSection', {}))
	];

	return _.every(conditions);
}
