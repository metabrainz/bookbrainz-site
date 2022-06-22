import {createEdition, createEditor, getRandomUUID, seedInitialState, truncateEntities} from '../../../../test-helpers/create-entities';
import app from '../../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';


chai.use(chaiHttp);
const {expect} = chai;

describe('Edition routes', () => {
	const aBBID = getRandomUUID();
	const inValidBBID = 'have-you-seen-the-fnords';
	let agent;
	before(async () => {
		await createEdition(aBBID);
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
			.get(`/edition/${inValidBBID}`)
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res).to.have.status(400);
				done();
			});
	});
	it('should not throw an error if creating new edition', async () => {
		const res = await agent
			.get('/edition/create');
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error trying to edit an existing edition', async () => {
		const res = await agent
			.get(`/edition/${aBBID}/edit`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw error while seeding edition', async () => {
		const data = {
			...seedInitialState,
			'editionSection.depth': 'nan',
			'editionSection.format': '',
			'editionSection.height': '139',
			'editionSection.pages': '499',
			'editionSection.publisher': '',
			'editionSection.releaseDate': 'invalid',
			'editionSection.weight': '453',
			'editionSection.width': '',
			'identifierEditor.t10': '0374533555'
		};
		const res = await agent.post('/edition/create').set('Origin', `http://127.0.0.1:${agent.app.address().port}`).send(data);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw not authorized error while seeding edition', async () => {
		const data = seedInitialState;
		const res = await chai.request(app).post('/edition/create').send(data);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should not throw an error if requested edition BBID exists', async () => {
		const res = await chai.request(app)
			.get(`/edition/${aBBID}`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
});

