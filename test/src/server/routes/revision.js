/* eslint-disable sort-keys */
import {createEditor, truncateEntities} from '../../../test-helpers/create-entities';
import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';


chai.use(chaiHttp);
const {expect} = chai;
const {Revision} = orm;
const revisionAttribs = {
	authorId: 1,
	id: 1
};

describe('checkValidRevisionId', () => {
	before(async () => {
		await createEditor(1);
		await new Revision(revisionAttribs).save(null, {method: 'insert'});
	});
	after(truncateEntities);

	it('should not throw an error when revision id is valid and found', async () => {
		const revisionId = 1;
		const res = await chai.request(app).get(`/revision/${revisionId}`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
	it('should throw an error if requested id is invalid', async () => {
		const revisionId = 'hello';
		const res = await chai.request(app).get(`/revision/${revisionId}`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(400);
		expect(res.res.statusMessage).to.equal(`Invalid revision id: ${revisionId}`);
	});
	it('should throw an error when revision id is a decimal', async () => {
		const revisionId = 1.367;
		const res = await chai.request(app).get(`/revision/${revisionId}`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(400);
		expect(res.res.statusMessage).to.equal(`Invalid revision id: ${revisionId}`);
	});
	it('should throw an error when revision id is unavailable', async () => {
		const revisionId = 1367;
		const res = await chai.request(app).get(`/revision/${revisionId}`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(404);
		expect(res.res.statusMessage).to.equal(`Revision #${revisionId} not found`);
	});
});
