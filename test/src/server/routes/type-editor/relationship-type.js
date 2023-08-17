import {createEditor, createRelationshipType, truncateEntities} from '../../../../test-helpers/create-entities';
import app from '../../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../../bookbrainz-data';


const {RelationshipType} = orm;

chai.use(chaiHttp);
const {expect} = chai;

describe('Relationship Type routes with Relationship Editor priv', () => {
	let id1;
	let agent;
	before(async () => {
		try {
			id1 = await createRelationshipType();
			await createEditor(123456, 4);
		}
		catch (error) {
			// console.log(error);
		}
		// Log in; use agent to use logged in session
		agent = await chai.request.agent(app);
		await agent.get('/cb');
	});
	after(truncateEntities);

	it('should not throw an error while accessing Relationship Type Editor to create new relationship type', async () => {
		const res = await agent.get('/relationship-type/create');
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});

	it('should not throw an error while accessing Relationship Type Editor to edit an existing relationship type', async () => {
		const relationshipTypeId = id1;
		const res = await agent.get(`/relationship-type/${relationshipTypeId}/edit`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});

	it('should throw a 404 error when trying to access Relationship Type Editor with a non-existent id', async () => {
		const relationshipTypeId = 222;
		const res = await agent.get(`/relationship-type/${relationshipTypeId}/edit`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(404);
	});

	it('should throw an error when trying to access Relationship Type Editor with an invalid id', async () => {
		const relationshipTypeId = 'hello';
		const res = await agent.get(`/relationship-type/${relationshipTypeId}/edit`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(400);
	});

	it('should be able to create a new relationship type and return with status code 200', async () => {
		const relationshipTypeData = {
			attributeTypes: [],
			childOrder: 0,
			deprecated: false,
			description: 'test descryption',
			label: 'test label',
			linkPhrase: 'test phrase',
			oldAttributeTypes: [],
			parentId: null,
			reverseLinkPhrase: 'test reverse link phrase',
			sourceEntityType: 'Author',
			targetEntityType: 'Work'
		};
		const res = await agent.post('/relationship-type/create/handler').send(relationshipTypeData);
		const relationshipType = await new RelationshipType({id: res.body.id}).fetch();

		expect(relationshipType.get('id')).to.equal(res.body.id);
		expect(relationshipType.get('description')).to.equal(res.body.description);
		expect(relationshipType.get('label')).to.equal(res.body.label);
		expect(relationshipType.get('linkPhrase')).to.equal(res.body.linkPhrase);
		expect(relationshipType.get('reverseLinkPhrase')).to.equal(res.body.reverseLinkPhrase);
		expect(relationshipType.get('sourceEntityType')).to.equal(res.body.sourceEntityType);
		expect(relationshipType.get('targetEntityType')).to.equal(res.body.targetEntityType);
		expect(res.status).to.equal(200);
	});

	it('should be able to correctly update the relationship type and return status code 200', async () => {
		const newRelationshipTypeData = {
			attributeTypes: [],
			childOrder: 0,
			deprecated: false,
			description: 'new descryption',
			label: 'new label',
			linkPhrase: 'new phrase',
			oldAttributeTypes: [],
			parentId: null,
			reverseLinkPhrase: 'new reverse link phrase',
			sourceEntityType: 'Series',
			targetEntityType: 'Edition'
		};

		const res = await agent.post(`/relationship-type/${id1}/edit/handler`).send(newRelationshipTypeData);
		const updatedRelationshipType = await new RelationshipType({id: id1}).fetch({require: true});

		expect(updatedRelationshipType.get('id')).to.equal(res.body.id);
		expect(updatedRelationshipType.get('description')).to.equal(res.body.description);
		expect(updatedRelationshipType.get('label')).to.equal(res.body.label);
		expect(updatedRelationshipType.get('linkPhrase')).to.equal(res.body.linkPhrase);
		expect(updatedRelationshipType.get('reverseLinkPhrase')).to.equal(res.body.reverseLinkPhrase);
		expect(updatedRelationshipType.get('sourceEntityType')).to.equal(res.body.sourceEntityType);
		expect(updatedRelationshipType.get('targetEntityType')).to.equal(res.body.targetEntityType);
		expect(res.status).to.equal(200);
	});
});


describe('Relationship Type routes without Relationship Editor priv', () => {
	let id1;
	let agent;
	before(async () => {
		try {
			id1 = await createRelationshipType();
			await createEditor(123456, 1);
		}
		catch (error) {
			// console.log(error);
		}
		// Log in; use agent to use logged in session
		agent = await chai.request.agent(app);
		await agent.get('/cb');
	});
	after(truncateEntities);

	it('should throw an error while accessing Relationship Type Editor to create new relationship type', async () => {
		const res = await agent.get('/relationship-type/create');
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
		expect(res.res.statusMessage).to.equal('You do not have the privilege to access this route');
	});

	it('should throw an error while accessing Relationship Type Editor to edit an existing relationship type', async () => {
		const relationshipTypeId = id1;
		const res = await agent.get(`/relationship-type/${relationshipTypeId}/edit`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
		expect(res.res.statusMessage).to.equal('You do not have the privilege to access this route');
	});

	it('should throw an error when trying to access Relationship Type Editor with a non-existent id', async () => {
		const relationshipTypeId = 222;
		const res = await agent.get(`/relationship-type/${relationshipTypeId}/edit`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
	});

	it('should not be able to create a new relationship type', async () => {
		const relationshipTypeData = {
			attributeTypes: [],
			childOrder: 0,
			deprecated: false,
			description: 'test descryption',
			label: 'test label',
			linkPhrase: 'test phrase',
			oldAttributeTypes: [],
			parentId: null,
			reverseLinkPhrase: 'test reverse link phrase',
			sourceEntityType: 'Author',
			targetEntityType: 'Work'
		};
		const res = await agent.post('/relationship-type/create/handler').send(relationshipTypeData);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
		expect(res.res.statusMessage).to.equal('You do not have the privilege to access this route');
	});

	it('should not be able to update a relationship type', async () => {
		const newRelationshipTypeData = {
			attributeTypes: [],
			childOrder: 0,
			deprecated: false,
			description: 'new descryption',
			label: 'new label',
			linkPhrase: 'new phrase',
			oldAttributeTypes: [],
			parentId: null,
			reverseLinkPhrase: 'new reverse link phrase',
			sourceEntityType: 'Series',
			targetEntityType: 'Edition'
		};

		const res = await agent.post(`/relationship-type/${id1}/edit/handler`).send(newRelationshipTypeData);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
		expect(res.res.statusMessage).to.equal('You do not have the privilege to access this route');
	});
});


