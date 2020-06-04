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
	validateForm,
	validatePublisherSection,
	validatePublisherSectionArea,
	validatePublisherSectionBeginDate,
	validatePublisherSectionEndDate,
	validatePublisherSectionEnded,
	validatePublisherSectionType
} from '../../../../../src/client/entity-editor/validators/publisher';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidatePublisherSectionArea() {
	testValidateAreaFunc(validatePublisherSectionArea, false);
}

function describeValidatePublisherSectionBeginDate() {
	testValidateDateFunc(validatePublisherSectionBeginDate, false);
}

function describeValidatePublisherSectionEndDate() {
	testValidateEndDateFunc(validatePublisherSectionEndDate, false);
}

function describeValidatePublisherSectionEnded() {
	testValidateBooleanFunc(validatePublisherSectionEnded, false);
}

function describeValidatePublisherSectionType() {
	testValidatePositiveIntegerFunc(validatePublisherSectionType, false);
}

const VALID_PUBLISHER_SECTION = {
	area: null,
	beginDate: '',
	endDate: '',
	ended: true,
	type: 1
};
const INVALID_PUBLISHER_SECTION = {...VALID_PUBLISHER_SECTION, type: {}};

function describeValidatePublisherSection() {
	it('should pass a valid Object', () => {
		const result = validatePublisherSection(VALID_PUBLISHER_SECTION);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validatePublisherSection(
			Immutable.fromJS(VALID_PUBLISHER_SECTION)
		);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid area', () => {
		const result = validatePublisherSection({
			...VALID_PUBLISHER_SECTION,
			area: {id: null}
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid begin date', () => {
		const result = validatePublisherSection({
			...VALID_PUBLISHER_SECTION,
			beginDate: {day: '', month: '19', year: '2019'}
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid end date', () => {
		const result = validatePublisherSection({
			...VALID_PUBLISHER_SECTION,
			endDate: {day: '', month: '19', year: '2019'}
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid ended flag', () => {
		const result = validatePublisherSection({
			...VALID_PUBLISHER_SECTION,
			ended: 1
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid type', () => {
		const result = validatePublisherSection({
			...VALID_PUBLISHER_SECTION,
			type: {}
		});
		expect(result).to.be.false;
	});

	it('should reject an invalid Immutable.Map', () => {
		const result = validatePublisherSection(
			Immutable.fromJS(INVALID_PUBLISHER_SECTION)
		);
		expect(result).to.be.false;
	});

	it('should pass any other non-null data type', () => {
		const result = validatePublisherSection(1);
		expect(result).to.be.true;
	});

	it('should pass a null value', () => {
		const result = validatePublisherSection({});
		expect(result).to.be.true;
	});
}


function describeValidateForm() {
	const validForm = {
		aliasEditor: VALID_ALIASES,
		identifierEditor: VALID_IDENTIFIERS,
		nameSection: VALID_NAME_SECTION,
		publisherSection: VALID_PUBLISHER_SECTION,
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

	it('should reject an Object with an invalid publisher section', () => {
		const result = validateForm(
			{
				...validForm,
				publisherSection: INVALID_PUBLISHER_SECTION
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
		'validatePublisherSectionArea',
		describeValidatePublisherSectionArea
	);
	describe(
		'validatePublisherSectionBeginDate',
		describeValidatePublisherSectionBeginDate
	);
	describe(
		'validatePublisherSectionEndDate',
		describeValidatePublisherSectionEndDate
	);
	describe(
		'validatePublisherSectionEnded',
		describeValidatePublisherSectionEnded
	);
	describe(
		'validatePublisherSectionType',
		describeValidatePublisherSectionType
	);
	describe(
		'validatePublisherSection',
		describeValidatePublisherSection
	);
	describe(
		'validateForm',
		describeValidateForm
	);
}

describe('validatePublisherSection* functions', tests);
