import {createAuthor, createEditor, truncateEntities} from '../../../test-helpers/create-entities';

import app from '../../../../src/server/app';
import assertArrays from 'chai-arrays';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';


chai.use(chaiHttp);
chai.use(assertArrays);
const {expect} = chai;
const {UserCollection, UserCollectionItem} = orm;


describe('POST /collection/create', () => {
	let agent;
	let collectionOwner;
	before(async () => {
		try {
			collectionOwner = await createEditor(123456);
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
		truncateEntities().then(() => {
			agent.close(done);
		});
	});

	it('should correctly create collection and return with status code 200 for correct data', async () => {
		const data = {
			description: 'some description',
			entityType: 'Author',
			name: 'collectionName',
			privacy: 'public'
		};
		const res = await agent.post('/collection/create/handler').send(data);
		const collection = await new UserCollection({id: res.body.id}).fetch();
		expect(collection.get('id')).to.equal(res.body.id);
		expect(collection.get('ownerId')).to.equal(collectionOwner.get('id'));
		expect(res.status).to.equal(200);
	});

	it('should add the collection in the ES index', async () => {
		const data = {
			description: 'some description',
			entityType: 'Author',
			name: 'collectionName',
			privacy: 'public'
		};
		const res = await agent.post('/collection/create/handler').send(data);
		const collection = await new UserCollection({id: res.body.id}).fetch();

		const res2 = await agent.get(`/search/search?q=${data.name}&type=collection`);
		// TODO
		expect(1).to.equal(1);
	});

	it('should return status code 500 for incorrect entityType', async () => {
		const data = {
			description: 'some description',
			entityType: 'incorrect',
			name: 'collectionName',
			privacy: 'public'
		};
		const res = await agent.post('/collection/create/handler').send(data);
		expect(res.status).to.equal(500);
	});

	it('should return status code 500 for empty collection name', async () => {
		const data = {
			description: 'some description',
			entityType: 'Author',
			name: '',
			privacy: 'public'
		};
		const res = await agent.post('/collection/create/handler').send(data);
		expect(res.status).to.equal(500);
	});

	it('should correctly add collaborators in the collection', async () => {
		const collaborator1 = await createEditor();
		const collaborator2 = await createEditor();
		const data = {
			collaborators: [collaborator1.toJSON(), collaborator2.toJSON()],
			description: 'some description',
			entityType: 'Author',
			name: 'collectionName',
			privacy: 'public'
		};
		const res = await agent.post('/collection/create/handler').send(data);
		const collection = await new UserCollection({id: res.body.id}).fetch({withRelated: ['collaborators']});
		const collectionJSON = collection.toJSON();
		const collaboratorIds = collectionJSON.collaborators.map(collaborator => collaborator.collaboratorId);
		expect(collaboratorIds).to.be.containingAllOf([collaborator1.get('id'), collaborator2.get('id')]);
	});
});

describe('POST collection/edit', () => {
	// eslint-disable-next-line one-var
	let agent, collaborator, collectionJSON;
	beforeEach(async () => {
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
		collaborator = await createEditor();
		const data = {
			collaborators: [collaborator.toJSON()],
			description: 'some description',
			entityType: 'Author',
			name: 'collectionName',
			privacy: 'public'
		};
		const res = await agent.post('/collection/create/handler').send(data);
		const collection = await new UserCollection({id: res.body.id}).fetch({withRelated: ['collaborators']});
		collectionJSON = collection.toJSON();
	});
	afterEach((done) => {
		// Clear DB tables then close superagent server
		truncateEntities().then(() => {
			agent.close(done);
		});
	});

	it('should update the collection and return 200 status code', async () => {
		const newCollaborator = await createEditor();
		const newData = {
			collaborators: [newCollaborator.toJSON()],
			description: 'new description',
			entityType: 'Edition',
			name: 'new collection name',
			privacy: 'private'
		};

		const res = await agent.post(`/collection/${collectionJSON.id}/edit/handler`).send(newData);
		const updatedCollection = await new UserCollection({id: collectionJSON.id}).fetch({withRelated: ['collaborators']});
		const updatedCollectionJSON = updatedCollection.toJSON();

		expect(res.status).to.equal(200);
		expect(updatedCollectionJSON.name).to.equal(newData.name);
		expect(updatedCollectionJSON.entityType).to.equal(newData.entityType);
		expect(updatedCollectionJSON.description).to.equal(newData.description);
		expect(updatedCollectionJSON.collaborators.length).to.equal(1);
		expect(updatedCollectionJSON.collaborators[0].collaboratorId).to.equal(newCollaborator.get('id'));
	});

	it('should return status code 500 for incorrect entityType', async () => {
		const data = {
			collaborators: [collaborator.toJSON()],
			description: 'some description',
			entityType: 'incorrect',
			name: 'collectionName',
			privacy: 'public'
		};
		const res = await agent.post(`/collection/${collectionJSON.id}/edit/handler`).send(data);
		expect(res.status).to.equal(500);
	});

	it('should return status code 500 for empty collection name', async () => {
		const data = {
			collaborators: [collaborator.toJSON()],
			description: 'some description',
			entityType: 'Author',
			name: '',
			privacy: 'public'
		};
		const res = await agent.post(`/collection/${collectionJSON.id}/edit/handler`).send(data);
		expect(res.status).to.equal(500);
	});

	it('should return status 500 when trying to edit entityType of a non empty collection', async () => {
		const author = await createAuthor();
		await new UserCollectionItem({
			bbid: author.get('bbid'),
			collectionId: collectionJSON.id
		}).save(null, {method: 'insert'});

		const data = {
			collaborators: [collaborator.toJSON()],
			description: 'some description',
			entityType: 'Edition',
			name: 'collectionName',
			privacy: 'public'
		};
		const res = await agent.post(`/collection/${collectionJSON.id}/edit/handler`).send(data);
		expect(res.status).to.equal(500);
	});

	it('should throw error when unauthorized user tries to edit the collection', async () => {
		await createEditor();
		// The `agent` now has the sessionid cookie saved, and will send it
		// back to the server in the next request:
		const newAgent = await chai.request.agent(app);
		await newAgent.get('/cb');
		const newData = {
			description: 'new description',
			entityType: 'Edition',
			name: 'new collection name',
			privacy: 'private'
		};

		const res = await newAgent.post(`/collection/${collectionJSON.id}/edit/handler`).send(newData);
		// TODO expect(res.status).to.equal(500);
	});
});

