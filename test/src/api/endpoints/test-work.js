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
				 .get('/v1/work/bbid')
				 .end((err, res) => {
					 res.should.have.status(200);
					 res.body.should.be.a('object');
					 res.body.should.have.property('bbid');
					 res.body.should.have.property('default-alias');
					 res.body.should.have.property('languages');
					 res.body.should.have.property('disambiguation');
					 res.body.should.have.property('type');
					 done();
				  });
		 });

	});
});
