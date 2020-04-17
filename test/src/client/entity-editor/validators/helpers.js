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
	INVALID_AREA, INVALID_BEGIN_DATE_PAIR, INVALID_DATES, INVALID_DATE_PAIR,
	INVALID_END_DATE_PAIR, VALID_AREA, VALID_DATE_PAIR
} from './data';
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

	it('should reject NaN', () => {
		const result = validationFunc(NaN);
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
	it('should pass a object containing a valid year value', () => {
		const result = validationFunc({day: '', month: '', year: '2017'}).isValid;
		expect(result).to.be.true;
	});

	it('should pass a object containing a valid year and month value', () => {
		const result = validationFunc({day: '', month: '11', year: '2017'}).isValid;
		expect(result).to.be.true;
	});

	it('should pass a object containing a valid year, month and day value', () => {
		const result = validationFunc({day: '21', month: '11', year: '2017'}).isValid;
		expect(result).to.be.true;
	});

	it('should reject all other forms of invalid dates', () => {
		const result = INVALID_DATES.reduce((res, date) =>
			res || validationFunc(date).isValid, false);
		expect(result).to.be.false;
	});

	it(`should ${required ? 'reject' : 'pass'} a empty value object`,
		() => {
			const result = validationFunc({}).isValid;
			expect(result).to.equal(!required);
		});
}

export function testValidateEndDateFunc(
	endDateValidationfunc
) {
	it('should pass if the begin date occurs before the end one',
		() => {
			const result = VALID_DATE_PAIR.reduce((res, datePair) =>
				res && endDateValidationfunc(datePair.first, datePair.second).isValid,
			true);
			expect(result).to.be.true;
		});

	it('should reject if the begin date occurs after the end one',
		() => {
			const result = INVALID_DATE_PAIR.reduce((res, datePair) =>
				res || endDateValidationfunc(datePair.first, datePair.second).isValid,
			false);
			expect(result).to.be.false;
		});

	it('should pass if the begin date is empty/undefined/invalid',
		() => {
			const result = INVALID_BEGIN_DATE_PAIR.reduce((res, datePair) =>
				res && endDateValidationfunc(datePair.first, datePair.second).isValid,
			true);
			expect(result).to.be.true;
		});

	it('should reject if the end date is invalid',
		() => {
			const result = INVALID_END_DATE_PAIR.reduce((res, datePair) =>
				res || endDateValidationfunc(datePair.first, datePair.second).isValid,
			false);
			expect(result).to.be.false;
		});
}


export function testValidateAreaFunc(validationFunc, required = true) {
	it('should pass a valid Object', () => {
		const result = validationFunc(VALID_AREA);
		expect(result).to.be.true;
	});

	it('should pass a valid Immutable.Map', () => {
		const result = validationFunc(
			Immutable.fromJS(VALID_AREA)
		);
		expect(result).to.be.true;
	});

	it('should reject an Object with an invalid ID', () => {
		const result = validationFunc(
			{...VALID_AREA, id: null}
		);
		expect(result).to.be.false;
	});

	it('should reject an invalid Immutable.Map', () => {
		const result = validationFunc(
			Immutable.fromJS(INVALID_AREA)
		);
		expect(result).to.be.false;
	});

	it('should reject any other non-null data type', () => {
		const result = validationFunc(1);
		expect(result).to.be.false;
	});

	it(`should ${required ? 'reject' : 'pass'} a null value`, () => {
		const result = validationFunc(null);
		expect(result).to.equal(!required);
	});
}
