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


describe('POST /collection/:collectionID/add', () => {
	let agent;
	let loggedInUser;
	beforeEach(async () => {
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
	afterEach((done) => {
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
		const item = await new UserCollectionItem({
			collectionId: collection.get('id')
		}).fetchAll({});
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
		const item = await new UserCollectionItem({
			collectionId: collection.get('id')
		}).fetchAll({});
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
		const item = await new UserCollectionItem({
			collectionId: collection.get('id')
		}).fetchAll({});
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
		const item = await new UserCollectionItem({
			collectionId: collection.get('id')
		}).fetchAll({});
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
		const item = await new UserCollectionItem({
			collectionId: collection.get('id')
		}).fetchAll({});
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
		const res = await agent.post(`/collection/${collection.get('id')}/add`).send(data);
		const item = await new UserCollectionItem({
			collectionId: collection.get('id')
		}).fetchAll({});
		const itemJSON = item.toJSON();

		expect(res.status).to.equal(403);
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
		const res = await agent.post(`/collection/${collection.get('id')}/add`).send(data);
		const item = await new UserCollectionItem({
			collectionId: collection.get('id')
		}).fetchAll({});
		const itemJSON = item.toJSON();

		expect(res.status).to.equal(403);
		expect(itemJSON.length).to.equal(0);
	});
});


describe('POST /collection/:collectionID/add', () => {
	let agent;
	let loggedInUser;
	beforeEach(async () => {
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
	afterEach((done) => {
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
		const item = await new UserCollectionItem({
			collectionId: collection.get('id')
		}).fetchAll({});
		const itemJSON = item.toJSON();

		expect(res.status).to.equal(200);
		expect(itemJSON.length).to.equal(0);
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
		const item = await new UserCollectionItem({
			collectionId: collection.get('id')
		}).fetchAll({});
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
		const item = await new UserCollectionItem({
			collectionId: collection.get('id')
		}).fetchAll({});
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
		const item = await new UserCollectionItem({
			collectionId: collection.get('id')
		}).fetchAll({});
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
		const res = await agent.post(`/collection/${collection.get('id')}/remove`).send(data);
		const item = await new UserCollectionItem({
			collectionId: collection.get('id')
		}).fetchAll({});
		const itemJSON = item.toJSON();
		expect(res.status).to.equal(403);
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
		const res = await agent.post(`/collection/${collection.get('id')}/remove`).send(data);
		const item = await new UserCollectionItem({
			collectionId: collection.get('id')
		}).fetchAll({});
		const itemJSON = item.toJSON();
		expect(res.status).to.equal(403);
		expect(itemJSON.length).to.equal(1);
	});
});
