import {createAuthor, createEditor, truncateEntities} from '../../../test-helpers/create-entities';

import app from '../../../../src/server/app';
import assertArrays from 'chai-arrays';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';


chai.use(chaiHttp);
chai.use(assertArrays);
const {expect} = chai;
const {UserCollection, UserCollectionCollaborator, UserCollectionItem} = orm;


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
		// await agent.get('/search/reindex');
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
		expect(collection.get('name')).to.equal(data.name);
		expect(collection.get('entityType')).to.equal(data.entityType);
		expect(collection.get('description')).to.equal(data.description);
		expect(collection.get('public')).to.equal(true);
		expect(res.status).to.equal(200);
	});

	it('should add the collection in the ES index', async () => {
		const data = {
			description: 'some description1234',
			entityType: 'Author',
			name: 'collectionName',
			privacy: 'public'
		};
		const res = await agent.post('/collection/create/handler').send(data);
		const res2 = await agent.get(`/search/search?q=${data.name}&type=Collection`);
		expect(res2.body[0].id).to.equal(res.body.id);
	});

	it('should throw error for incorrect entityType', async () => {
		const data = {
			description: 'some description',
			entityType: 'incorrect',
			name: 'collectionName',
			privacy: 'public'
		};
		const response = await agent.post('/collection/create/handler').send(data);

		expect(response.status).to.equal(400);
		expect(response.res.statusMessage).to.equal(`Invalid entity type: ${data.entityType} does not exist`);
	});

	it('should throw error for empty collection name', async () => {
		const data = {
			description: 'some description',
			entityType: 'Author',
			name: '',
			privacy: 'public'
		};
		const response = await agent.post('/collection/create/handler').send(data);

		expect(response.status).to.equal(400);
		expect(response.res.statusMessage).to.equal('Invalid collection name: Empty string not allowed');
	});

	it('should throw error for invalid collaborator id (string)', async () => {
		const data = {
			collaborators: [{id: 'abc', name: 'name'}],
			description: 'some description',
			entityType: 'Author',
			name: 'collectionName',
			privacy: 'public'
		};
		const response = await agent.post('/collection/create/handler').send(data);

		expect(response.status).to.equal(400);
		expect(response.res.statusMessage).to.equal(`Invalid collaborator id: ${data.collaborators[0].id} not valid`);
	});

	it('should throw error for invalid collaborator id (negative number)', async () => {
		const data = {
			collaborators: [{id: -123, name: 'name'}],
			description: 'some description',
			entityType: 'Author',
			name: 'collectionName',
			privacy: 'public'
		};
		const response = await agent.post('/collection/create/handler').send(data);

		expect(response.status).to.equal(400);
		expect(response.res.statusMessage).to.equal(`Invalid collaborator id: ${data.collaborators[0].id} not valid`);
	});

	it('should throw error for incorrect collaborator id (collaborator does not exist)', async () => {
		const data = {
			collaborators: [{id: 12345, name: 'name'}],
			description: 'some description',
			entityType: 'Author',
			name: 'collectionName',
			privacy: 'public'
		};
		const response = await agent.post('/collection/create/handler').send(data);

		expect(response.status).to.equal(400);
		expect(response.res.statusMessage).to.equal(`Collaborator ${data.collaborators[0].id} does not exist`);
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

		expect(res.status).to.equal(200);
		expect(collaboratorIds).to.be.containingAllOf([collaborator1.get('id'), collaborator2.get('id')]);
	});
});

