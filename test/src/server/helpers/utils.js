import chai from 'chai';
import {getNextEnabledAndResultsArray} from '../../../../src/server/helpers/utils';

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
