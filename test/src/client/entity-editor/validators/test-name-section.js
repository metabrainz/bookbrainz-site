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
import {INVALID_NAME_SECTION, VALID_NAME_SECTION} from './data';
import {
	testValidatePositiveIntegerFunc, testValidateStringFunc
} from './helpers';
import {
	validateNameSection, validateNameSectionDisambiguation,
	validateNameSectionLanguage, validateNameSectionName,
	validateNameSectionSortName
} from '../../../../../src/client/entity-editor/validators/common';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateNameSectionName() {
	testValidateStringFunc(validateNameSectionName);
}

function describeValidateNameSectionSortName() {
	testValidateStringFunc(validateNameSectionSortName);
}

function describeValidateNameSectionLanguage() {
	testValidatePositiveIntegerFunc(validateNameSectionLanguage);
}

function describeValidateNameSectionDisambiguation() {
	testValidateStringFunc(validateNameSectionDisambiguation, false);
}


function describeValidateNameSection() {
	it('should pass a valid Object', () => {
		const result = validateNameSection(VALID_NAME_SECTION);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validateNameSection(
			Immutable.fromJS(VALID_NAME_SECTION)
		);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid name', () => {
		const result = validateNameSection({...VALID_NAME_SECTION, name: null});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid sort name', () => {
		const result = validateNameSection(
			{...VALID_NAME_SECTION, sortName: null}
		);
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid language', () => {
		const result = validateNameSection(
			{...VALID_NAME_SECTION, language: null}
		);
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid disambiguation', () => {
		const result = validateNameSection(
			{...VALID_NAME_SECTION, disambiguation: 2}
		);
		expect(result).to.be.false;
	});

	it('should reject an invalid Immutable.Map', () => {
		const result = validateNameSection(
			Immutable.fromJS(INVALID_NAME_SECTION)
		);
		expect(result).to.be.false;
	});

	it('should reject any other non-null data type', () => {
		const result = validateNameSection(1);
		expect(result).to.be.false;
	});

	it('should reject a null value', () => {
		const result = validateNameSection(null);
		expect(result).to.be.false;
	});
}


function tests() {
	describe('validateNameSectionName', describeValidateNameSectionName);
	describe(
		'validateNameSectionSortName',
		describeValidateNameSectionSortName
	);
	describe(
		'validateNameSectionLanguage',
		describeValidateNameSectionLanguage
	);
	describe(
		'validateNameSectionDisambiguation',
		describeValidateNameSectionDisambiguation
	);
	describe('validateNameSection', describeValidateNameSection);
}

describe('validateNameSection* functions', tests);
