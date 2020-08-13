import {createAuthor, createEditor, truncateEntities} from '../../../test-helpers/create-entities';
import {generateIndex, refreshIndex, searchByName} from '../../../../src/server/helpers/search';

import app from '../../../../src/server/app';
import assertArrays from 'chai-arrays';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';
// eslint-disable-next-line import/no-internal-modules
import uuidv4 from 'uuid/v4';


chai.use(chaiHttp);
chai.use(assertArrays);
const {expect} = chai;
const {UserCollection, UserCollectionCollaborator, UserCollectionItem} = orm;


describe('POST /collection/create', () => {
	let agent;
<<<<<<< HEAD
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
		await generateIndex(orm);
		agent = await chai.request.agent(app);
		await agent.get('/cb');
	});
	after((done) => {
		// Clear DB tables then close superagent server
		truncateEntities().then(() => {
			agent.close(done);
		});
	});

<<<<<<< HEAD
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
			name: 'shouldBeInES',
			privacy: 'public'
		};
		const res = await agent.post('/collection/create/handler').send(data);
		await refreshIndex();
		const searchResults = await searchByName(orm, data.name, 'Collection', '10', '0');

		expect(searchResults[0].id).to.equal(res.body.id);
		expect(searchResults[0].name).to.equal(data.name);
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

		expect(response.status).to.equal(404);
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
=======
	let loggedInUser;
>>>>>>> chore: check error message in test
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
		await generateIndex(orm);
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
			name: 'updatedNameInES',
			privacy: 'public'
		};
		await agent.post(`/collection/${collectionJSON.id}/edit/handler`).send(newData);
		await refreshIndex();
		const searchResults = await searchByName(orm, newData.name, 'Collection', '10', '0');
		expect(searchResults[0].id).to.equal(collectionJSON.id);
		expect(searchResults[0].name).to.equal(newData.name);
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

		expect(response.status).to.equal(404);
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

