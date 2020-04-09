import {createEdition, getRandomUUID, truncateEntities} from '../../../../test-helpers/create-entities';

import app from '../../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
const {expect} = chai;

describe('Edition routes', () => {
	const aBBID = getRandomUUID();
	const inValidBBID = 'have-you-seen-the-fnords';

	before(async () => {
		await createEdition(aBBID);
	});
	after(truncateEntities);

	it('should throw an error if requested BBID is invalid', (done) => {
		chai.request(app)
			.get(`/edition/${inValidBBID}`)
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(400);
				done();
			});
	});
	it('should not throw an error if creating new edition', async () => {
		const res = await chai.request(app)
			.get('/edition/create');
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error if requested edition BBID exists', async () => {
		const res = await chai.request(app)
			.get(`/edition/${aBBID}`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error trying to edit an existing edition', async () => {
		const res = await chai.request(app)
			.get(`/edition/${aBBID}/edit`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error deleting an edition', async () => {
		const res = await chai.request(app)
			.get(`/edition/${aBBID}/delete`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error for edition revisions', async () => {
		const res = await chai.request(app)
			.get(`/edition/${aBBID}/revisions`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error for revision JSON page', async () => {
		const res = await chai.request(app)
			.get(`/edition/${aBBID}/revisions/revisions`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
});
