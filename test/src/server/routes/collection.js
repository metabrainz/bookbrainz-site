import {createAuthor, createEditor, truncateEntities} from '../../../test-helpers/create-entities';

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


describe('POST /collection/:collectionID/add', () => {
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
		expect(response).to.have.status(400);
		expect(response.res.statusMessage).to.equal('Trying to add an entity which is not present');
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
