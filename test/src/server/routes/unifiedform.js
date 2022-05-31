import {baseState, createEditor, createPublisher,
	createWork, getRandomUUID, languageAttribs, truncateEntities} from '../../../test-helpers/create-entities';
import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import {forOwn} from 'lodash';
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

describe('Unified form routes', () => {
	let agent;
	let newLanguage;
	let newRelationshipType;
	const wBBID = getRandomUUID();
	const pBBID = getRandomUUID();

	before(async () => {
		try {
			await createEditor(123456);
			await createWork(wBBID);
			await createPublisher(pBBID);
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
