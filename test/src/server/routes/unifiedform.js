import {authorWorkRelationshipTypeData, baseState, createAuthor, createEditionGroup,
	createEditor, createPublisher, createWork, getRandomUUID, languageAttribs, truncateEntities} from '../../../test-helpers/create-entities';
import {every, forOwn, get, map} from 'lodash';
import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import {getEntityByBBID} from '../../../../src/common/helpers/utils';
import orm from '../../../bookbrainz-data';


const {Language, RelationshipType} = orm;
const relationshipTypeData = {
	description: 'test descryption',
	label: 'test label',
	linkPhrase: 'test phrase',
	reverseLinkPhrase: 'test reverse link phrase',
	sourceEntityType: 'Edition',
	targetEntityType: 'Work'
};
chai.use(chaiHttp);
const {expect} = chai;

function areKeysEqual(fromObj, toObj) {
	return every(map(fromObj, (value, key) => toObj[key] === value));
}
function testDefaultAlias(entity, languageId) {
	const expectedDefaultAlias = {
		languageId,
		name: baseState.nameSection.name,
		primary: true,
		sortName: baseState.nameSection.sortName
	};
	const {defaultAlias: actualDefaultAlias} = entity;
	return areKeysEqual(expectedDefaultAlias, actualDefaultAlias);
}

