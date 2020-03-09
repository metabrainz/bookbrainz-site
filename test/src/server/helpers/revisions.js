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

	it('ordered revisions should be sorted and have the required keys', async () => {
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
		expect(orderedRevisions).to.be.descendingBy('createdAt');
	});

	it('offset, when having higher value, should be working properly ', async () => {
		const from = 900;
		const size = 10;
		const allRevisions = await revisions.getOrderedRevisions(0, 1000, orm);
		const orderedRevisions = await revisions.getOrderedRevisions(from, size, orm);
		for (let i = 0; i < size; i++) {
			// revisions are same if their revisionId are equal
			expect(orderedRevisions[i].revisionId).to.be.equal(allRevisions[i + from].revisionId);
			expect(orderedRevisions[i]).to.have.keys(
				'authorId',
				'createdAt',
				'editor',
				'entities',
				'revisionId'
			);
		}
		expect(orderedRevisions).to.be.descendingBy('createdAt');
	});

	it('ordredRevisions should be empty if offset is higher than total revisions', async () => {
		// only 1000 revisions were created
		const orderedRevisions = await revisions.getOrderedRevisions(1001, 10, orm);
		expect(orderedRevisions.length).to.be.equal(0);
	});
});