=======
	it('should be able to add to my own collection', async () => {
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: loggedInUser.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const author = await createAuthor();
		const data = {
			bbids: [author.get('bbid')]
		};
		const res = await agent.post(`/collection/${collection.get('id')}/add`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({});
		const itemJSON = item.toJSON();
		expect(res.status).to.equal(200);
		expect(itemJSON.length).to.equal(1);
		expect(itemJSON[0].collectionId).to.equal(collection.get('id'));
		expect(itemJSON[0].bbid).to.equal(author.get('bbid'));
	});

	it('should be able to add to public collection I"m collaborator of', async () => {
		const owner = await createEditor();
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: owner.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		// make logged in user collaborator of this collection
		await new UserCollectionCollaborator({
			collaboratorId: loggedInUser.get('id'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});
		const author = await createAuthor();
		const data = {
			bbids: [author.get('bbid')]
		};
		const res = await agent.post(`/collection/${collection.get('id')}/add`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({require: false});
		const itemJSON = item.toJSON();

		expect(res.status).to.equal(200);
		expect(itemJSON.length).to.equal(1);
		expect(itemJSON[0].collectionId).to.equal(collection.get('id'));
		expect(itemJSON[0].bbid).to.equal(author.get('bbid'));
	});

	it('should be able to add to private collection I"m collaborator of', async () => {
		const owner = await createEditor();
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: owner.get('id'),
			public: false
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		// make logged in user collaborator of this collection
		await new UserCollectionCollaborator({
			collaboratorId: loggedInUser.get('id'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});
		const author = await createAuthor();
		const data = {
			bbids: [author.get('bbid')]
		};
		const res = await agent.post(`/collection/${collection.get('id')}/add`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({require: false});
		const itemJSON = item.toJSON();

		expect(res.status).to.equal(200);
		expect(itemJSON.length).to.equal(1);
		expect(itemJSON[0].collectionId).to.equal(collection.get('id'));
		expect(itemJSON[0].bbid).to.equal(author.get('bbid'));
	});

	it('should be able to add multiple items', async () => {
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: loggedInUser.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const author = await createAuthor();
		const author2 = await createAuthor();
		const data = {
			bbids: [author.get('bbid'), author2.get('bbid')]
		};
		const res = await agent.post(`/collection/${collection.get('id')}/add`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({require: false});
		const itemJSON = item.toJSON();

		expect(res.status).to.equal(200);
		expect(itemJSON.length).to.equal(2);
		const itemsBBID = itemJSON.map(currentItem => currentItem.bbid);
		expect(itemsBBID.length).to.equal(2);
		expect(itemsBBID).to.be.containingAllOf([author.get('bbid'), author2.get('bbid')]);
	});

	it('should not add duplicate items', async () => {
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: loggedInUser.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const author = await createAuthor();
		const data = {
			bbids: [author.get('bbid'), author.get('bbid')]
		};
		const res = await agent.post(`/collection/${collection.get('id')}/add`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({require: false});
		const itemJSON = item.toJSON();

		expect(res.status).to.equal(200);
		expect(itemJSON.length).to.equal(1);
		expect(itemJSON[0].collectionId).to.equal(collection.get('id'));
		expect(itemJSON[0].bbid).to.equal(author.get('bbid'));
	});

	it('should not be able to add to a private collection I’m not a collaborator of', async () => {
		const owner = await createEditor();
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: owner.get('id'),
			public: false
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const author = await createAuthor();
		const data = {
			bbids: [author.get('bbid')]
		};
		const response = await agent.post(`/collection/${collection.get('id')}/add`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({require: false});
		const itemJSON = item.toJSON();

		expect(response.status).to.equal(403);
		expect(response.res.statusMessage).to.equal('You do not have permission to edit this collection');
		expect(itemJSON.length).to.equal(0);
	});

	it('should not be able to add to a public collection I’m not a collaborator of', async () => {
		const owner = await createEditor();
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: owner.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const author = await createAuthor();
		const data = {
			bbids: [author.get('bbid')]
		};
		const response = await agent.post(`/collection/${collection.get('id')}/add`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({require: false});
		const itemJSON = item.toJSON();

		expect(response.status).to.equal(403);
		expect(response.res.statusMessage).to.equal('You do not have permission to edit this collection');
		expect(itemJSON.length).to.equal(0);
	});

	it('should throw an error when trying to add entity with invalid bbid', async () => {
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: loggedInUser.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const data = {
			bbids: ['not-a-bbid']
		};
		const response = await agent.post(`/collection/${collection.get('id')}/add`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({});
		const itemJSON = item.toJSON();
		expect(response).to.have.status(400);
		expect(response.res.statusMessage).to.equal('Trying to add an entity having invalid BBID');
		expect(itemJSON.length).to.equal(0);
	});

	it('should throw an error when trying to add an entity that does not exist', async () => {
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: loggedInUser.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const data = {
			bbids: [uuidv4()]
		};
		const response = await agent.post(`/collection/${collection.get('id')}/add`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({});
		const itemJSON = item.toJSON();
<<<<<<< HEAD
		expect(response).to.have.status(400);
		expect(response.res.statusMessage).to.equal('Trying to add an entity which is not present');
=======
		expect(response).to.have.status(404);
		expect(response.res.statusMessage).to.equal(`${collectionData.entityType} ${data.bbids[0]} does not exist`);
>>>>>>> test: throw 404 error instead of 400 for entity not found
		expect(itemJSON.length).to.equal(0);
	});

	it('should throw an error when trying to add wrong entity type', async () => {
		const collectionData = {
			description: 'description',
			entityType: 'Edition',
			name: 'collection name',
			ownerId: loggedInUser.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const author = await createAuthor();
		const data = {
			bbids: [author.get('bbid')]
		};
		const response = await agent.post(`/collection/${collection.get('id')}/add`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({});
		const itemJSON = item.toJSON();

		expect(response).to.have.status(400);
		expect(response.res.statusMessage).to.equal('Trying to add an entity of type Author to a collection of type Edition');
		expect(itemJSON.length).to.equal(0);
	});
});


describe('POST /collection/:collectionID/remove', () => {
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

	it('should be able to remove from my own collection', async () => {
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: loggedInUser.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const author = await createAuthor();
		await new UserCollectionItem({
			bbid: author.get('bbid'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});
		const data = {
			bbids: [author.get('bbid')]
		};
		const res = await agent.post(`/collection/${collection.get('id')}/remove`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({require: false});
		const itemJSON = item.toJSON();

		expect(res.status).to.equal(200);
		expect(itemJSON.length).to.equal(0);
	});

	it('should throw error when trying to remove an entity with invalid bbid', async () => {
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: loggedInUser.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const author = await createAuthor();
		await new UserCollectionItem({
			bbid: author.get('bbid'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});
		const data = {
			bbids: ['not-a-bbid']
		};
		const response = await agent.post(`/collection/${collection.get('id')}/remove`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({require: false});
		const itemJSON = item.toJSON();

		expect(response.status).to.equal(400);
		expect(response.res.statusMessage).to.equal('Trying to remove an entity having invalid bbid');
		expect(itemJSON.length).to.equal(1);
	});

	it('should throw error when trying to remove an entity that do not exist in the collection', async () => {
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: loggedInUser.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const author = await createAuthor();
		await new UserCollectionItem({
			bbid: author.get('bbid'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});
		const author2 = await createAuthor();
		const data = {
			bbids: [author2.get('bbid')]
		};
		const response = await agent.post(`/collection/${collection.get('id')}/remove`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({require: false});
		const itemJSON = item.toJSON();

		expect(response.status).to.equal(400);
		expect(response.res.statusMessage).to.equal('Trying to remove an entity which is not present in the collection');
		expect(itemJSON.length).to.equal(1);
	});

	it('should be able to remove from public collection I"m collaborator of', async () => {
		const owner = await createEditor();
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: owner.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		// make logged in user collaborator of this collection
		await new UserCollectionCollaborator({
			collaboratorId: loggedInUser.get('id'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});
		const author = await createAuthor();
		// add author to this collection
		await new UserCollectionItem({
			bbid: author.get('bbid'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});
		const data = {
			bbids: [author.get('bbid')]
		};
		const res = await agent.post(`/collection/${collection.get('id')}/remove`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({require: false});
		const itemJSON = item.toJSON();
		expect(res.status).to.equal(200);
		expect(itemJSON.length).to.equal(0);
	});

	it('should be able to remove from private collection I"m collaborator of', async () => {
		const owner = await createEditor();
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: owner.get('id'),
			public: false
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		// make logged in user collaborator of this collection
		await new UserCollectionCollaborator({
			collaboratorId: loggedInUser.get('id'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});
		const author = await createAuthor();
		// add author to this collection
		await new UserCollectionItem({
			bbid: author.get('bbid'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});
		const data = {
			bbids: [author.get('bbid')]
		};
		const res = await agent.post(`/collection/${collection.get('id')}/remove`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({require: false});
		const itemJSON = item.toJSON();
		expect(res.status).to.equal(200);
		expect(itemJSON.length).to.equal(0);
	});

	it('should be able to remove multiple items', async () => {
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: loggedInUser.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const author = await createAuthor();
		const author2 = await createAuthor();
		await new UserCollectionItem({
			bbid: author.get('bbid'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});
		await new UserCollectionItem({
			bbid: author2.get('bbid'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});
		const data = {
			bbids: [author.get('bbid'), author2.get('bbid')]
		};
		const res = await agent.post(`/collection/${collection.get('id')}/remove`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({require: false});
		const itemJSON = item.toJSON();

		expect(res.status).to.equal(200);
		expect(itemJSON.length).to.equal(0);
	});

	it('should not be able to remove from a private collection I’m not a collaborator of', async () => {
		const owner = await createEditor();
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: owner.get('id'),
			public: false
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const author = await createAuthor();
		// add author to this collection
		await new UserCollectionItem({
			bbid: author.get('bbid'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});
		const data = {
			bbids: [author.get('bbid')]
		};
		const response = await agent.post(`/collection/${collection.get('id')}/remove`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({require: false});
		const itemJSON = item.toJSON();
		expect(response.status).to.equal(403);
		expect(response.res.statusMessage).to.equal('You do not have permission to edit this collection');
		expect(itemJSON.length).to.equal(1);
	});

	it('should not be able to remove from a public collection I’m not a collaborator of', async () => {
		const owner = await createEditor();
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'collection name',
			ownerId: owner.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		const author = await createAuthor();
		// add author to this collection
		await new UserCollectionItem({
			bbid: author.get('bbid'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});
		const data = {
			bbids: [author.get('bbid')]
		};
		const response = await agent.post(`/collection/${collection.get('id')}/remove`).send(data);
		const item = await new UserCollectionItem().where('collection_id', collection.get('id')).fetchAll({require: false});
		const itemJSON = item.toJSON();
		expect(response.status).to.equal(403);
		expect(response.res.statusMessage).to.equal('You do not have permission to edit this collection');
		expect(itemJSON.length).to.equal(1);
	});
});
