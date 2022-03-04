import {createEditor, createPublisher, getRandomUUID, seedInitialState, truncateEntities} from '../../../../test-helpers/create-entities';

import app from '../../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';


chai.use(chaiHttp);
const {expect} = chai;

describe('Publisher routes', () => {
	const aBBID = getRandomUUID();
	const inValidBBID = 'have-you-seen-the-fnords';
	let agent;
	before(async () => {
		await createPublisher(aBBID);
		try {
			await createEditor(123456);
		}
		catch (error) {
			// console.log(error);
		}
		// Log in; use agent to use logged in session
		agent = await chai.request.agent(app);
		await agent.get('/cb');
	});
	after(truncateEntities);

	it('should throw an error if requested BBID is invalid', (done) => {
		agent
			.get(`/publisher/${inValidBBID}`)
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(400);
				done();
			});
	});
	it('should not throw an error if creating new publisher', async () => {
		const res = await agent
			.get('/publisher/create');
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error trying to edit an existing publisher', async () => {
		const res = await agent
			.get(`/publisher/${aBBID}/edit`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw error while seeding publisher', async () => {
		const data = {
			...seedInitialState,
			'identifierEditor.t20': 'wikidataid',
			'publisherSection.area': '',
			'publisherSection.beginDate': 'invalid',
			'publisherSection.endDate': '',
			'publisherSection.type': ''

		  };
		const res = await agent.post('/publisher/create').set('Origin', `http://127.0.0.1:${agent.app.address().port}`).send(data);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw not authorized error while seeding publisher', async () => {
		const data = seedInitialState;
		const res = await chai.request(app).post('/publisher/create').send(data);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error if requested publisher BBID exists', async () => {
		const res = await chai.request(app)
			.get(`/publisher/${aBBID}`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
});
