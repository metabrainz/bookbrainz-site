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

import {
	get,
	getIn,
	validateOptionalString,
	validatePositiveInteger,
	validateRequiredString,
	validateUUID
} from './base';

import {AuthorCredit} from '../author-credit-editor/actions';
import {Iterable} from 'immutable';
import _ from 'lodash';


export function validateMultiple(
	values: any[],
	validationFunction: (value: any, ...rest: any[]) => boolean,
	additionalArgs?: any,
	requiresOneOrMore?: boolean
): boolean {
	if (requiresOneOrMore && _.isEmpty(values)) {
		return false;
	}
	let every = (object, predicate) => _.every(object, predicate);
	if (Iterable.isIterable(values)) {
		every = (object, predicate) => object.every(predicate);
	}
	else if (!_.isObject(values)) {
		return false;
	}

	return every(values, (value) =>
		validationFunction(value, additionalArgs));
}

export function validateAliasName(value: any): boolean {
	return validateRequiredString(value);
}

export function validateAliasSortName(value: any): boolean {
	return validateRequiredString(value);
}

export function validateAliasLanguage(value: any): boolean {
	return validatePositiveInteger(value, true);
}

export function validateAliasPrimary(value: any): boolean {
	return _.isBoolean(value);
}

export function validateAlias(value: any): boolean {
	return (
		validateAliasName(get(value, 'name')) &&
		validateAliasSortName(get(value, 'sortName')) &&
		validateAliasLanguage(get(value, 'language')) &&
		validateAliasPrimary(get(value, 'primary'))
	);
}

export const validateAliases = _.partial(
	validateMultiple, _.partial.placeholder, validateAlias
);

export type IdentifierType = {
	id: number,
	label: string,
	validationRegex: string
};

export function validateIdentifierValue(
	value: any, typeId: unknown, types?: Array<IdentifierType> | null | undefined
): boolean {
	if (!validateRequiredString(value)) {
		return false;
	}

	if (!types) {
		return true;
	}

	const selectedType = _.find(types, (type) => type.id === typeId);

	if (selectedType) {
		return new RegExp(selectedType.validationRegex).test(value);
	}

	return false;
}

export function validateIdentifierType(
	typeId: any, types?: Array<IdentifierType> | null | undefined
): boolean {
	if (!validatePositiveInteger(typeId, true)) {
		return false;
	}

	if (!types) {
		return true;
	}

	const selectedType = _.find(types, (type) => type.id === typeId);

	return Boolean(selectedType);
}

export function validateIdentifier(
	identifier: any, types?: Array<IdentifierType> | null | undefined
): boolean {
	const value = get(identifier, 'value');
	const type = get(identifier, 'type');

	return (
		validateIdentifierValue(value, type, types) &&
		validateIdentifierType(type, types)
	);
}

type ValidateIdentifiersFunc = (identifiers: any[], types?: Array<IdentifierType> | null | undefined) => boolean;
export const validateIdentifiers: ValidateIdentifiersFunc = _.partial(
	validateMultiple, _.partial.placeholder,
	validateIdentifier, _.partial.placeholder
);

export function validateNameSectionName(value: any): boolean {
	return validateRequiredString(value);
}

export function validateNameSectionSortName(value: any): boolean {
	return validateRequiredString(value);
}

export function validateNameSectionLanguage(value: any): boolean {
	return validatePositiveInteger(value, true);
}

export function validateNameSectionDisambiguation(value: any): boolean {
	return validateOptionalString(value);
}

export function validateNameSection(
	values: any
): boolean {
	return (
		validateNameSectionName(get(values, 'name', null)) &&
		validateNameSectionSortName(get(values, 'sortName', null)) &&
		validateNameSectionLanguage(get(values, 'language', null)) &&
		validateNameSectionDisambiguation(get(values, 'disambiguation', null))
	);
}

export function validateSubmissionSectionNote(value: any): boolean {
	return validateOptionalString(value);
}

export function validateSubmissionSectionAnnotation(value: any): boolean {
	return validateOptionalString(value);
}

export function validateSubmissionSection(
	data: any
): boolean {
	return (
		validateSubmissionSectionNote(get(data, 'note', null)) &&
		validateSubmissionSectionAnnotation(get(data, 'annotation.content', null))
	);
}

export function validateAuthorCreditRow(row: any): boolean {
	return validateUUID(getIn(row, ['author', 'id'], null), true) &&
	validateRequiredString(get(row, 'name', null)) &&
	validateOptionalString(get(row, 'joinPhrase', null));
}

export const validateAuthorCreditSection = _.partialRight(
	// Requires at least one Author Credit row or zero in case of optional
	validateMultiple, _.partialRight.placeholder,
	validateAuthorCreditRow, null, _.partialRight.placeholder
);
// In the merge editor we use the authorCredit directly instead of the authorCreditEditor state
export function validateAuthorCreditSectionMerge(authorCredit:AuthorCredit) :boolean {
	return validatePositiveInteger(get(authorCredit, 'id', null), true);
}
