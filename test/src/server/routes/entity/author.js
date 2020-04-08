import {createAuthor, getRandomUUID, truncateEntities} from '../../../../test-helpers/create-entities';

import app from '../../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';


chai.use(chaiHttp);
const {expect} = chai;

describe('Author routes', () => {
	const aBBID = getRandomUUID();
	const inValidBBID = 'have-you-seen-the-fnords';

	before(async () => {
		await createAuthor(aBBID);
	});
	after(truncateEntities);

	it('should throw an error if requested BBID is invalid', (done) => {
		chai.request(app)
			.get(`/author/${inValidBBID}`)
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(400);
				done();
			});
	});
	it('should not throw an error if creating new author', async () => {
		const res = await chai.request(app)
			.get('/author/create');
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error if requested author BBID exists', async () => {
		const res = await chai.request(app)
			.get(`/author/${aBBID}`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error trying to edit an existing author', async () => {
		const res = await chai.request(app)
			.get(`/author/${aBBID}/edit`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
});
