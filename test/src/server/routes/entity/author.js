import {createAuthor, createEditor, getRandomUUID, seedInitialState, truncateEntities} from '../../../../test-helpers/create-entities';

import app from '../../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';


chai.use(chaiHttp);
const {expect} = chai;

describe('Author routes', () => {
	const aBBID = getRandomUUID();
	const inValidBBID = 'have-you-seen-the-fnords';
	let agent;
	before(async () => {
		await createAuthor(aBBID);
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
			.get(`/author/${inValidBBID}`)
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(400);
				done();
			});
	});
	it('should not throw an error if creating new author', async () => {
		const res = await agent
			.get('/author/create');
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error trying to edit an existing author', async () => {
		const res = await agent
			.get(`/author/${aBBID}/edit`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw error while seeding author', async () => {
		const data = {
			...seedInitialState,
			'authorSection.beginArea': '',
			'authorSection.beginDate': 'invaliddate',
			'authorSection.endDate': '',
			'authorSection.gender': '',
			'authorSection.type': '',
			'identifierEditor.t23': 'openlibid'
		  };
		const res = await agent.post('/author/create').set('Origin', `http://127.0.0.1:${agent.app.address().port}`).send(data);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw not authorized error while seeding author', async () => {
		const data = seedInitialState;
		const res = await chai.request(app).post('/author/create').send(data);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error if requested author BBID exists', async () => {
		const res = await chai.request(app)
			.get(`/author/${aBBID}`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
});


