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
	INVALID_ALIAS, INVALID_ALIASES, VALID_ALIAS, VALID_ALIASES
} from './data';
import {
	testValidateBooleanFunc, testValidatePositiveIntegerFunc,
	testValidateRequiredStringFunc
} from './helpers';
import {
	validateAlias, validateAliasLanguage, validateAliasName,
	validateAliasPrimary, validateAliasSortName, validateAliases
} from '../../../../../src/client/entity-editor/validators/common';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;


function describeValidateAliasName() {
	testValidateRequiredStringFunc(validateAliasName);
}

function describeValidateAliasSortName() {
	testValidateRequiredStringFunc(validateAliasSortName);
}

function describeValidateAliasLanguage() {
	testValidatePositiveIntegerFunc(validateAliasLanguage);
}

function describeValidateAliasPrimary() {
	testValidateBooleanFunc(validateAliasPrimary);
}

function describeValidateAlias() {
	it('should pass a valid Object', () => {
		const result = validateAlias(VALID_ALIAS);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validateAlias(Immutable.fromJS(VALID_ALIAS));
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid name', () => {
		const result = validateAlias({...VALID_ALIAS, name: null});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid sort name', () => {
		const result = validateAlias({...VALID_ALIAS, sortName: null});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid language', () => {
		const result = validateAlias({...VALID_ALIAS, language: null});
		expect(result).to.be.false;
	});

	it('should reject an Object with an invalid primary', () => {
		const result = validateAlias({...VALID_ALIAS, primary: null});
		expect(result).to.be.false;
	});

	it('should reject an invalid Immutable.Map', () => {
		const result = validateAlias(Immutable.fromJS(INVALID_ALIAS));
		expect(result).to.be.false;
	});

	it('should reject any other non-null data type', () => {
		const result = validateAlias(1);
		expect(result).to.be.false;
	});

	it('should reject a null value', () => {
		const result = validateAlias(null);
		expect(result).to.be.false;
	});
}


function describeValidateAliases() {
	it('should pass an Array of two valid Objects', () => {
		const result = validateAliases(VALID_ALIASES);
		expect(result).to.be.true;
	});

	it('should pass an Immutable.List of valid Immutable.Maps', () => {
		const result = validateAliases(Immutable.fromJS(VALID_ALIASES));
		expect(result).to.be.true;
	});

	it('should pass an empty Array', () => {
		const result = validateAliases([]);
		expect(result).to.be.true;
	});

	it('should pass an empty Immutable.List', () => {
		const result = validateAliases(Immutable.List());
		expect(result).to.be.true;
	});

	it('should reject an Array containing one invalid Object', () => {
		const result = validateAliases(INVALID_ALIASES);
		expect(result).to.be.false;
	});

	it('should reject an Immutable.List containing one invalid Immutable.Map', () => { // eslint-disable-line max-len
		const result = validateAliases(Immutable.fromJS(INVALID_ALIASES));
		expect(result).to.be.false;
	});

	it('should reject any other non-null data type', () => {
		const result = validateAliases(1);
		expect(result).to.be.false;
	});

	it('should reject a null value', () => {
		const result = validateAliases(null);
		expect(result).to.be.false;
	});
}

function tests() {
	describe('validateAliasName', describeValidateAliasName);
	describe('validateAliasSortName', describeValidateAliasSortName);
	describe('validateAliasLanguage', describeValidateAliasLanguage);
	describe('validateAlias', describeValidateAlias);
	describe('validateAliasPrimary', describeValidateAliasPrimary);
	describe('validateAliases', describeValidateAliases);
}

describe('validateAlias* functions', tests);
