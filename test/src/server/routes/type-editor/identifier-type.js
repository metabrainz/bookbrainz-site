import {createEditor, createIdentifierType, truncateEntities} from '../../../../test-helpers/create-entities';
import app from '../../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../../bookbrainz-data';


const {IdentifierType} = orm;

chai.use(chaiHttp);
const {expect} = chai;

describe('Identifier Type routes with Identifier Editor priv', () => {
	let id1;
	let agent;
	before(async () => {
		try {
			id1 = await createIdentifierType();
			await createEditor(123456, 2);
		}
		catch (error) {
			// console.log(error);
		}
		// Log in; use agent to use logged in session
		agent = await chai.request.agent(app);
		await agent.get('/cb');
	});
	after(truncateEntities);

	it('should not throw an error while accessing Identifier Type Editor to create new Identifier type', async () => {
		const res = await agent.get('/identifier-type/create');
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});

	it('should not throw an error while accessing Identifier Type Editor to edit an existing Identifier type', async () => {
		const identifierTypeId = id1;
		const res = await agent.get(`/identifier-type/${identifierTypeId}/edit`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});

	it('should throw a 404 error when trying to access Identifier Type Editor with a non-existent id', async () => {
		const identifierTypeId = 222435;
		const res = await agent.get(`/identifier-type/${identifierTypeId}/edit`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(404);
	});

	it('should throw an error when trying to access Identifier Type Editor with an invalid id', async () => {
		const identifierTypeId = 'hello';
		const res = await agent.get(`/identifier-type/${identifierTypeId}/edit`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(400);
	});

	it('should be able to create a new Identifier type and return with status code 200', async () => {
		const identifierTypeData = {
			childOrder: 0,
			deprecated: false,
			description: 'test description',
			detectionRegex: 'test',
			displayTemplate: 'test',
			entityType: 'Author',
			label: 'test label',
			parentId: null,
			validationRegex: 'test'
		};
		const res = await agent.post('/identifier-type/create/handler').send(identifierTypeData);
		const identifierType = await new IdentifierType({id: res.body.id}).fetch();

		expect(identifierType.get('id')).to.equal(res.body.id);
		expect(identifierType.get('description')).to.equal(res.body.description);
		expect(identifierType.get('label')).to.equal(res.body.label);
		expect(identifierType.get('deprecated')).to.equal(res.body.deprecated);
		expect(identifierType.get('childOrder')).to.equal(res.body.childOrder);
		expect(identifierType.get('detectionRegex')).to.equal(res.body.detectionRegex);
		expect(identifierType.get('entityType')).to.equal(res.body.entityType);
		expect(identifierType.get('validationRegex')).to.equal(res.body.validationRegex);
		expect(identifierType.get('displayTemplate')).to.equal(res.body.displayTemplate);
		expect(identifierType.get('parentId')).to.equal(res.body.parentId);
		expect(res.status).to.equal(200);
	});

	it('should be able to correctly update the Identifier type and return status code 200', async () => {
		const newIdentifierTypeData = {
			childOrder: 0,
			deprecated: false,
			description: 'test description',
			detectionRegex: 'test',
			displayTemplate: 'test',
			entityType: 'Series',
			label: 'test label',
			parentId: null,
			validationRegex: 'test'
		};

		const res = await agent.post(`/identifier-type/${id1}/edit/handler`).send(newIdentifierTypeData);
		const updatedIdentifierType = await new IdentifierType({id: id1}).fetch({require: true});

		expect(updatedIdentifierType.get('id')).to.equal(res.body.id);
		expect(updatedIdentifierType.get('description')).to.equal(res.body.description);
		expect(updatedIdentifierType.get('label')).to.equal(res.body.label);
		expect(updatedIdentifierType.get('deprecated')).to.equal(res.body.deprecated);
		expect(updatedIdentifierType.get('childOrder')).to.equal(res.body.childOrder);
		expect(updatedIdentifierType.get('detectionRegex')).to.equal(res.body.detectionRegex);
		expect(updatedIdentifierType.get('entityType')).to.equal(res.body.entityType);
		expect(updatedIdentifierType.get('validationRegex')).to.equal(res.body.validationRegex);
		expect(updatedIdentifierType.get('displayTemplate')).to.equal(res.body.displayTemplate);
		expect(updatedIdentifierType.get('parentId')).to.equal(res.body.parentId);
		expect(res.status).to.equal(200);
	});
});


describe('Identifier Type routes without Identifier Editor priv', () => {
	let id1;
	let agent;
	before(async () => {
		try {
			id1 = await createIdentifierType();
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

	it('should throw an error while accessing Identifier Type Editor to create new Identifier type', async () => {
		const res = await agent.get('/identifier-type/create');
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
		expect(res.res.statusMessage).to.equal('You do not have the privilege to access this route');
	});

	it('should throw an error while accessing Identifier Type Editor to edit an existing Identifier type', async () => {
		const identifierTypeId = id1;
		const res = await agent.get(`/identifier-type/${identifierTypeId}/edit`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
		expect(res.res.statusMessage).to.equal('You do not have the privilege to access this route');
	});

	it('should throw an error when trying to access Identifier Type Editor with a non-existent id', async () => {
		const identifierTypeId = 222;
		const res = await agent.get(`/identifier-type/${identifierTypeId}/edit`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
	});

	it('should not be able to create a new Identifier type', async () => {
		const identifierTypeData = {
			childOrder: 0,
			deprecated: false,
			description: 'test description',
			detectionRegex: 'test',
			displayTemplate: 'test',
			entityType: 'Author',
			label: 'test label',
			parentId: null,
			validationRegex: 'test'
		};
		const res = await agent.post('/identifier-type/create/handler').send(identifierTypeData);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
		expect(res.res.statusMessage).to.equal('You do not have the privilege to access this route');
	});

	it('should not be able to update a Identifier type', async () => {
		const newIdentifierTypeData = {
			childOrder: 0,
			deprecated: false,
			description: 'test description',
			detectionRegex: 'test',
			displayTemplate: 'test',
			entityType: 'Series',
			label: 'test label',
			parentId: null,
			validationRegex: 'test'
		};

		const res = await agent.post(`/identifier-type/${id1}/edit/handler`).send(newIdentifierTypeData);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
		expect(res.res.statusMessage).to.equal('You do not have the privilege to access this route');
	});
});


