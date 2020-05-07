import chai from 'chai';
import chaiHttp from 'chai-http';


chai.use(chaiHttp);
const {expect} = chai;

export function searchBasicTests(res) {
	expect(res.status).to.equal(200);
	expect(res.body).to.be.an('object');
	expect(res.body).to.have.all.keys(
		'resultCount',
		'searchResult'
	);
	expect(res.body.resultCount).to.be.a('number');
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
