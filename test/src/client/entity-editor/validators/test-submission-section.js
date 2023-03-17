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

import {EMPTY_SUBMISSION_SECTION, VALID_SUBMISSION_SECTION} from './data';
import {
	validateSubmissionSection,
	validateSubmissionSectionNote
} from '../../../../../src/client/entity-editor/validators/common';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {testValidateStringFunc} from './helpers';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateSubmissionSectionNote() {
	testValidateStringFunc(validateSubmissionSectionNote, false);
}


function describeValidateSubmissionSection() {
	it('should pass a valid Object', () => {
		const result = validateSubmissionSection(VALID_SUBMISSION_SECTION);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validateSubmissionSection(
			Immutable.fromJS(VALID_SUBMISSION_SECTION)
		);
		expect(result).to.be.true;
	});

	it('should pass an Object with an empty note', () => {
		const result = validateSubmissionSection(
			{...VALID_SUBMISSION_SECTION, note: null}
		);
		expect(result).to.be.true;
	});

	it('should pass an empty note Immutable.Map', () => {
		const result = validateSubmissionSection(
			Immutable.fromJS(EMPTY_SUBMISSION_SECTION)
		);
		expect(result).to.be.true;
	});

	it('should reject any other non-null data type', () => {
		const result = validateSubmissionSection(
			{...VALID_SUBMISSION_SECTION, note: 1}
		);
		expect(result).to.be.false;
	});

	it('should pass a null value', () => {
		const result = validateSubmissionSection(null);
		expect(result).to.be.true;
	});
}


function tests() {
	describe(
		'validateSubmissionSectionNote',
		describeValidateSubmissionSectionNote
	);
	describe('validateSubmissionSection', describeValidateSubmissionSection);
}

describe('validateSubmissionSection* functions', tests);
