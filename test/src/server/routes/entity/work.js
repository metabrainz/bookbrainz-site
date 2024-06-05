import {createEditor, createWork, getRandomUUID, seedInitialState, truncateEntities} from '../../../../test-helpers/create-entities';

import app from '../../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';


chai.use(chaiHttp);
const {expect} = chai;

describe('Work routes with entity editing priv', () => {
	const aBBID = getRandomUUID();
	const inValidBBID = 'have-you-seen-the-fnords';
	let agent;

	before(async () => {
		await createWork(aBBID);
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
			.get(`/work/${inValidBBID}`)
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(400);
				done();
			});
	});
	it('should not throw an error if creating new work', async () => {
		const res = await agent
			.get('/work/create');
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error trying to edit an existing work', async () => {
		const res = await agent
			.get(`/work/${aBBID}/edit`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw error while seeding work', async () => {
		const data = {
			...seedInitialState,
			'identifierEditor.t8': 'wikidataid',
			'workSection.languages0': 'English',
			'workSection.languages1': 'Japenglish',
			'workSection.type': ''
		  };
		const res = await agent.post('/work/create').set('Origin', `http://127.0.0.1:${agent.app.address().port}`).send(data);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw not authorized error while seeding work', async () => {
		const data = seedInitialState;
		const res = await chai.request(app).post('/work/create').send(data);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error if requested work BBID exists', async () => {
		const res = await chai.request(app)
			.get(`/work/${aBBID}`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
});

describe('Work routes without entity editing priv', () => {
	const aBBID = getRandomUUID();
	let agent;
	before(async () => {
		await createWork(aBBID);
		await createEditor(123456, 0);
		// Log in; use agent to use logged in session
		agent = await chai.request.agent(app);
		await agent.get('/cb');
	});
	after(truncateEntities);

	it('should throw an error if trying to open work create page', async () => {
		const res = await agent
			.get('/work/create');
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
		expect(res.res.statusMessage).to.equal('You do not have the privilege to access this route');
	});
	it('should throw an error trying to edit an existing work', async () => {
		const res = await agent
			.get(`/work/${aBBID}/edit`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
		expect(res.res.statusMessage).to.equal('You do not have the privilege to access this route');
	});
	it('should throw an error when trying to delete an existing work', async () => {
		const res = await agent
			.get(`/work/${aBBID}/delete`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
		expect(res.res.statusMessage).to.equal('You do not have the privilege to access this route');
	});
	it('should throw not authorized error while seeding work', async () => {
		const data = seedInitialState;
		const res = await agent.post('/work/create').set('Origin', `http://127.0.0.1:${agent.app.address().port}`).send(data);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
		expect(res.res.statusMessage).to.equal('You do not have the privilege to access this route');
	});
});
