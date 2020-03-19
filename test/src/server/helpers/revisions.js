import * as revisions from '../../../../src/server/helpers/revisions';
import {createMultipleRevisions, truncateEntities} from '../../../test-helpers/create-entities';
import chai from 'chai';
import orm from '../../../bookbrainz-data';


const {expect} = chai;
chai.use(require('chai-sorted'));


describe('getOrderedRevisions', () => {
	before(async () => {
		await createMultipleRevisions(1000);
	});
	after(truncateEntities);

	it('should return sorted revisions with the expected keys', async () => {
		const from = 0;
		const size = 1000;
		const orderedRevisions = await revisions.getOrderedRevisions(from, size, orm);
		orderedRevisions.forEach(revision => {
			expect(revision).to.have.keys(
				'authorId',
				'createdAt',
				'editor',
				'entities',
				'revisionId'
			);
		});
		expect(orderedRevisions.length).to.equal(size);
		expect(orderedRevisions).to.be.descendingBy('createdAt');
	});

	it('should return the expected subset of revisions when passed an offset (from)', async () => {
		const from = 900;
		const size = 10;
		const allRevisions = await revisions.getOrderedRevisions(0, 1000, orm);
		const orderedRevisions = await revisions.getOrderedRevisions(from, size, orm);
		const allRevisionsSubset = allRevisions.slice(from, from + size);
		expect(orderedRevisions.length).to.equal(size);
		expect(orderedRevisions).to.deep.equal(allRevisionsSubset);
		expect(orderedRevisions).to.be.descendingBy('createdAt');
	});

	it('should return no results if offset is higher than total revisions', async () => {
		// only 1000 revisions were created
		const orderedRevisions = await revisions.getOrderedRevisions(1001, 10, orm);
		expect(orderedRevisions.length).to.be.equal(0);
	});
});
