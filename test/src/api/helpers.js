import chai from 'chai';
import chaiHttp from 'chai-http';


chai.use(chaiHttp);
const {expect} = chai;

export function searchBasicTests(res) {
	expect(res.status).to.equal(200);
	expect(res.body).to.be.an('object');
	expect(res.body).to.have.all.keys(
		'resultCount',
		'totalCount',
		'searchResult'
	);
	expect(res.body.resultCount).to.be.a('number');
	expect(res.body.totalCount).to.be.a('number');
	expect(res.body.searchResult).to.be.an('array');
	res.body.searchResult.forEach((result) => {
		expect(result).to.be.an('object');
		expect(result).to.have.all.keys(
			'bbid',
			'defaultAlias',
			'entityType'
		);
	});
}

export function browseAuthorBasicTests(res) {
	expect(res.status).to.equal(200);
	expect(res.body).to.be.an('object');
	expect(res.body).to.have.all.keys(
		'bbid',
		'authors'
	);
	res.body.authors.forEach((author) => {
		expect(author).to.have.all.keys(
			'entity',
			'relationship'
		);
		expect(author.entity).to.have.all.keys(
			'authorType',
			'bbid',
			'beginArea',
			'beginDate',
			'defaultAlias',
			'disambiguation',
			'endArea',
			'endDate',
			'ended',
			'gender'
		);
	});
}

export function browseSeriesBasicTests(res) {
	expect(res.status).to.equal(200);
	expect(res.body).to.be.an('object');
	expect(res.body).to.have.all.keys(
		'bbid',
		'series'
	);
	res.body.series.forEach((series) => {
		expect(series).to.have.all.keys(
			'entity',
			'relationship'
		);
		expect(series.entity).to.have.all.keys(
			'seriesOrderingType',
			'seriesType',
			'bbid',
			'defaultAlias',
			'disambiguation'
		);
	});
}

export function browseWorkBasicTests(res) {
	expect(res.status).to.equal(200);
	expect(res.body).to.be.an('object');
	expect(res.body).to.have.all.keys(
		'bbid',
		'works'
	);
	res.body.works.forEach((work) => {
		expect(work).to.have.all.keys(
			'entity',
			'relationship'
		);
		expect(work.entity).to.have.all.keys(
			'bbid',
			'defaultAlias',
			'languages',
			'entityType',
			'disambiguation',
			'workType'
		);
	});
}


export function browseEditionBasicTests(res) {
	expect(res.status).to.equal(200);
	expect(res.body).to.be.an('object');
	expect(res.body).to.have.all.keys(
		'bbid',
		'editions'
	);
	res.body.editions.forEach((work) => {
		expect(work).to.have.all.keys(
			'entity',
			'relationship'
		);
		expect(work.entity).to.have.all.keys(
			'authorCredits',
			'bbid',
			'defaultAlias',
			'depth',
			'disambiguation',
			'editionFormat',
			'height',
			'languages',
			'pages',
			'publishers',
			'releaseEventDate',
			'status',
			'weight',
			'width'
		);
	});
}

export function browseEditionGroupBasicTests(res) {
	expect(res.status).to.equal(200);
	expect(res.body).to.be.an('object');
	expect(res.body).to.have.all.keys(
		'bbid',
		'editionGroups'
	);
	res.body.editionGroups.forEach((work) => {
		expect(work).to.have.all.keys(
			'entity',
			'relationship'
		);
		expect(work.entity).to.have.all.keys(
			'bbid',
			'defaultAlias',
			'disambiguation',
			'editionGroupType'
		);
	});
}

export function browsePublisherBasicTests(res) {
	expect(res.status).to.equal(200);
	expect(res.body).to.be.an('object');
	expect(res.body).to.have.all.keys(
		'bbid',
		'publishers'
	);
	res.body.publishers.forEach((work) => {
		expect(work).to.have.all.keys(
			'entity',
			'relationship'
		);
		expect(work.entity).to.have.all.keys(
			'area',
			'bbid',
			'beginDate',
			'defaultAlias',
			'disambiguation',
			'endDate',
			'ended',
			'publisherType'
		);
	});
}
