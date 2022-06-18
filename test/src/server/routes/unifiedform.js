import {baseState, createEditionGroup, createEditor,
	createPublisher, createWork, getRandomUUID, languageAttribs, truncateEntities} from '../../../test-helpers/create-entities';
import {every, forOwn, map} from 'lodash';
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

describe('Unified form routes', () => {
	let agent;
	let newLanguage;
	let newRelationshipType;
	const wBBID = getRandomUUID();
	const pBBID = getRandomUUID();
	const egBBID = getRandomUUID();
	before(async () => {
		try {
			await createEditor(123456);
			await createWork(wBBID);
			await createPublisher(pBBID);
			await createEditionGroup(egBBID);
			newLanguage = await new Language({...languageAttribs})
				.save(null, {method: 'insert'});
			newRelationshipType = await new RelationshipType(relationshipTypeData)
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
			editionSection: {},
			type: 'Edition'
		}};
		postData.b0.nameSection.language = newLanguage.id;
		const res = await agent.post('/create/handler').send(postData);
		const createdEntities = res.body;
		expect(createdEntities.length).equal(1);
		const editionEntity = createdEntities[0];
		const fetchedEditionEntity = await getEntityByBBID(orm, editionEntity.bbid);
		expect(Boolean(fetchedEditionEntity)).to.be.true;
		expect(testDefaultAlias(fetchedEditionEntity, newLanguage.id)).to.be.true;
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
	});

	it('should not throw error while creating multiple entities', async () => {
		const postData = {b0: {
			...baseState,
			editionSection: {},
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
		const createdEntities = res.body;
		expect(createdEntities.length).equal(2);
		const conditions = await map(createdEntities, async (entity) => {
			const fetchedEntity = await getEntityByBBID(orm, entity.bbid);
			return !fetchedEntity ? false : testDefaultAlias(fetchedEntity, newLanguage.id);
		});
		expect(every(conditions)).to.be.true;
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
	});

	it('should not throw error when linking existing works to edition', async () => {
		const postData = {b0: {
			...baseState,
			editionSection: {},
			relationshipSection: {
				relationships: {
					n0: {
						attributeSetId: null,
						attributes: [],
						relationshipType: {
							id: newRelationshipType.id
						},
						rowID: 'n0',
						sourceEntity: {
							bbid: 'b0'
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
		const createdEntities = res.body;
		expect(createdEntities.length).equal(1);
		const editionEntity = createdEntities.find((entity) => entity.type === 'Edition');
		const fetchedEditionEntity = await getEntityByBBID(orm, editionEntity.bbid);
		expect(Boolean(fetchedEditionEntity)).to.be.true;
		const relationship = fetchedEditionEntity.relationshipSet.relationships[0];
		expect(relationship.sourceBbid).equal(fetchedEditionEntity.bbid);
		expect(relationship.targetBbid).equal(wBBID);
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
	});

	it('should not throw error when linking newly created works to edition', async () => {
		const postData = {b0: {
			...baseState,
			editionSection: {},
			relationshipSection: {
				relationships: {
					n0: {
						attributeSetId: null,
						attributes: [],
						relationshipType: {
							id: newRelationshipType.id
						},
						rowID: 'n0',
						sourceEntity: {
							bbid: 'b0'
						},
						targetEntity: {
							bbid: 'b1'
						}
					}
				}
			},
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
		const createdEntities = res.body;
		expect(createdEntities.length).equal(2);
		const editionEntity = createdEntities.find((entity) => entity.type === 'Edition');
		const workEntity = createdEntities.find((entity) => entity.type === 'Work');
		const fetchedEditionEntity = await getEntityByBBID(orm, editionEntity.bbid);
		expect(Boolean(fetchedEditionEntity)).to.be.true;
		const fetchedWorkEntity = await getEntityByBBID(orm, workEntity.bbid);
		expect(Boolean(fetchedWorkEntity)).to.be.true;
		const relationship = fetchedEditionEntity.relationshipSet.relationships[0];
		expect(relationship.sourceBbid).equal(fetchedEditionEntity.bbid);
		expect(relationship.targetBbid).equal(fetchedWorkEntity.bbid);
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
	});

	it('should not throw error while linking existing publisher to edition', async () => {
		const postData = {b0: {
			...baseState,
			editionSection: {
				publisher: {
					id: pBBID
				}
			},
			type: 'Edition'
		}};
		postData.b0.nameSection.language = newLanguage.id;
		const res = await agent.post('/create/handler').send(postData);
		const createdEntities = res.body;
		expect(createdEntities.length).equal(1);
		const editionEntity = createdEntities.find((entity) => entity.type === 'Edition');
		const fetchedEditionEntity = await getEntityByBBID(orm, editionEntity.bbid, ['publisherSet.publishers']);
		expect(Boolean(fetchedEditionEntity)).to.be.true;
		const publisherId = fetchedEditionEntity.publisherSet.publishers[0].bbid;
		expect(publisherId).equal(pBBID);
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
	});

	it('should not throw error while linking newly created publisher to edition', async () => {
		const postData = {b0: {
			...baseState,
			publisherSection: {
				beginDate: {
				  day: '',
				  month: '',
				  year: ''
				},
				endDate: {
				  day: '',
				  month: '',
				  year: ''
				},
				ended: false,
				type: null
			  },
			type: 'Publisher'
		},
		b1: {
			...baseState,
			editionSection: {
				publisher: {
					id: 'b0'
				}
			},
			type: 'Edition'
		}};
		postData.b0.nameSection.language = newLanguage.id;
		const res = await agent.post('/create/handler').send(postData);
		const createdEntities = res.body;
		expect(createdEntities.length).equal(2);
		const editionEntity = createdEntities.find((entity) => entity.type === 'Edition');
		const publisherEntity = createdEntities.find((entity) => entity.type === 'Publisher');
		const fetchedEditionEntity = await getEntityByBBID(orm, editionEntity.bbid, ['publisherSet.publishers']);
		expect(Boolean(fetchedEditionEntity)).to.be.true;
		const fetchedPublisherEntity = await getEntityByBBID(orm, publisherEntity.bbid);
		expect(Boolean(fetchedPublisherEntity)).to.be.true;
		const publisherId = fetchedEditionEntity.publisherSet.publishers[0].bbid;
		expect(publisherId).equal(publisherEntity.bbid);
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
	});
	it('should not throw error while linking existing edition-group to edition', async () => {
		const postData = {b0: {
			...baseState,
			editionSection: {
				editionGroup: {
					id: egBBID
				}
			},
			type: 'Edition'
		}};
		postData.b0.nameSection.language = newLanguage.id;
		const res = await agent.post('/create/handler').send(postData);
		const createdEntities = res.body;
		expect(createdEntities.length).equal(1);
		const editionEntity = createdEntities.find((entity) => entity.type === 'Edition');
		const fetchedEditionEntity = await getEntityByBBID(orm, editionEntity.bbid, ['editionGroup']);
		expect(Boolean(fetchedEditionEntity)).to.be.true;
		const editionGroupBbid = fetchedEditionEntity.editionGroup.bbid;
		expect(editionGroupBbid).equal(egBBID);
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
	});
	it('should not throw error while linking new edition-group to edition', async () => {
		const postData = {b0: {
			...baseState,
			editionGroupSection: {
				type: null
			},
			type: 'EditionGroup'
		},
		b1: {
			...baseState,
			editionSection: {
				editionGroup: {
					id: 'b0'
				}
			},
			type: 'Edition'
		}};
		postData.b0.nameSection.language = newLanguage.id;
		const res = await agent.post('/create/handler').send(postData);
		const createdEntities = res.body;
		expect(createdEntities.length).equal(2);
		const editionEntity = createdEntities.find((entity) => entity.type === 'Edition');
		const editionGroupEntity = createdEntities.find((entity) => entity.type === 'EditionGroup');
		const fetchedEditionEntity = await getEntityByBBID(orm, editionEntity.bbid, ['editionGroup']);
		expect(Boolean(fetchedEditionEntity)).to.be.true;
		const fetchedEditionGroupEntity = await getEntityByBBID(orm, editionGroupEntity.bbid);
		expect(Boolean(fetchedEditionGroupEntity)).to.be.true;
		const linkedEditionGroupBbid = fetchedEditionEntity.editionGroup.bbid;
		expect(linkedEditionGroupBbid).equal(fetchedEditionGroupEntity.bbid);
		expect(res).to.be.ok;
		expect(res).to.have.status(200);
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
