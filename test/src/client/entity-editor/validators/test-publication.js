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
	IDENTIFIER_TYPES, INVALID_ALIASES, INVALID_IDENTIFIERS,
	INVALID_NAME_SECTION, INVALID_SUBMISSION_SECTION, VALID_ALIASES,
	VALID_IDENTIFIERS, VALID_NAME_SECTION, VALID_SUBMISSION_SECTION
} from './data';
import {
	validateForm, validatePublicationSection, validatePublicationSectionType
} from '../../../../../lib/client/entity-editor/validators/publication';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {testValidatePositiveIntegerFunc} from './helpers';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidatePublicationSectionType() {
	testValidatePositiveIntegerFunc(validatePublicationSectionType, false);
}

const VALID_PUBLICATION_SECTION = {
	type: 1
};
const INVALID_PUBLICATION_SECTION = {...VALID_PUBLICATION_SECTION, type: {}};

function describeValidatePublicationSection() {
	it('should pass a valid Object', () => {
		const result = validatePublicationSection(VALID_PUBLICATION_SECTION);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validatePublicationSection(
			Immutable.fromJS(VALID_PUBLICATION_SECTION)
		);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid type', () => {
		const result = validatePublicationSection({
			...VALID_PUBLICATION_SECTION,
			type: {}
		});
		expect(result).to.be.false;
	});

	it('should reject an invalid Immutable.Map', () => {
		const result = validatePublicationSection(
			Immutable.fromJS(INVALID_PUBLICATION_SECTION)
		);
		expect(result).to.be.false;
	});

	it('should pass any other non-null data type', () => {
		const result = validatePublicationSection(1);
		expect(result).to.be.true;
	});

	it('should pass a null value', () => {
		const result = validatePublicationSection(null);
		expect(result).to.be.true;
	});
}


function describeValidateForm() {
	const validForm = {
		aliasEditor: VALID_ALIASES,
		identifierEditor: VALID_IDENTIFIERS,
		nameSection: VALID_NAME_SECTION,
		publicationSection: VALID_PUBLICATION_SECTION,
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

	it('should reject an Object with an invalid publication section', () => {
		const result = validateForm(
			{
				...validForm,
				publicationSection: INVALID_PUBLICATION_SECTION
			},
			IDENTIFIER_TYPES
		);
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid submission section', () => {
		const result = validateForm(
			{
				...validForm,
				submissionSection: INVALID_SUBMISSION_SECTION
			},
			IDENTIFIER_TYPES
		);
		expect(result).to.be.false;
	});

	const invalidForm = {
		...validForm,
		submissionSection: INVALID_SUBMISSION_SECTION
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
		'validatePublicationSectionType',
		describeValidatePublicationSectionType
	);
	describe(
		'validatePublicationSection',
		describeValidatePublicationSection
	);
	describe(
		'validateForm',
		describeValidateForm
	);
}

describe('validatePublicationSection* functions', tests);
