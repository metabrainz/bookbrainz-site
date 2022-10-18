import {createEdition, createEditor, createWork, getRandomUUID, truncateEntities} from '../../../test-helpers/create-entities';
import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import {get} from 'lodash';
import {getEntityByBBID} from '../../../../src/common/helpers/utils';
import orm from '../../../bookbrainz-data';
import {workToFormState} from '../../../../src/server/routes/entity/work';


const {RelationshipType} = orm;
chai.use(chaiHttp);
const {expect} = chai;

describe('Relationship', () => {
	const wBBID = getRandomUUID();
	const eBBID = getRandomUUID();
	const relationshipTypeData = {
		description: 'test descryption',
		id: 1,
		label: 'test label',
		linkPhrase: 'test phrase',
		reverseLinkPhrase: 'test reverse link phrase',
		sourceEntityType: 'Edition',
		targetEntityType: 'Work'
	};
	let work;
	let agent;
	const commonRels = {
		relationshipType: {
			id: 1
		},
		sourceEntity: {
			bbid: eBBID,
			type: 'Edition'
		},
		targetEntity: {
			bbid: wBBID,
			type: 'Work'
		}
	};
	before(async () => {
		await truncateEntities();
		await createEditor(123456);
		await new RelationshipType(relationshipTypeData).save(null, {method: 'insert'});
		createEdition(eBBID);
		work = (await (await createWork(wBBID, {relationshipSetId: null})).load('aliasSet.aliases')).toJSON();
		agent = await chai.request.agent(app);
		await agent.get('/cb');
	});
	after((done) => {
		// Clear DB tables then close superagent server
		truncateEntities().then(() => {
			agent.close(done);
		});
	});
	it('should be able to add relationship on an entity', async () => {
		work.relationships = [];
		work.annotation = {content: ''};
		const entityState = workToFormState(work);
		entityState.relationshipSection.relationships = {
			0: {
				isAdded: true,
				...commonRels
			}
		};
		entityState.submissionSection = {note: ''};
		const res = await agent.post(`/work/${wBBID}/edit/handler`).send(entityState);
		expect(res).to.have.status(200);
		const fetchedworkEntity = await getEntityByBBID(orm, wBBID);
		expect(Boolean(fetchedworkEntity)).to.be.true;
		const relationships = get(fetchedworkEntity, ['relationshipSet', 'relationships'], []);
		expect(relationships.length).to.be.equal(1);
		expect(get(relationships[0], 'targetBbid')).to.be.equal(wBBID);
		expect(get(relationships[0], 'sourceBbid')).to.be.equal(eBBID);
	});
	it('should be able to remove relationship of an entity', async () => {
		work.relationships = [];
		work.annotation = {content: ''};
		const entityState = workToFormState(work);
		entityState.relationshipSection.relationships = {
			0: {
				isRemoved: true,
				...commonRels
			}
		};
		entityState.submissionSection = {note: ''};
		const res = await agent.post(`/work/${wBBID}/edit/handler`).send(entityState);
		expect(res).to.have.status(200);
		const {body} = res;
		expect(body?.relationshipSetId).null;
	});
	it('should be able to add new relationships without having previous relationships', async () => {
		work.relationships = [];
		work.annotation = {content: ''};
		const entityState = workToFormState(work);
		entityState.relationshipSection.relationships = {
			0: {
				isAdded: true,
				...commonRels
			}
		};
		entityState.submissionSection = {note: ''};
		// mimicing the behavior when more than one users edit the relationships on the same entity
		await agent.post(`/work/${wBBID}/edit/handler`).send(entityState);
		const res = await agent.post(`/work/${wBBID}/edit/handler`).send(entityState);
		expect(res).to.have.status(200);
		// should now have two relationships in total
		const fetchedworkEntity = await getEntityByBBID(orm, wBBID);
		expect(Boolean(fetchedworkEntity)).to.be.true;
		const relationships = get(fetchedworkEntity, ['relationshipSet', 'relationships'], []);
		expect(relationships.length).to.be.equal(2);
		expect(get(relationships[1], 'targetBbid')).to.be.equal(wBBID);
		expect(get(relationships[1], 'sourceBbid')).to.be.equal(eBBID);
	});
});
