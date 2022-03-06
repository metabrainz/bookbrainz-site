import {getNextEnabledAndResultsArray, isbn10To13, isbn13To10} from '../../../../src/common/helpers/utils';
import chai from 'chai';


const {expect} = chai;

describe('getNextEnabledAndResultsArray', () => {
	it('should return an array of required length and nextEnabled:true when results.length > size', () => {
		const array = Array(10).fill(0);
		const size = 9;
		const {newResultsArray, nextEnabled} = getNextEnabledAndResultsArray(array, size);

		expect(newResultsArray.length).to.equal(9);
		expect(nextEnabled).to.equal(true);
	});

	it('should return an array of required length and nextEnabled:false when results.length = size', () => {
		const array = Array(10).fill(0);
		const size = 10;
		const {newResultsArray, nextEnabled} = getNextEnabledAndResultsArray(array, size);

		expect(newResultsArray.length).to.equal(10);
		expect(nextEnabled).to.equal(false);
	});

	it('should return an array of required length and nextEnabled:false when results.length < size', () => {
		const array = Array(9).fill(0);
		const size = 10;
		const {newResultsArray, nextEnabled} = getNextEnabledAndResultsArray(array, size);

		expect(newResultsArray.length).to.equal(9);
		expect(nextEnabled).to.equal(false);
	});

	it('should return an array of required length and nextEnabled:false when results.length = 0', () => {
		const array = Array(0).fill(0);
		const size = 10;
		const {newResultsArray, nextEnabled} = getNextEnabledAndResultsArray(array, size);

		expect(newResultsArray.length).to.equal(0);
		expect(nextEnabled).to.equal(false);
	});

	it('should return an array of required length and nextEnabled:true when results.length > size and results.length - size > 1', () => {
		const array = Array(20).fill(0);
		const size = 10;
		const {newResultsArray, nextEnabled} = getNextEnabledAndResultsArray(array, size);

		expect(newResultsArray.length).to.equal(10);
		expect(nextEnabled).to.equal(true);
	});
});

describe('Convert ISBNs', () => {
	it('should return null if isbn10 not valid', () => {
		const isbn10 = '1-23-45678-9';
		const result = isbn10To13(isbn10);
		expect(result).to.null;
	});
	it('should return valid isbn13 from isbn10', () => {
		const isbn10 = '1-23-456789-X';
		const expectedResult = '9781234567897';
		const result = isbn10To13(isbn10);
		expect(result).to.equal(expectedResult);
	});
	it('should return null if isbn13 not valid', () => {
		const isbn13 = '879-123-456-7897';
		const result = isbn13To10(isbn13);
		expect(result).to.null;
	});
	it('should return valid isbn10 from isbn13', () => {
		const isbn13 = '978-1-23456-789-7';
		const expectedResult = '123456789X';
		const result = isbn13To10(isbn13);
		expect(result).to.equal(expectedResult);
	});
});
