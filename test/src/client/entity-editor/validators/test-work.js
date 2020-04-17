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
	validateForm,
	validateWorkSection,
	validateWorkSectionLanguage,
	validateWorkSectionType
} from '../../../../../src/client/entity-editor/validators/work';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {testValidatePositiveIntegerFunc} from './helpers';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateWorkSectionLanguage() {
	const validLanguage = {value: 1};

	it('should pass a valid Object', () => {
		const result = validateWorkSectionLanguage(validLanguage);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validateWorkSectionLanguage(
			Immutable.fromJS(validLanguage)
		);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid value', () => {
		const result = validateWorkSectionLanguage(
			{...validLanguage, value: 'bad'}
		);
		expect(result).to.be.false;
	});

	const invalidLanguage = {value: 'bad'};

	it('should reject an invalid Immutable.Map', () => {
		const result = validateWorkSectionLanguage(
			Immutable.fromJS(invalidLanguage)
		);
		expect(result).to.be.false;
	});

	it('should reject any other non-null data type', () => {
		const result = validateWorkSectionLanguage(1);
		expect(result).to.be.false;
	});

	it('should pass a null value', () => {
		const result = validateWorkSectionLanguage(null);
		expect(result).to.be.true;
	});
}

function describeValidateWorkSectionType() {
	testValidatePositiveIntegerFunc(validateWorkSectionType, false);
}

const VALID_WORK_SECTION = {
	language: {value: 1},
	type: 1
};
const INVALID_WORK_SECTION = {...VALID_WORK_SECTION, type: {}};

function describeValidateWorkSection() {
	it('should pass a valid Object', () => {
		const result = validateWorkSection(VALID_WORK_SECTION);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validateWorkSection(
			Immutable.fromJS(VALID_WORK_SECTION)
		);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid language', () => {
		const result = validateWorkSection({
			...VALID_WORK_SECTION,
			language: {value: 'bad'}
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid type', () => {
		const result = validateWorkSection({
			...VALID_WORK_SECTION,
			type: {}
		});
		expect(result).to.be.false;
	});

	it('should reject an invalid Immutable.Map', () => {
		const result = validateWorkSection(
			Immutable.fromJS(INVALID_WORK_SECTION)
		);
		expect(result).to.be.false;
	});

	it('should pass any other non-null data type', () => {
		const result = validateWorkSection(1);
		expect(result).to.be.true;
	});

	it('should pass a null value', () => {
		const result = validateWorkSection(null);
		expect(result).to.be.true;
	});
}

function describeValidateForm() {
	const validForm = {
		aliasEditor: VALID_ALIASES,
		identifierEditor: VALID_IDENTIFIERS,
		nameSection: VALID_NAME_SECTION,
		submissionSection: VALID_SUBMISSION_SECTION,
		workSection: VALID_WORK_SECTION
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

	it('should reject an Object with an invalid work section', () => {
		const result = validateForm(
			{
				...validForm,
				workSection: INVALID_WORK_SECTION
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
		nameSection: INVALID_NAME_SECTION
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
		'validateWorkSectionLanguage',
		describeValidateWorkSectionLanguage
	);
	describe(
		'validateWorkSectionType',
		describeValidateWorkSectionType
	);
	describe(
		'validateWorkSection',
		describeValidateWorkSection
	);
	describe(
		'validateForm',
		describeValidateForm
	);
}

describe('validateWorkSection* functions', tests);
