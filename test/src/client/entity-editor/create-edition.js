import {createEdition, getRandomUUID, truncateEntities} from '../../../test-helpers/create-entities';
import chai from 'chai';
import orm from '../../../bookbrainz-data';


const {expect} = chai;
const {Edition} = orm;

describe('Creating an Edition', () => {
	const bbid = getRandomUUID();

	beforeEach(() => createEdition(bbid));
	afterEach(truncateEntities);

	it('should automatically create an Edition Group if none is passed', async () => {
		const edition = await Edition.forge({bbid}).fetch({withRelated: ['editionGroup']});
		const editionJson = edition.toJSON();
		expect(editionJson.bbid).to.equal(bbid);
		expect(editionJson.editionGroupBbid).to.be.a('string');
	});
});
