import chai from 'chai';
import {numbersBetweenToAndFrom} from '../../../../src/server/helpers/utils';


const {expect} = chai;

describe('Testing numbersBetweenToAndFrom', () => {
	it('should return correct number of numbers between two numbers in an array', () => {
		const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const answer = numbersBetweenToAndFrom(array, 1, 5);
		expect(answer).to.equal(5);
	});

	// 'from' and 'to' both equal and present in array
	it('should return correct number of numbers between two numbers in an array', () => {
		const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const answer = numbersBetweenToAndFrom(array, 1, 1);
		expect(answer).to.equal(1);
	});

	// 'from' and 'to' both equal but not present in array
	it('should return correct number of numbers between two numbers in an array', () => {
		const array = [1, 2, 3, 4, 6, 7, 8, 9, 10];
		const answer = numbersBetweenToAndFrom(array, 5, 5);
		expect(answer).to.equal(0);
	});

	// 'from' and 'to' both greater than any other number
	it('should return correct number of numbers between two numbers in an array', () => {
		const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const answer = numbersBetweenToAndFrom(array, 11, 11);
		expect(answer).to.equal(0);
	});

	// 'from' and 'to' lesser than any other number
	it('should return correct number of numbers between two numbers in an array', () => {
		const array = [2, 3, 3, 3, 4, 5, 5, 5];
		const answer = numbersBetweenToAndFrom(array, 1, 1);
		expect(answer).to.equal(0);
	});

	// multiple 'from' and multiple 'to'
	it('should return correct number of numbers between two numbers in an array', () => {
		const array = [1, 1, 2, 3, 3, 3, 4, 5, 5, 5];
		const answer = numbersBetweenToAndFrom(array, 1, 5);
		expect(answer).to.equal(10);
	});

	// multiple 'from' but single 'to'
	it('should return correct number of numbers between two numbers in an array', () => {
		const array = [1, 1, 2, 3, 3, 3, 4, 5, 5, 5];
		const answer = numbersBetweenToAndFrom(array, 1, 4);
		expect(answer).to.equal(7);
	});

	// multiple 'to' but single 'from'
	it('should return correct number of numbers between two numbers in an array', () => {
		const array = [1, 1, 2, 3, 3, 3, 4, 5, 5, 5];
		const answer = numbersBetweenToAndFrom(array, 2, 5);
		expect(answer).to.equal(8);
	});

	// 'from' lesser than all numbers and 'to' bigger than all numbers
	it('should return correct number of numbers between two numbers in an array', () => {
		const array = [3, 3, 3, 4, 5, 5, 5, 7, 9];
		const answer = numbersBetweenToAndFrom(array, 1, 100);
		expect(answer).to.equal(9);
	});
});
