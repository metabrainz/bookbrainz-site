import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import request from 'supertest';
import status from 'http-status';


chai.use(chaiHttp);
const {expect} = chai;

describe('GET Revisions routes', () => {
	it('should get /revisions', async () => {
		const res = await chai.request(app)
			.get('/revisions');
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should get /revisions/revisions', (done) => {
		request(app)
			.get('/revisions/revisions')
			.expect('Content-Type', /json/)
			.expect(status.OK, done);
	});
});
