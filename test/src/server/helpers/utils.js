import {generateIdenfierState, getIdByField, parseLanguages, searchOption} from '../../../../src/server/helpers/utils';
import chai from 'chai';
import {getNextEnabledAndResultsArray} from '../../../../src/common/helpers/utils';
import orm from '../../../bookbrainz-data';


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

describe('getIdByField', () => {
	it('should return null if item does not exists', async () => {
		const {Language} = orm;
		const fieldName = 'name';
		const fieldValue = 'Japenglish';
		const exId = await getIdByField(Language, fieldName, fieldValue);
		expect(exId).to.be.null;
	});
});
describe('generateIdenfierState', () => {
	it('should return correctly formatted identifier state', () => {
		const sourceIdentifierState = {
			t1: '123',
			t2: '234'
		};
		const expectedIdentifierState = {
			0: {
				type: 1,
				value: '123'
			},
			1: {
				type: 2,
				value: '234'
			}

		};
		const result = generateIdenfierState(sourceIdentifierState);
		expect(result).to.eql(expectedIdentifierState);
	});
});

describe('parseLanguages', () => {
	it('should return correctly formatted languages state', async () => {
		const sourceEntityState = {
			languages1: 'English'
		};
		const result = await parseLanguages(sourceEntityState, orm);
		expect(result.languages).to.be.a('array');
	});
});
describe('searchOption', () => {
	it('should return null if no exact match found', async () => {
		const query = 'penguin';
		const type = 'publisher';
		const result = await searchOption(orm, type, query, 'bbid', true);
		expect(result).to.be.null;
	});
});
