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
	validateEditionGroupSection,
	validateEditionGroupSectionType,
	validateForm
} from '../../../../../src/client/entity-editor/validators/edition-group';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {testValidatePositiveIntegerFunc} from './helpers';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateEditionGroupSectionType() {
	testValidatePositiveIntegerFunc(validateEditionGroupSectionType, false);
}

const VALID_AUTHOR_CREDIT_EDITOR = {
	n0: {
		author: {
			id: '204f580d-7763-4660-9668-9a21736b5f6c',
			rowId: 'n0',
			text: '',
			type: 'Author'
		},
		name: 'author'
	}
};

const VALID_EDITION_GROUP_SECTION = {
	type: 1
};
const INVALID_EDITION_GROUP_SECTION = {...VALID_EDITION_GROUP_SECTION, type: {}};

function describeValidateEditionGroupSection() {
	it('should pass a valid Object', () => {
		const result = validateEditionGroupSection(VALID_EDITION_GROUP_SECTION);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validateEditionGroupSection(
			Immutable.fromJS(VALID_EDITION_GROUP_SECTION)
		);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid type', () => {
		const result = validateEditionGroupSection({
			...VALID_EDITION_GROUP_SECTION,
			type: {}
		});
		expect(result).to.be.false;
	});

	it('should reject an invalid Immutable.Map', () => {
		const result = validateEditionGroupSection(
			Immutable.fromJS(INVALID_EDITION_GROUP_SECTION)
		);
		expect(result).to.be.false;
	});

	it('should pass any other non-null data type', () => {
		const result = validateEditionGroupSection(1);
		expect(result).to.be.true;
	});

	it('should pass a null value', () => {
		const result = validateEditionGroupSection(null);
		expect(result).to.be.true;
	});
}


function describeValidateForm() {
	const validForm = {
		aliasEditor: VALID_ALIASES,
		authorCreditEditor: VALID_AUTHOR_CREDIT_EDITOR,
		editionGroupSection: VALID_EDITION_GROUP_SECTION,
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

	it('should reject an Object with an invalid Edition Group section', () => {
		const result = validateForm(
			{
				...validForm,
				editionGroupSection: INVALID_EDITION_GROUP_SECTION
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
		'validateEditionGroupSectionType',
		describeValidateEditionGroupSectionType
	);
	describe(
		'validateEditionGroupSection',
		describeValidateEditionGroupSection
	);
	describe(
		'validateForm',
		describeValidateForm
	);
}

describe('validateEditionGroupSection* functions', tests);
