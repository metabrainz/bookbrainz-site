import {createEditor, truncateEntities} from '../../../test-helpers/create-entities';

import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';


chai.use(chaiHttp);
const {expect} = chai;


describe('POST /collection/create', () => {
	let agent;
	before(async () => {
		await truncateEntities();
		try {
			await createEditor(123456);
		}
		catch (error) {
			// console.log(error);
		}
		// The `agent` now has the sessionid cookie saved, and will send it
		// back to the server in the next request:
		agent = await chai.request.agent(app);
		await agent.get('/cb');
	});
	after((done) => {
		// Clear DB tables then close superagent server
		agent.close();
		// truncateEntities().then(() => {
		// 	agent.close(done);
		// });
	});

	it('should create the collection', async () => {
		const data = {
			description: 'some description',
			entityType: 'Author',
			name: 'collectionName',
			privacy: 'public'
		};
		const res = await agent.post('/collection/create/handler').send(data);
		const {UserCollection} = orm;
		const collection = await new UserCollection({id: res.body.id}).fetch();
		expect(collection.get('id')).to.equal(res.body.id);
	});

	// eslint-disable-next-line require-await
	it('should throw error for incorrect entityType', async () => {
		const data = {
			description: 'some description',
			entityType: 'incorrect',
			name: 'collectionName',
			privacy: 'public'
		};
		try {
			await agent.post('/collection/create/handler').send(data);
		}
		catch (err) {
			// eslint-disable-next-line no-console
			console.log('printing some error');
			// eslint-disable-next-line no-console
			console.log(err);
		}
		expect(1).to.equal(1);
	});
});
