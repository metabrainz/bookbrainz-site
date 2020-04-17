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
	testValidateDateFunc,
	testValidatePositiveIntegerFunc
} from './helpers';
import {
	validateEditionSection,
	validateEditionSectionDepth,
	validateEditionSectionEditionGroup,
	validateEditionSectionFormat,
	validateEditionSectionHeight,
	validateEditionSectionLanguage,
	validateEditionSectionLanguages,
	validateEditionSectionPages,
	validateEditionSectionPublisher,
	validateEditionSectionReleaseDate,
	validateEditionSectionStatus,
	validateEditionSectionWeight,
	validateEditionSectionWidth,
	validateForm
} from '../../../../../src/client/entity-editor/validators/edition';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateEditionSectionReleaseDate() {
	testValidateDateFunc(validateEditionSectionReleaseDate, false);
}

function describeValidateEditionSectionDepth() {
	testValidatePositiveIntegerFunc(validateEditionSectionDepth, false);
}

function describeValidateEditionSectionHeight() {
	testValidatePositiveIntegerFunc(validateEditionSectionHeight, false);
}

function describeValidateEditionSectionPages() {
	testValidatePositiveIntegerFunc(validateEditionSectionPages, false);
}

function describeValidateEditionSectionWeight() {
	testValidatePositiveIntegerFunc(validateEditionSectionWeight, false);
}

function describeValidateEditionSectionWidth() {
	testValidatePositiveIntegerFunc(validateEditionSectionWidth, false);
}

function describeValidateEditionSectionFormat() {
	testValidatePositiveIntegerFunc(validateEditionSectionFormat, false);
}

function describeValidateEditionSectionStatus() {
	testValidatePositiveIntegerFunc(validateEditionSectionStatus, false);
}


function describeValidateEditionSectionLanguage() {
	const validLanguage = {value: 1};

	it('should pass a valid Object', () => {
		const result = validateEditionSectionLanguage(validLanguage);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validateEditionSectionLanguage(
			Immutable.fromJS(validLanguage)
		);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid value', () => {
		const result = validateEditionSectionLanguage(
			{...validLanguage, value: null}
		);
		expect(result).to.be.false;
	});

	const invalidLanguage = {value: null};

	it('should reject an invalid Immutable.Map', () => {
		const result = validateEditionSectionLanguage(
			Immutable.fromJS(invalidLanguage)
		);
		expect(result).to.be.false;
	});

	it('should reject any other non-null data type', () => {
		const result = validateEditionSectionLanguage(1);
		expect(result).to.be.false;
	});

	it('should reject a null value', () => {
		const result = validateEditionSectionLanguage(null);
		expect(result).to.be.false;
	});
}

const VALID_LANGUAGE = {value: 1};
const VALID_LANGUAGES = [VALID_LANGUAGE, VALID_LANGUAGE];
const INVALID_LANGUAGE = {value: null};
const INVALID_LANGUAGES = [VALID_LANGUAGE, INVALID_LANGUAGE];

function describeValidateEditionSectionLanguages() {
	it('should pass an Array of two valid Objects', () => {
		const result = validateEditionSectionLanguages(VALID_LANGUAGES);
		expect(result).to.be.true;
	});

	it('should pass an Immutable.List of valid Immutable.Maps', () => {
		const result = validateEditionSectionLanguages(
			Immutable.fromJS(VALID_LANGUAGES)
		);
		expect(result).to.be.true;
	});

	it('should pass an empty Array', () => {
		const result = validateEditionSectionLanguages([]);
		expect(result).to.be.true;
	});

	it('should pass an empty Immutable.List', () => {
		const result = validateEditionSectionLanguages(Immutable.List());
		expect(result).to.be.true;
	});

	it('should reject an Array containing one invalid Object', () => {
		const result = validateEditionSectionLanguages(INVALID_LANGUAGES);
		expect(result).to.be.false;
	});

	it('should reject an Immutable.List containing one invalid Immutable.Map', () => { // eslint-disable-line max-len
		const result = validateEditionSectionLanguages(
			Immutable.fromJS(INVALID_LANGUAGES)
		);
		expect(result).to.be.false;
	});

	it('should reject any other non-null data type', () => {
		const result = validateEditionSectionLanguages(1);
		expect(result).to.be.false;
	});

	it('should pass a null value', () => {
		const result = validateEditionSectionLanguages(null);
		expect(result).to.be.true;
	});
}

const VALID_ENTITY = {
	id: '21675f5b-e9f8-4a6b-9aac-d3c965aa7d83'
};

const INVALID_ENTITY = {
	id: '2'
};

function describevalidateEditionSectionEditionGroup() {
	it('should pass a valid Object', () => {
		const result = validateEditionSectionEditionGroup(VALID_ENTITY);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validateEditionSectionEditionGroup(
			Immutable.fromJS(VALID_ENTITY)
		);
		expect(result).to.be.true;
	});

	it('should pass a null value', () => {
		const result = validateEditionSectionEditionGroup(null);
		expect(result).to.be.true;
	});

	it('should pass any other non-null data type with no ID', () => {
		const result = validateEditionSectionEditionGroup(1);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid ID', () => {
		const result = validateEditionSectionEditionGroup(
			{...VALID_ENTITY, id: '2'}
		);
		expect(result).to.be.false;
	});

	it('should reject an invalid Immutable.Map', () => {
		const result = validateEditionSectionEditionGroup(
			Immutable.fromJS(INVALID_ENTITY)
		);
		expect(result).to.be.false;
	});
}

