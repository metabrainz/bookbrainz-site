
import {createAuthor, createEditor, truncateEntities} from '../../../test-helpers/create-entities';
import {generateIndex, refreshIndex, searchByName} from '../../../../src/server/helpers/search';
import app from '../../../../src/server/app';
import assertArrays from 'chai-arrays';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';

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
		await generateIndex(orm);
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

	it('should remove collection from ES index', async () => {
		const collectionData = {
			description: 'description',
			entityType: 'Author',
			name: 'someUniqueName',
			ownerId: loggedInUser.get('id'),
			public: true
		};
		const collection = await new UserCollection(collectionData).save(null, {method: 'insert'});
		await generateIndex(orm);
		const oldResult = await searchByName(orm, collectionData.name, 'Collection', 10, 0);
		const res = await agent.post(`/collection/${collection.get('id')}/delete/handler`).send();
		await refreshIndex();
		const newResult = await searchByName(orm, collectionData.name, 'Collection', 10, 0);
		const collections = await new UserCollection({id: collection.get('id')}).fetchAll({require: false});
		const collectionsJSON = collections.toJSON();

		expect(res.status).to.equal(200);
		expect(oldResult.length).to.equal(1);
		expect(oldResult[0]?.id).to.equal(collection.get('id'));
		expect(newResult.length).to.equal(0);
		expect(collectionsJSON.length).to.equal(0);
	});
});
