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
	validateCreatorSection,
	validateCreatorSectionBeginArea,
	validateCreatorSectionBeginDate,
	validateCreatorSectionEndArea,
	validateCreatorSectionEndDate,
	validateCreatorSectionEnded,
	validateCreatorSectionGender,
	validateCreatorSectionType,
	validateForm
} from '../../../../../src/client/entity-editor/validators/creator';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateCreatorSectionBeginArea() {
	testValidateAreaFunc(validateCreatorSectionBeginArea, false);
}

function describeValidateCreatorSectionEndArea() {
	testValidateAreaFunc(validateCreatorSectionEndArea, false);
}

function describeValidateCreatorSectionBeginDate() {
	testValidateDateFunc(validateCreatorSectionBeginDate, false);
}

function describeValidateCreatorSectionEndDate() {
	testValidateEndDateFunc(validateCreatorSectionEndDate, false);
}

function describeValidateCreatorSectionEnded() {
	testValidateBooleanFunc(validateCreatorSectionEnded, false);
}

function describeValidateCreatorSectionType() {
	testValidatePositiveIntegerFunc(validateCreatorSectionType, false);
}

function describeValidateCreatorSectionGender() {
	testValidatePositiveIntegerFunc(validateCreatorSectionGender, false);
}

const VALID_CREATOR_SECTION = {
	beginArea: null,
	beginDate: null,
	endArea: null,
	endDate: null,
	ended: true,
	gender: 1,
	type: 1
};
const INVALID_CREATOR_SECTION = {...VALID_CREATOR_SECTION, type: {}};

function describeValidateCreatorSection() {
	it('should pass a valid Object', () => {
		const result = validateCreatorSection(VALID_CREATOR_SECTION);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validateCreatorSection(
			Immutable.fromJS(VALID_CREATOR_SECTION)
		);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid area', () => {
		const result = validateCreatorSection({
			...VALID_CREATOR_SECTION,
			beginArea: {id: null}
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid begin date', () => {
		const result = validateCreatorSection({
			...VALID_CREATOR_SECTION,
			beginDate: '201'
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid area', () => {
		const result = validateCreatorSection({
			...VALID_CREATOR_SECTION,
			endArea: {id: null}
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid end date', () => {
		const result = validateCreatorSection({
			...VALID_CREATOR_SECTION,
			endDate: '201'
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid ended flag', () => {
		const result = validateCreatorSection({
			...VALID_CREATOR_SECTION,
			ended: 1
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid type', () => {
		const result = validateCreatorSection({
			...VALID_CREATOR_SECTION,
			type: {}
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid gender', () => {
		const result = validateCreatorSection({
			...VALID_CREATOR_SECTION,
			gender: {}
		});
		expect(result).to.be.false;
	});

	it('should reject an invalid Immutable.Map', () => {
		const result = validateCreatorSection(
			Immutable.fromJS(INVALID_CREATOR_SECTION)
		);
		expect(result).to.be.false;
	});

	it('should pass any other non-null data type', () => {
		const result = validateCreatorSection(1);
		expect(result).to.be.true;
	});

	it('should pass a null value', () => {
		const result = validateCreatorSection(null);
		expect(result).to.be.true;
	});
}


function describeValidateForm() {
	const validForm = {
		aliasEditor: VALID_ALIASES,
		creatorSection: VALID_CREATOR_SECTION,
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

	it('should reject an Object with an invalid creator section', () => {
		const result = validateForm(
			{
				...validForm,
				creatorSection: INVALID_CREATOR_SECTION
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
		creatorSection: INVALID_CREATOR_SECTION

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
		'validateCreatorSectionBeginArea',
		describeValidateCreatorSectionBeginArea
	);
	describe(
		'validateCreatorSectionBeginDate',
		describeValidateCreatorSectionBeginDate
	);
	describe(
		'validateCreatorSectionEndArea',
		describeValidateCreatorSectionEndArea
	);
	describe(
		'validateCreatorSectionEndDate',
		describeValidateCreatorSectionEndDate
	);
	describe(
		'validateCreatorSectionEnded',
		describeValidateCreatorSectionEnded
	);
	describe(
		'validateCreatorSectionGender',
		describeValidateCreatorSectionGender
	);
	describe(
		'validateCreatorSectionType',
		describeValidateCreatorSectionType
	);
	describe(
		'validateCreatorSection',
		describeValidateCreatorSection
	);
	describe(
		'validateForm',
		describeValidateForm
	);
}

describe('validateCreatorSection* functions', tests);
