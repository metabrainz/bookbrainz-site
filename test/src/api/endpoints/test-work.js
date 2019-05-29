/* eslint-disable */

process.env.NODE_ENV = 'test';


/// Import the dependencies for testing
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../../../src/server/app';
// Configure chai
chai.use(chaiHttp);
chai.should();

describe("Work", () => {
	describe("GET /work", () => {
		// Test to get basic information of a work
		it("should get basic information of work", (done) => {
			 chai.request(app)
				 .get('/v1/work/13ab71b4-908f-4c72-88a9-4b94a56c7d3e')
				 .end((err, res) => {
					 res.should.have.status(200);
					 res.body.should.be.a('object');
					 res.body.should.have.property('bbid');
					 res.body.should.have.property('defaultAlias');
					 res.body.should.have.property('languages');
					 res.body.should.have.property('disambiguation');
					 res.body.should.have.property('entityType');
					 done();
				  });
		 });

	});
});
