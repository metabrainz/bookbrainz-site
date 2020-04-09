import {createWork, getRandomUUID, truncateEntities} from '../../../../test-helpers/create-entities';

import app from '../../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import request from 'supertest';
import status from 'http-status';


chai.use(chaiHttp);
const {expect} = chai;

describe('Work routes', () => {
	const aBBID = getRandomUUID();
	const inValidBBID = 'have-you-seen-the-fnords';

	before(async () => {
		await createWork(aBBID);
	});
	after(truncateEntities);

	it('should throw an error if requested BBID is invalid', (done) => {
		chai.request(app)
			.get(`/work/${inValidBBID}`)
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(400);
				done();
			});
	});
	it('should not throw an error if creating new work', async () => {
		const res = await chai.request(app)
			.get('/work/create');
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error if requested work BBID exists', async () => {
		const res = await chai.request(app)
			.get(`/work/${aBBID}`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error trying to edit an existing work', async () => {
		const res = await chai.request(app)
			.get(`/work/${aBBID}/edit`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error deleting an work', async () => {
		const res = await chai.request(app)
			.get(`/work/${aBBID}/delete`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error for work revisions', async () => {
		const res = await chai.request(app)
			.get(`/work/${aBBID}/revisions`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error for revision JSON page', async () => {
		const res = await chai.request(app)
			.get(`/work/${aBBID}/revisions/revisions`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
});
