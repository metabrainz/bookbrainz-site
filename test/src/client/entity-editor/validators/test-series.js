/*
 * Copyright (C) 2021 Akash Gupta
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
	validateSeriesSection,
	validateSeriesSectionEntityType,
	validateSeriesSectionOrderingType
} from '../../../../../src/client/entity-editor/validators/series';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {testValidatePositiveIntegerFunc} from './helpers';


chai.use(chaiAsPromised);
const {expect} = chai;


const VALID_SERIES_TYPE = 'Author';
const INVALID_SERIES_TYPE = 'XYZ';

function describeValidateSeriesSectionOrderingType() {
	testValidatePositiveIntegerFunc(validateSeriesSectionOrderingType, true);
}

function describeValidateSeriesSectionEntityType() {
	it('should return true if passed a valid series type', () => {
		const result = validateSeriesSectionEntityType(VALID_SERIES_TYPE);
		expect(result).to.be.true;
	});
	it('should return false if passed a invalid series type', () => {
		const result = validateSeriesSectionEntityType(INVALID_SERIES_TYPE);
		expect(result).to.be.false;
	});
}

const VALID_SERIES_SECTION = {
	orderType: 1,
	seriesType: VALID_SERIES_TYPE
};
const INVALID_SERIES_SECTION = {...VALID_SERIES_SECTION, seriesType: INVALID_SERIES_TYPE};

function describeValidateSeriesSection() {
	it('should pass a valid Object', () => {
		const result = validateSeriesSection(VALID_SERIES_SECTION);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validateSeriesSection(
			Immutable.fromJS(VALID_SERIES_SECTION)
		);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid ordering type', () => {
		const result = validateSeriesSection({
			...VALID_SERIES_SECTION,
			orderType: {}
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid series type', () => {
		const result = validateSeriesSection({
			...VALID_SERIES_SECTION,
			seriesType: INVALID_SERIES_TYPE
		});
		expect(result).to.be.false;
	});

	it('should reject an invalid Immutable.Map', () => {
		const result = validateSeriesSection(
			Immutable.fromJS(INVALID_SERIES_SECTION)
		);
		expect(result).to.be.false;
	});

	it('should reject any other non-null data type', () => {
		const result = validateSeriesSection(1);
		expect(result).to.be.false;
	});

	it('should reject a null value', () => {
		const result = validateSeriesSection(null);
		expect(result).to.be.false;
	});
}

function describeValidateForm() {
	const validForm = {
		aliasEditor: VALID_ALIASES,
		identifierEditor: VALID_IDENTIFIERS,
		nameSection: VALID_NAME_SECTION,
		seriesSection: VALID_SERIES_SECTION,
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

	it('should reject an Object with an invalid series section', () => {
		const result = validateForm(
			{
				...validForm,
				seriesSection: INVALID_SERIES_SECTION
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
		'validateSeriesSectionOrderingType',
		describeValidateSeriesSectionOrderingType
	);
	describe(
		'validateSeriesSectionEntityType',
		describeValidateSeriesSectionEntityType
	);
	describe(
		'validateSeriesSection',
		describeValidateSeriesSection
	);
	describe(
		'validateForm',
		describeValidateForm
	);
}

describe('validateSeriesSection* functions', tests);