describe('Unified form routes with entity editing priv', () => {
	let agent;
	let newLanguage;
	let newRelationshipType;
	let authorWorkRelationshipType;
	const wBBID = getRandomUUID();
	const pBBID = getRandomUUID();
	const egBBID = getRandomUUID();
	const aBBID = getRandomUUID();
	before(async () => {
		try {
			await createEditor(123456);
			await createWork(wBBID);
			await createPublisher(pBBID);
			await createEditionGroup(egBBID);
			await createAuthor(aBBID);
			newRelationshipType = await new RelationshipType(relationshipTypeData)
				.save(null, {method: 'insert'});
			newLanguage = await new Language({...languageAttribs})
				.save(null, {method: 'insert'});
			authorWorkRelationshipType = await new RelationshipType(authorWorkRelationshipTypeData)
				.save(null, {method: 'insert'});
		}
		catch (error) {
			// console.log(error);
		}
		// Log in; use agent to use logged in session
		agent = await chai.request.agent(app);
		await agent.get('/cb');
	});

	after(truncateEntities);
	it('should not throw error while creating single entity', async () => {
		const postData = {b0: {
			...baseState,
			editionSection: {authorCreditEnable: false},
			type: 'Edition'
		}};
		postData.b0.nameSection.language = newLanguage.id;
		const res = await agent.post('/create/handler').send(postData);
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
		const createdEntities = res.body;
		expect(createdEntities.length).equal(1);
		const editionEntity = createdEntities[0];
		const fetchedEditionEntity = await getEntityByBBID(orm, editionEntity.bbid);
		expect(Boolean(fetchedEditionEntity)).to.be.true;
		expect(testDefaultAlias(fetchedEditionEntity, newLanguage.id)).to.be.true;
	});

	it('should not throw error while editing single entity', async () => {
		const postData = {b0: {
			__isNew__: false,
			id: wBBID,
			nameSection: {},
			submissionSection: {
				note: 'note',
				submitError: '',
				submitted: false
			},
			type: 'Work'
		}};
		const newName = 'changedName';
		postData.b0.nameSection.name = newName;
		const res = await agent.post('/create/handler').send(postData);
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
		const editEntities = res.body;
		expect(editEntities.length).equal(1);
		const workEntity = editEntities[0];
		const fetchedworkEntity = await getEntityByBBID(orm, workEntity.bbid);
		expect(Boolean(fetchedworkEntity)).to.be.true;
		expect(fetchedworkEntity.defaultAlias.name).to.be.equal(newName);
	});

	it('should not throw error while adding relationship to single entity', async () => {
		// we need to pass extra id and __isNew__ attributes
		const postData = {b0: {
			__isNew__: false,
			id: wBBID,
			relationshipSection: {
				relationships: {
					a0: {
						attributeSetId: null,
						attributes: [],
						isAdded: true,
						relationshipType: {
							id: authorWorkRelationshipType.id
						},
						rowId: 'a0',
						sourceEntity: {
							bbid: aBBID
						},
						targetEntity: {
							bbid: wBBID
						}
					}
				}
			},
			submissionSection: {
				note: 'note',
				submitError: '',
				submitted: false
			},
			type: 'Work'
		}};
		const res = await agent.post('/create/handler').send(postData);
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
		const editEntities = res.body;
		expect(editEntities.length).equal(1);
		const workEntity = editEntities[0];
		const fetchedworkEntity = await getEntityByBBID(orm, workEntity.bbid);
		expect(Boolean(fetchedworkEntity)).to.be.true;
		const relationships = get(fetchedworkEntity, ['relationshipSet', 'relationships'], []);
		// one relationship added on creation
		expect(relationships.length).to.be.equal(2);
		expect(get(relationships[1], 'targetBbid')).to.be.equal(wBBID);
		expect(get(relationships[1], 'sourceBbid')).to.be.equal(aBBID);
	});

	it('should not throw error while creating multiple entities', async () => {
		const postData = {b0: {
			...baseState,
			editionSection: {authorCreditEnable: false},
			type: 'Edition'
		},
		b1: {
			...baseState,
			type: 'Work',
			workSection: {
				languages: [],
				type: null
			}
		}};
		forOwn(postData, (value) => {
			value.nameSection.language = newLanguage.id;
		});
		const res = await agent.post('/create/handler').send(postData);
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
		const createdEntities = res.body;
		expect(createdEntities.length).equal(2);
		const conditions = await map(createdEntities, async (entity) => {
			const fetchedEntity = await getEntityByBBID(orm, entity.bbid);
			return !fetchedEntity ? false : testDefaultAlias(fetchedEntity, newLanguage.id);
		});
		expect(every(conditions)).to.be.true;
	});

	it('should not throw error when linking existing works to edition', async () => {
		const postData = {b0: {
			...baseState,
			editionSection: {authorCreditEnable: false},
			relationshipSection: {
				relationships: {
					n0: {
						attributeSetId: null,
						attributes: [],
						isAdded: true,
						relationshipType: {
							id: newRelationshipType.id
						},
						rowID: 'n0',
						sourceEntity: {
						},
						targetEntity: {
							bbid: wBBID
						}
					}
				}
			},
			type: 'Edition'
		}};
		forOwn(postData, (value) => {
			value.nameSection.language = newLanguage.id;
		});
		const res = await agent.post('/create/handler').send(postData);
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
		const createdEntities = res.body;
		expect(createdEntities.length).equal(1);
		const editionEntity = createdEntities.find((entity) => entity.type === 'Edition');
		const fetchedEditionEntity = await getEntityByBBID(orm, editionEntity.bbid);
		expect(Boolean(fetchedEditionEntity)).to.be.true;
		const relationship = fetchedEditionEntity.relationshipSet.relationships[0];
		expect(relationship.sourceBbid).equal(fetchedEditionEntity.bbid);
		expect(relationship.targetBbid).equal(wBBID);
	});

	it('should not throw error while linking existing publisher to edition', async () => {
		const postData = {b0: {
			...baseState,
			editionSection: {
				authorCreditEnable: false,
				publisher: {
					0: {
						id: pBBID
					}
				}
			},
			type: 'Edition'
		}};
		postData.b0.nameSection.language = newLanguage.id;
		const res = await agent.post('/create/handler').send(postData);
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
		const createdEntities = res.body;
		expect(createdEntities.length).equal(1);
		const editionEntity = createdEntities.find((entity) => entity.type === 'Edition');
		const fetchedEditionEntity = await getEntityByBBID(orm, editionEntity.bbid, ['publisherSet.publishers']);
		expect(Boolean(fetchedEditionEntity)).to.be.true;
		const publisherId = fetchedEditionEntity.publisherSet.publishers[0].bbid;
		expect(publisherId).equal(pBBID);
	});


	it('should not throw error while linking existing edition-group to edition', async () => {
		const postData = {b0: {
			...baseState,
			editionSection: {
				authorCreditEnable: false,
				editionGroup: {
					id: egBBID
				}
			},
			type: 'Edition'
		}};
		postData.b0.nameSection.language = newLanguage.id;
		const res = await agent.post('/create/handler').send(postData);
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
		const createdEntities = res.body;
		expect(createdEntities.length).equal(1);
		const editionEntity = createdEntities.find((entity) => entity.type === 'Edition');
		const fetchedEditionEntity = await getEntityByBBID(orm, editionEntity.bbid, ['editionGroup']);
		expect(Boolean(fetchedEditionEntity)).to.be.true;
		const editionGroupBbid = fetchedEditionEntity.editionGroup.bbid;
		expect(editionGroupBbid).equal(egBBID);
	});

	it('should not throw error while linking existing author to edition using AC', async () => {
		const postData = {b0: {
			...baseState,
			authorCreditEditor: {
				n0: {
					author: {
						id: aBBID
					},
					joinPhrase: '',
					name: 'author1'
				}
			},
			editionSection: {},
			type: 'Edition'
		}};
		postData.b0.nameSection.language = newLanguage.id;
		const res = await agent.post('/create/handler').send(postData);
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
		const createdEntities = res.body;
		expect(createdEntities.length).equal(1);
		const editionEntity = createdEntities.find((entity) => entity.type === 'Edition');
		const fetchedEditionEntity = await getEntityByBBID(orm, editionEntity.bbid, ['authorCredit']);
		expect(Boolean(fetchedEditionEntity)).to.be.true;
		expect(fetchedEditionEntity.authorCredit.authorCount).equal(1);
	});

	it('should throw bad request error while posting invalid form', async () => {
		const postData = {b0: {
			...baseState,
			editionSection: {}
		}};
		const res = await agent.post('/create/handler').send(postData);
		expect(res).to.have.status(400);
	});
});


describe('Unified form routes without entity editing priv', () => {
	let agent;
	before(async () => {
		try {
			await createEditor(123456, 0);
		}
		catch (error) {
			// console.log(error);
		}
		// Log in; use agent to use logged in session
		agent = await chai.request.agent(app);
		await agent.get('/cb');
	});

	after(truncateEntities);

	it('should throw an error if trying to open unified form create page', async () => {
		const res = await agent
			.get('/create');
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
		expect(res.res.statusMessage).to.equal('You do not have the privilege to access this route');
	});
});
