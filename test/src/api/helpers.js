import app from '../../../src/api/app';
import chai from 'chai';
import chaiHttp from 'chai-http';


chai.use(chaiHttp);
const {expect} = chai;

export async function testAuthorBrowseRequest(url, filters) {
	const res = await chai.request(app).get(url);
	expect(res.status).to.equal(200);
	expect(res.body).to.be.an('object');
	expect(res.body).to.have.all.keys(
		'bbid',
		'relatedAuthors'
	);
	expect(res.body.bbid).to.be.a('string');
	expect(res.body.relatedAuthors).to.be.an('array');
	expect(res.body.relatedAuthors[0]).to.be.an('object');
	expect(res.body.relatedAuthors[0].entity).to.be.an('object');

	expect(res.body.relatedAuthors[0].entity).to.have.all.keys(
		'bbid',
		'defaultAlias',
		'disambiguation',
		'type',
		'gender',
		'beginArea',
		'beginDate',
		'endArea',
		'endDate',
		'ended'
	);

	filters.type && expect(res.body.relatedAuthors[0].entity.type).to.equal(filters.type);
	expect(res.body.relatedAuthors[0].relationships).to.be.an('array');
	expect(res.body.relatedAuthors[0].relationships[0].relationshipType).to.be.a('string');
	expect(res.body.relatedAuthors[0].relationships[0].relationshipTypeID).to.be.a('number');
}

export async function testWorkBrowseRequest(url, filters) {
	const res = await chai.request(app).get(url);
	expect(res.status).to.equal(200);
	expect(res.body).to.be.an('object');
	expect(res.body).to.have.all.keys(
		'bbid',
		'relatedWorks'
	);
	expect(res.body.bbid).to.be.a('string');
	expect(res.body.relatedWorks).to.be.an('array');
	expect(res.body.relatedWorks[0]).to.be.an('object');
	expect(res.body.relatedWorks[0].entity).to.be.an('object');
	expect(res.body.relatedWorks[0].entity).to.have.all.keys(
		'bbid',
		'defaultAlias',
		'languages',
		'disambiguation',
		'workType'
	);
	filters.type && expect(res.body.relatedWorks[0].entity.workType).to.equal(filters.type);
	filters.language && expect(res.body.relatedWorks[0].entity.languages).to.be.an('array').that.includes(filters.language);
	expect(res.body.works[0].relationships).to.be.an('array');
	expect(res.body.works[0].relationships[0].relationshipType).to.be.a('string');
	expect(res.body.works[0].relationships[0].relationshipTypeID).to.be.a('number');
}


export async function testEditionBrowseRequest(url) {
	const res = await chai.request(app).get(url);
	expect(res.status).to.equal(200);
	expect(res.body).to.be.an('object');
	expect(res.body).to.have.all.keys(
		'bbid',
		'editions'
	);
	expect(res.body.bbid).to.be.a('string');
	expect(res.body.editions).to.be.an('array');
	expect(res.body.editions[0]).to.be.an('object');
	expect(res.body.editions[0].entity).to.be.an('object');
	expect(res.body.editions[0].entity).to.have.all.keys(
		'bbid',
		'defaultAlias',
		'languages',
		'disambiguation',
		'editionFormat',
		'height',
		'width',
		'depth',
		'pages',
		'status',
		'releaseEventDates',
		'weight'
	);
	expect(res.body.editions[0].relationships).to.be.an('array');
	expect(res.body.editions[0].relationships[0].relationshipType).to.be.a('string');
	expect(res.body.editions[0].relationships[0].relationshipTypeID).to.be.a('number');
}

export async function testEditionGroupBrowseRequest(url) {
	const res = await chai.request(app).get(url);
	expect(res.status).to.equal(200);
	expect(res.body).to.be.an('object');
	expect(res.body).to.have.all.keys(
		'bbid',
		'edtitionGroups'
	);
	expect(res.body.bbid).to.be.a('string');
	expect(res.body.edtitionGroups).to.be.an('array');
	expect(res.body.edtitionGroups[0]).to.be.an('object');
	expect(res.body.edtitionGroups[0].entity).to.be.an('object');
	expect(res.body.edtitionGroups[0].entity).to.have.all.keys(
		'bbid',
		'defaultAlias',
		'disambiguation',
		'type'
	);
	expect(res.body.edtitionGroups[0].relationships).to.be.an('array');
	expect(res.body.edtitionGroups[0].relationships[0].relationshipType).to.be.a('string');
	expect(res.body.edtitionGroups[0].relationships[0].relationshipTypeID).to.be.a('number');
}

export async function testPublisherBrowseRequest(url) {
	const res = await chai.request(app).get(url);
	expect(res.status).to.equal(200);
	expect(res.body).to.be.an('object');
	expect(res.body).to.have.all.keys(
		'bbid',
		'publishers'
	);
	expect(res.body.bbid).to.be.a('string');
	expect(res.body.publishers).to.be.an('array');
	expect(res.body.publishers[0]).to.be.an('object');
	expect(res.body.publishers[0].entity).to.be.an('object');
	expect(res.body.publishers[0].entity).to.have.all.keys(
		'bbid',
		'defaultAlias',
		'disambiguation',
		'type',
		'area',
		'beginDate',
		'endDate',
		'ended'
	);
	expect(res.body.publishers[0].relationships).to.be.an('array');
	expect(res.body.publishers[0].relationships[0].relationshipType).to.be.a('string');
	expect(res.body.publishers[0].relationships[0].relationshipTypeID).to.be.a('number');
}

