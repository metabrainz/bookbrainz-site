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

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;


export function testValidatePositiveIntegerFunc(
	validationFunc, required = true
) {
	it('should pass any positive integer value', () => {
		const result = validationFunc(1);
		expect(result).to.be.true;
	});

	it('should reject zero', () => {
		const result = validationFunc(0);
		expect(result).to.be.false;
	});

	it('should reject an negative number', () => {
		const result = validationFunc(-1);
		expect(result).to.be.false;
	});

	it('should reject any non-number value', () => {
		const result = validationFunc({});
		expect(result).to.be.false;
	});

	it(`should ${required ? 'reject' : 'pass'} a null value`, () => {
		const result = validationFunc(null);
		expect(result).to.equal(!required);
	});
}

export function testValidateStringFunc(
	validationFunc, required = true
) {
	it('should pass any non-empty string value', () => {
		const result = validationFunc('test');
		expect(result).to.be.true;
	});

	it('should reject an empty string', () => {
		const result = validationFunc('');
		expect(result).to.equal(!required);
	});

	it('should reject any non-string value', () => {
		const result = validationFunc({});
		expect(result).to.be.false;
	});

	it(`should ${required ? 'reject' : 'pass'} a null value`, () => {
		const result = validationFunc(null);
		expect(result).to.equal(!required);
	});
}

export function testValidateBooleanFunc(validationFunc, required = true) {
	it('should pass any boolean value', () => {
		const result = validationFunc(true);
		expect(result).to.be.true;
	});

	it('should reject any non-boolean value', () => {
		const result = validationFunc({});
		expect(result).to.be.false;
	});

	it(`should ${required ? 'reject' : 'pass'} a null value`, () => {
		const result = validationFunc(null);
		expect(result).to.equal(!required);
	});
}

export function testValidateDateFunc(validationFunc, required = true) {
	it('should pass a string value containing a year', () => {
		const result = validationFunc('2017');
		expect(result).to.be.true;
	});

	it('should pass a string value containing a year and month', () => {
		const result = validationFunc('2017-11');
		expect(result).to.be.true;
	});

	it('should pass a string value containing a year, month and day', () => {
		const result = validationFunc('2017-11-09');
		expect(result).to.be.true;
	});

	it('should reject any other string value', () => {
		const result = validationFunc('201');
		expect(result).to.be.false;
	});

	it('should reject any non-string value', () => {
		const result = validationFunc({});
		expect(result).to.be.false;
	});

	it(`should ${required ? 'reject' : 'pass'} a null value`, () => {
		const result = validationFunc(null);
		expect(result).to.equal(!required);
	});
}
