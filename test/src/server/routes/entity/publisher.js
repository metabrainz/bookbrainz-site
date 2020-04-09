import {createPublisher, getRandomUUID, truncateEntities} from '../../../../test-helpers/create-entities';

import app from '../../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
const {expect} = chai;

describe('Publisher routes', () => {
	const aBBID = getRandomUUID();
	const inValidBBID = 'have-you-seen-the-fnords';

	before(async () => {
		await createPublisher(aBBID);
	});
	after(truncateEntities);

	it('should throw an error if requested BBID is invalid', (done) => {
		chai.request(app)
			.get(`/publisher/${inValidBBID}`)
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(400);
				done();
			});
	});
	it('should not throw an error if creating new publisher', async () => {
		const res = await chai.request(app)
			.get('/publisher/create');
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error if requested publisher BBID exists', async () => {
		const res = await chai.request(app)
			.get(`/publisher/${aBBID}`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error trying to edit an existing publisher', async () => {
		const res = await chai.request(app)
			.get(`/publisher/${aBBID}/edit`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error deleting an publisher', async () => {
		const res = await chai.request(app)
			.get(`/publisher/${aBBID}/delete`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error for publisher revisions', async () => {
		const res = await chai.request(app)
			.get(`/publisher/${aBBID}/revisions`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error for revision JSON page', async () => {
		const res = await chai.request(app)
			.get(`/publisher/${aBBID}/revisions/revisions`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
});
