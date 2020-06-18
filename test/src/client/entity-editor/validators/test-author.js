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

import * as Immutable from 'immutable';

import {
	EMPTY_SUBMISSION_SECTION,
	IDENTIFIER_TYPES,
	INVALID_ALIASES,
	INVALID_IDENTIFIERS,
	INVALID_NAME_SECTION,
	VALID_ALIASES,
	VALID_IDENTIFIERS,
	VALID_NAME_SECTION,
	VALID_SUBMISSION_SECTION
} from './data';
import {
	testValidateAreaFunc,
	testValidateBooleanFunc,
	testValidateDateFunc,
	testValidateEndDateFunc,
	testValidatePositiveIntegerFunc
} from './helpers';
import {
	validateAuthorSection,
	validateAuthorSectionBeginArea,
	validateAuthorSectionBeginDate,
	validateAuthorSectionEndArea,
	validateAuthorSectionEndDate,
	validateAuthorSectionEnded,
	validateAuthorSectionGender,
	validateAuthorSectionType,
	validateForm
} from '../../../../../src/client/entity-editor/validators/author';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateAuthorSectionBeginArea() {
	testValidateAreaFunc(validateAuthorSectionBeginArea, false);
}

function describeValidateAuthorSectionEndArea() {
	testValidateAreaFunc(validateAuthorSectionEndArea, false);
}

function describeValidateAuthorSectionBeginDate() {
	testValidateDateFunc(validateAuthorSectionBeginDate, false);
}

function describeValidateAuthorSectionEndDate() {
	testValidateEndDateFunc(validateAuthorSectionEndDate, false);
}

function describeValidateAuthorSectionEnded() {
	testValidateBooleanFunc(validateAuthorSectionEnded, false);
}

function describeValidateAuthorSectionType() {
	testValidatePositiveIntegerFunc(validateAuthorSectionType, false);
}

function describeValidateAuthorSectionGender() {
	testValidatePositiveIntegerFunc(validateAuthorSectionGender, false);
}

const VALID_AUTHOR_SECTION = {
	beginArea: null,
	beginDate: '',
	endArea: null,
	endDate: '',
	ended: true,
	gender: 1,
	type: 1
};
const INVALID_AUTHOR_SECTION = {...VALID_AUTHOR_SECTION, type: {}};

function describeValidateAuthorSection() {
	it('should pass a valid Object', () => {
		const result = validateAuthorSection(VALID_AUTHOR_SECTION);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validateAuthorSection(
			Immutable.fromJS(VALID_AUTHOR_SECTION)
		);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid area', () => {
		const result = validateAuthorSection({
			...VALID_AUTHOR_SECTION,
			beginArea: {id: null}
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid begin date', () => {
		const result = validateAuthorSection({
			...VALID_AUTHOR_SECTION,
			beginDate: {day: '100', month: '21', year: '2012'}
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid area', () => {
		const result = validateAuthorSection({
			...VALID_AUTHOR_SECTION,
			endArea: {id: null}
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid end date', () => {
		const result = validateAuthorSection({
			...VALID_AUTHOR_SECTION,
			endDate: {day: '', month: '', year: 'aaaa'}
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid ended flag', () => {
		const result = validateAuthorSection({
			...VALID_AUTHOR_SECTION,
			ended: 1
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid type', () => {
		const result = validateAuthorSection({
			...VALID_AUTHOR_SECTION,
			type: {}
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid gender', () => {
		const result = validateAuthorSection({
			...VALID_AUTHOR_SECTION,
			gender: {}
		});
		expect(result).to.be.false;
	});

	it('should reject an invalid Immutable.Map', () => {
		const result = validateAuthorSection(
			Immutable.fromJS(INVALID_AUTHOR_SECTION)
		);
		expect(result).to.be.false;
	});

	it('should pass any other non-null data type', () => {
		const result = validateAuthorSection(1);
		expect(result).to.be.true;
	});

	it('should pass a empty value  object', () => {
		const result = validateAuthorSection({day: '', month: '', year: ''});
		expect(result).to.be.true;
	});
}


function describeValidateForm() {
	const validForm = {
		aliasEditor: VALID_ALIASES,
		authorSection: VALID_AUTHOR_SECTION,
		identifierEditor: VALID_IDENTIFIERS,
		nameSection: VALID_NAME_SECTION,
		submissionSection: VALID_SUBMISSION_SECTION
	};

	it('should pass a valid Object', () => {
		const result = validateForm(validForm, IDENTIFIER_TYPES);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validateForm(
			Immutable.fromJS(validForm),
			IDENTIFIER_TYPES
		);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid alias editor', () => {
		const result = validateForm(
			{
				...validForm,
				aliasEditor: INVALID_ALIASES
			},
			IDENTIFIER_TYPES
		);
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid identifier editor', () => {
		const result = validateForm(
			{
				...validForm,
				identifierEditor: INVALID_IDENTIFIERS
			}, IDENTIFIER_TYPES
		);
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid name section', () => {
		const result = validateForm(
			{
				...validForm,
				nameSection: INVALID_NAME_SECTION
			},
			IDENTIFIER_TYPES
		);
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid author section', () => {
		const result = validateForm(
			{
				...validForm,
				authorSection: INVALID_AUTHOR_SECTION
			},
			IDENTIFIER_TYPES
		);
		expect(result).to.be.false;
	});

	it('should pass an Object with an empty submission section', () => {
		const result = validateForm(
			{
				...validForm,
				submissionSection: EMPTY_SUBMISSION_SECTION
			},
			IDENTIFIER_TYPES
		);
		expect(result).to.be.true;
	});

	const invalidForm = {
		...validForm,
		authorSection: INVALID_AUTHOR_SECTION

	};

	it('should reject an invalid Immutable.Map', () => {
		const result = validateForm(
			Immutable.fromJS(invalidForm),
			IDENTIFIER_TYPES
		);
		expect(result).to.be.false;
	});

	it('should reject any other non-null data type', () => {
		const result = validateForm(1, IDENTIFIER_TYPES);
		expect(result).to.be.false;
	});

	it('should reject a null value', () => {
		const result = validateForm(null, IDENTIFIER_TYPES);
		expect(result).to.be.false;
	});
}


function tests() {
	describe(
		'validateAuthorSectionBeginArea',
		describeValidateAuthorSectionBeginArea
	);
	describe(
		'validateAuthorSectionBeginDate',
		describeValidateAuthorSectionBeginDate
	);
	describe(
		'validateAuthorSectionEndArea',
		describeValidateAuthorSectionEndArea
	);
	describe(
		'validateAuthorSectionEndDate',
		describeValidateAuthorSectionEndDate
	);
	describe(
		'validateAuthorSectionEnded',
		describeValidateAuthorSectionEnded
	);
	describe(
		'validateAuthorSectionGender',
		describeValidateAuthorSectionGender
	);
	describe(
		'validateAuthorSectionType',
		describeValidateAuthorSectionType
	);
	describe(
		'validateAuthorSection',
		describeValidateAuthorSection
	);
	describe(
		'validateForm',
		describeValidateForm
	);
}

describe('validateAuthorSection* functions', tests);