describe('POST collection/edit', () => {
	// eslint-disable-next-line one-var
	let agent, collectionJSON, loggedInUser, oldCollaborator;
	before(async () => {
		try {
			loggedInUser = await createEditor(123456);
		}
		catch (error) {
			// console.log(error);
		}
		// The `agent` now has the sessionid cookie saved, and will send it
		// back to the server in the next request:
		agent = await chai.request.agent(app);
		await agent.get('/cb');
		oldCollaborator = await createEditor();
		const data = {
			collaborators: [oldCollaborator.toJSON()],
			description: 'some description',
			entityType: 'Author',
			name: 'collectionName',
			privacy: 'public'
		};
		const res = await agent.post('/collection/create/handler').send(data);
		const collection = await new UserCollection({id: res.body.id}).fetch({withRelated: ['collaborators']});
		collectionJSON = collection.toJSON();
	});
	after((done) => {
		// Clear DB tables then close superagent server
		truncateEntities().then(() => {
			agent.close(done);
		});
	});

	it('should correctly update the collection and return 200 status code', async () => {
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

	it('should correctly add a new collaborator and return 200 status code', async () => {
		const newCollaborator = await createEditor();
		const newData = {
			collaborators: [oldCollaborator.toJSON(), newCollaborator.toJSON()],
			description: 'some description',
			entityType: 'Author',
			name: 'collectionName',
			privacy: 'public'
		};

		const res = await agent.post(`/collection/${collectionJSON.id}/edit/handler`).send(newData);
		const updatedCollection = await new UserCollection({id: collectionJSON.id}).fetch({withRelated: ['collaborators']});
		const updatedCollectionJSON = updatedCollection.toJSON();

		expect(res.status).to.equal(200);
		expect(updatedCollectionJSON.collaborators.length).to.equal(2);
		const collaboratorIds = updatedCollectionJSON.collaborators.map(collaborator => collaborator.collaboratorId);
		expect(collaboratorIds).to.be.containingAllOf([oldCollaborator.get('id'), newCollaborator.get('id')]);
	});

	it('should correctly remove a collaborator and return 200 status code', async () => {
		const newData = {
			collaborators: [],
			description: 'some description',
			entityType: 'Author',
			name: 'collectionName',
			privacy: 'public'
		};

		const res = await agent.post(`/collection/${collectionJSON.id}/edit/handler`).send(newData);
		const updatedCollection = await new UserCollection({id: collectionJSON.id}).fetch({withRelated: ['collaborators']});
		const updatedCollectionJSON = updatedCollection.toJSON();

		expect(res.status).to.equal(200);
		expect(updatedCollectionJSON.collaborators.length).to.equal(0);
	});

	it('should update the collection in the ES index', async () => {
		const newData = {
			description: 'new description',
			entityType: 'Author',
			name: 'newName',
			privacy: 'public'
		};
		const res = await agent.post('/collection/create/handler').send(newData);
		const res2 = await agent.get(`/search/search?q=${newData.name}&type=collection`);
		expect(res2.body[0].id).to.equal(res.body.id);
	});

	it('should throw error for incorrect entityType', async () => {
		const data = {
			collaborators: [oldCollaborator.toJSON()],
			description: 'some description',
			entityType: 'incorrect',
			name: 'collectionName',
			privacy: 'public'
		};
		const response = await agent.post(`/collection/${collectionJSON.id}/edit/handler`).send(data);

		expect(response.status).to.equal(400);
		expect(response.res.statusMessage).to.equal(`Invalid entity type: ${data.entityType} does not exist`);
	});

	it('should throw error for empty collection name', async () => {
		const data = {
			collaborators: [oldCollaborator.toJSON()],
			description: 'some description',
			entityType: 'Author',
			name: '',
			privacy: 'public'
		};
		const response = await agent.post(`/collection/${collectionJSON.id}/edit/handler`).send(data);

		expect(response.status).to.equal(400);
		expect(response.res.statusMessage).to.equal('Invalid collection name: Empty string not allowed');
	});

	it('should throw error when trying to edit entityType of a non empty collection', async () => {
		const author = await createAuthor();
		await new UserCollectionItem({
			bbid: author.get('bbid'),
			collectionId: collectionJSON.id
		}).save(null, {method: 'insert'});

		const data = {
			collaborators: [oldCollaborator.toJSON()],
			description: 'some description',
			entityType: 'Edition',
			name: 'collectionName',
			privacy: 'public'
		};
		const response = await agent.post(`/collection/${collectionJSON.id}/edit/handler`).send(data);
		expect(response).to.have.status(400);
		expect(response.res.statusMessage).to.equal('Trying to change entityType of a non empty collection');
	});

	it('should throw error for invalid collaborator id (string)', async () => {
		const data = {
			collaborators: [{id: 'abc', name: 'name'}],
			description: 'some description',
			entityType: 'Author',
			name: 'collectionName',
			privacy: 'public'
		};
		const response = await agent.post(`/collection/${collectionJSON.id}/edit/handler`).send(data);

		expect(response.status).to.equal(400);
		expect(response.res.statusMessage).to.equal(`Invalid collaborator id: ${data.collaborators[0].id} not valid`);
	});

	it('should throw error for invalid collaborator id (negative number)', async () => {
		const data = {
			collaborators: [{id: -123, name: 'name'}],
			description: 'some description',
			entityType: 'Author',
			name: 'collection name',
			privacy: 'public'
		};
		const response = await agent.post(`/collection/${collectionJSON.id}/edit/handler`).send(data);

		expect(response.status).to.equal(400);
		expect(response.res.statusMessage).to.equal(`Invalid collaborator id: ${data.collaborators[0].id} not valid`);
	});

	it('should throw error for incorrect collaborator id (collaborator does not exist)', async () => {
		const data = {
			collaborators: [{id: 9999, name: 'name'}],
			description: 'some description',
			entityType: 'Author',
			name: 'collection name',
			privacy: 'public'
		};
		const response = await agent.post(`/collection/${collectionJSON.id}/edit/handler`).send(data);

		expect(response.status).to.equal(400);
		expect(response.res.statusMessage).to.equal(`Collaborator ${data.collaborators[0].id} does not exist`);
	});

	it('should throw error when unauthorized user tries to edit the collection', async () => {
		const editor = await createEditor();
		const data = {
			description: 'description',
			entityType: 'Edition',
			name: 'collection name',
			ownerId: editor.get('id'),
			public: true
		};
		const collection = await new UserCollection(data).save(null, {method: 'insert'});
		const newData = {
			...data,
			name: 'new collection name'
		};
		const response = await agent.post(`/collection/${collection.get('id')}/edit/handler`).send(newData);

		expect(response).to.have.status(403);
		expect(response.res.statusMessage).to.equal('You do not have permission to edit/delete this collection');
	});

	it('should throw error when collaborator tries to edit the collection', async () => {
		const editor = await createEditor();
		const data = {
			description: 'description',
			entityType: 'Edition',
			name: 'collection name',
			ownerId: editor.get('id'),
			public: true
		};
		const collection = await new UserCollection(data).save(null, {method: 'insert'});
		// making loggedInUser as collaborator
		await new UserCollectionCollaborator({
			collaboratorId: loggedInUser.get('id'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});

		const newData = {
			...data,
			name: 'new collection name'
		};
		const response = await agent.post(`/collection/${collection.get('id')}/edit/handler`).send(newData);

		expect(response).to.have.status(403);
		expect(response.res.statusMessage).to.equal('You do not have permission to edit/delete this collection');
	});
});

describe('POST /collection/collectionID/delete', () => {
	let agent;
	let loggedInUser;
	before(async () => {
		try {
			loggedInUser = await createEditor(123456);
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

	it('should be able to delete my collection', async () => {
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: loggedInUser.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const res = await agent.post(`/collection/${collection.get('id')}/delete/handler`).send();
		const collections = await new UserCollection({id: collection.get('id')}).fetchAll({require: false});
		const collectionsJSON = collections.toJSON();

		expect(res.status).to.equal(200);
		expect(collectionsJSON.length).to.equal(0);
	});

	it('should delete all the items along with the collection', async () => {
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: loggedInUser.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const author1 = await createAuthor();
		const author2 = await createAuthor();
		await new UserCollectionItem({
			bbid: author1.get('bbid'),
			collectionId: collection.get('id')
		});
		await new UserCollectionItem({
			bbid: author2.get('bbid'),
			collectionId: collection.get('id')
		});
		const res = await agent.post(`/collection/${collection.get('id')}/delete/handler`).send();

		const collections = await new UserCollection({id: collection.get('id')}).fetchAll({require: false});
		const items = await new UserCollectionItem({collectionId: collection.get('id')}).fetchAll({require: false});
		const collectionsJSON = collections.toJSON();
		const itemsJSON = items.toJSON();

		expect(res.status).to.equal(200);
		expect(collectionsJSON.length).to.equal(0);
		expect(itemsJSON.length).to.equal(0);
	});

	it('should delete all the collaborators along with the collection', async () => {
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: loggedInUser.get('id'),
			public: true
		};
		const collaborator1 = await createEditor();
		const collaborator2 = await createEditor();
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		await new UserCollectionCollaborator({
			collaboratorId: collaborator1.get('id'),
			collectionId: collection.get('id')
		});
		await new UserCollectionCollaborator({
			collaboratorId: collaborator2.get('id'),
			collectionId: collection.get('id')
		});

		const res = await agent.post(`/collection/${collection.get('id')}/delete/handler`).send();
		const collections = await new UserCollection({id: collection.get('id')}).fetchAll({require: false});
		const collaborators = await new UserCollectionCollaborator({collectionId: collection.get('id')}).fetchAll({require: false});
		const collaboratorsJSON = collaborators.toJSON();
		const collectionsJSON = collections.toJSON();

		expect(res.status).to.equal(200);
		expect(collectionsJSON.length).to.equal(0);
		expect(collaboratorsJSON.length).to.equal(0);
	});

	it('should not allow unauthorized user to delete the collection', async () => {
		const owner = await createEditor();
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: owner.get('id'),
			public: true
		};

		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		// here loggedInUser is neither owner nor collaborator
		const response = await agent.post(`/collection/${collection.get('id')}/delete/handler`).send();
		const collections = await new UserCollection().where('id', collection.get('id')).fetchAll({require: false});
		const collectionsJSON = collections.toJSON();

		expect(collectionsJSON.length).to.equal(1);
		expect(response).to.have.status(403);
		expect(response.res.statusMessage).to.equal('You do not have permission to edit/delete this collection');
	});

	it('should not allow collaborator to delete the collection', async () => {
		const owner = await createEditor();
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: owner.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		await new UserCollectionCollaborator({
			collaboratorId: loggedInUser.get('id'),
			collectionId: collection.get('id')
		});

		const response = await agent.post(`/collection/${collection.get('id')}/delete/handler`).send();
		const collections = await new UserCollection().where('id', collection.get('id')).fetchAll({require: false});
		const collectionsJSON = collections.toJSON();

		expect(collectionsJSON.length).to.equal(1);
		expect(response).to.have.status(403);
		expect(response.res.statusMessage).to.equal('You do not have permission to edit/delete this collection');
	});
});
