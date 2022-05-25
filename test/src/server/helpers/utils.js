import {createPublisher, truncateEntities} from '../../../test-helpers/create-entities';
import {generateIdenfierState, getIdByField, parseLanguages, searchOption} from '../../../../src/server/helpers/utils';
import {getNextEnabledAndResultsArray, isbn10To13, isbn13To10} from '../../../../src/common/helpers/utils';

import chai from 'chai';
import orm from '../../../bookbrainz-data';


const {Language, Alias, AliasSet} = orm;
const {expect} = chai;
const languageAttribs = {
	frequency: 1,
	isoCode1: 'en',
	isoCode2b: 'eng',
	isoCode2t: 'eng',
	isoCode3: 'eng',
	name: 'English'
};
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

describe('getIdByField', () => {
	after(truncateEntities);
	it('should return null if item does not exists', async () => {
		const fieldName = 'name';
		const fieldValue = 'Japenglish';
		const exId = await getIdByField(Language, fieldName, fieldValue);
		expect(exId).to.be.null;
	});
	it('should return the ID for an existing item', async () => {
		const language = await new Language(languageAttribs)
			.save(null, {method: 'insert'});
		const fieldName = 'name';
		const fieldValue = languageAttribs.name;
		const exId = await getIdByField(Language, fieldName, fieldValue);
		expect(exId).to.equal(language.id);
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
	after(truncateEntities);
	it('should return correctly formatted languages state', async () => {
		const language = await new Language(languageAttribs).save(null, {method: 'insert'});
		const sourceEntityState = {
			languages1: languageAttribs.name
		};
		const expectedResult = [{label: languageAttribs.name, value: language.id}];
		const result = await parseLanguages(sourceEntityState, orm);
		expect(result.languages).to.eql(expectedResult);
	});
});
describe('searchOption', () => {
	after(truncateEntities);
	it('should return null if no exact match found', async () => {
		const query = 'penguin';
		const type = 'publisher';
		const result = await searchOption(orm, type, query, 'bbid', true);
		expect(result).to.be.null;
	});
	it('should return correct option if match found', async () => {
		const language = await new Language({...languageAttribs})
			.save(null, {method: 'insert'});
		const defaultAlias = {
			languageId: language.id,
			name: 'penguin',
			sortName: 'penguin'
		};
		const alias = await new Alias({...defaultAlias})
			.save(null, {method: 'insert'});

		const aliasSet = await new AliasSet({
			defaultAliasId: alias.id
		})
			.save(null, {method: 'insert'});
		await aliasSet.aliases().attach([alias.id]);
		const publisher = await createPublisher(null, {aliasSetId: aliasSet.id});
		const expectedResults = {disambiguation: null, id: publisher.get('bbid'), text: defaultAlias.name, type: 'Publisher'};
		const result = await searchOption(orm, 'publisher', defaultAlias.name, 'bbid', true);
		expect(result).to.eql(expectedResults);
	});
});