function describeValidateEditionSectionPublisher() {
	it('should pass a valid Object', () => {
		const result = validateEditionSectionPublisher(VALID_ENTITY);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validateEditionSectionPublisher(
			Immutable.fromJS(VALID_ENTITY)
		);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid ID', () => {
		const result = validateEditionSectionPublisher(
			{...VALID_ENTITY, id: '2'}
		);
		expect(result).to.be.false;
	});

	it('should reject an invalid Immutable.Map', () => {
		const result = validateEditionSectionPublisher(
			Immutable.fromJS(INVALID_ENTITY)
		);
		expect(result).to.be.false;
	});

	it('should reject any other non-null data type', () => {
		const result = validateEditionSectionPublisher(1);
		expect(result).to.be.false;
	});

	it('should pass a null value', () => {
		const result = validateEditionSectionPublisher(null);
		expect(result).to.be.true;
	});
}

const VALID_EDITION_SECTION = {
	depth: 26,
	editionGroup: VALID_ENTITY,
	format: 2,
	height: 24,
	languages: VALID_LANGUAGES,
	pages: 25,
	publisher: VALID_ENTITY,
	releaseDate: {day: '22', month: '12', year: '2017'},
	status: 2,
	weight: 23,
	width: 22
};
const INVALID_EDITION_SECTION = {...VALID_EDITION_SECTION, format: {}};

function describeValidateEditionSection() {
	it('should pass a valid Object', () => {
		const result = validateEditionSection(VALID_EDITION_SECTION);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validateEditionSection(
			Immutable.fromJS(VALID_EDITION_SECTION)
		);
		expect(result).to.be.true;
	});

	it('should pass a null value', () => {
		const result = validateEditionSection(null);
		expect(result).to.be.true;
	});

	it('should ignore any other non-null data type', () => {
		const result = validateEditionSection(1);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid depth', () => {
		const result = validateEditionSection({
			...VALID_EDITION_SECTION,
			depth: 'ashes'
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid format', () => {
		const result = validateEditionSection({
			...VALID_EDITION_SECTION,
			format: 'to'
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid height', () => {
		const result = validateEditionSection({
			...VALID_EDITION_SECTION,
			height: 'ashes'
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with invalid languages', () => {
		const result = validateEditionSection({
			...VALID_EDITION_SECTION,
			languages: INVALID_LANGUAGES
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid pages', () => {
		const result = validateEditionSection({
			...VALID_EDITION_SECTION,
			pages: 'is'
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid edition group', () => {
		const result = validateEditionSection({
			...VALID_EDITION_SECTION,
			editionGroup: INVALID_ENTITY
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid publisher', () => {
		const result = validateEditionSection({
			...VALID_EDITION_SECTION,
			publisher: INVALID_ENTITY
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid release date', () => {
		const result = validateEditionSection({
			...VALID_EDITION_SECTION,
			releaseDate: {day: '', month: '', year: 'abcd'}
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid status', () => {
		const result = validateEditionSection({
			...VALID_EDITION_SECTION,
			status: 'life'
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid weight', () => {
		const result = validateEditionSection({
			...VALID_EDITION_SECTION,
			weight: 'on'
		});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid width', () => {
		const result = validateEditionSection({
			...VALID_EDITION_SECTION,
			width: 'mars?'
		});
		expect(result).to.be.false;
	});

	it('should reject an invalid Immutable.Map', () => {
		const result = validateEditionSection(
			Immutable.fromJS(INVALID_EDITION_SECTION)
		);
		expect(result).to.be.false;
	});
}


function describeValidateForm() {
	const validForm = {
		aliasEditor: VALID_ALIASES,
		editionSection: VALID_EDITION_SECTION,
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

	it('should reject an Object with an invalid edition section', () => {
		const result = validateForm(
			{
				...validForm,
				editionSection: INVALID_EDITION_SECTION
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
		'validateEditionSectionReleaseDate',
		describeValidateEditionSectionReleaseDate
	);
	describe(
		'validateEditionSectionDepth',
		describeValidateEditionSectionDepth
	);
	describe(
		'validateEditionSectionHeight',
		describeValidateEditionSectionHeight
	);
	describe(
		'validateEditionSectionPages',
		describeValidateEditionSectionPages
	);
	describe(
		'validateEditionSectionWeight',
		describeValidateEditionSectionWeight
	);
	describe(
		'validateEditionSectionWidth',
		describeValidateEditionSectionWidth
	);
	describe(
		'validateEditionSectionFormat',
		describeValidateEditionSectionFormat
	);
	describe(
		'validateEditionSectionStatus',
		describeValidateEditionSectionStatus
	);
	describe(
		'validateEditionSectionLanguage',
		describeValidateEditionSectionLanguage
	);
	describe(
		'validateEditionSectionLanguages',
		describeValidateEditionSectionLanguages
	);
	describe(
		'validateEditionSectionEditionGroup',
		describevalidateEditionSectionEditionGroup
	);
	describe(
		'validateEditionSectionPublisher',
		describeValidateEditionSectionPublisher
	);
	describe(
		'validateEditionSection',
		describeValidateEditionSection
	);
	describe(
		'validateForm',
		describeValidateForm
	);
}

describe('validateEditionSection* functions', tests);
