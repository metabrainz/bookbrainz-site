import chai from 'chai';
import {getNextEnabledAndResultsArray} from '../../../../src/server/helpers/utils';


const {expect} = chai;

describe('Testing getNextEnabledAndResultsArray', () => {
	it('newResultsArray size should be 9 and nextEnabled true when arrayLength=10 and size=9', () => {
		const array = Array(10).fill(0);
		const size = 9;
		const {newResultsArray, nextEnabled} = getNextEnabledAndResultsArray(array, size);

		expect(newResultsArray.length).to.equal(9);
		expect(nextEnabled).to.equal(true);
	});

	it('newResultsArray size should be 10 and nextEnabled false when arrayLength=10 and size=10', () => {
		const array = Array(10).fill(0);
		const size = 10;
		const {newResultsArray, nextEnabled} = getNextEnabledAndResultsArray(array, size);

		expect(newResultsArray.length).to.equal(10);
		expect(nextEnabled).to.equal(false);
	});

	it('newResultsArray size should be 9 and nextEnabled false when arrayLength=9 and size=10', () => {
		const array = Array(9).fill(0);
		const size = 10;
		const {newResultsArray, nextEnabled} = getNextEnabledAndResultsArray(array, size);

		expect(newResultsArray.length).to.equal(9);
		expect(nextEnabled).to.equal(false);
	});

	it('newResultsArray size should be 0 and nextEnabled false when arrayLength=0 and size=10', () => {
		const array = Array(1).fill(0);
		const size = 10;
		const {newResultsArray, nextEnabled} = getNextEnabledAndResultsArray(array, size);

		expect(newResultsArray.length).to.equal(1);
		expect(nextEnabled).to.equal(false);
	});

	it('newResultsArray size should be 10 and nextEnabled true when arrayLength=20 and size=10', () => {
		const array = Array(20).fill(0);
		const size = 10;
		const {newResultsArray, nextEnabled} = getNextEnabledAndResultsArray(array, size);

		expect(newResultsArray.length).to.equal(10);
		expect(nextEnabled).to.equal(true);
	});
});
