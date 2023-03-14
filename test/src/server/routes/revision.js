/* eslint-disable sort-keys */

import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';

chai.use(chaiHttp);
const {expect} = chai;
const {bookshelf, util, Revision, Gender, EditorType, Editor} = orm;
const revisionAttribs = {
	authorId: 1,
	id: 1
};

const editorData = {
	genderId: 1,
	id: 1,
	name: 'bob',
	typeId: 1
};

const genderData = {
	id: 1,
	name: 'test'
};
const editorTypeData = {
	id: 1,
	label: 'test_type'
};

describe('checkValidRevisionId', () => {
	beforeEach(async () => {
		await new Gender(genderData).save(null, {method: 'insert'});
		await new EditorType(editorTypeData).save(null, {method: 'insert'});
		await new Editor(editorData).save(null, {method: 'insert'});
		await new Revision(revisionAttribs).save(null, {method: 'insert'});
	});
	afterEach(async () => {
		await util.truncateTables(bookshelf, [
			'bookbrainz.revision',
			'bookbrainz.editor',
			'bookbrainz.editor_type',
			'musicbrainz.gender'
		]);
	});

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
	});
	it('should throw an error when revision id is a decimal', async () => {
		const revisionId = 1.367;
		const res = await chai.request(app).get(`/revision/${revisionId}`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(400);
	});
	it('should throw an error when revision id is unavailable', async () => {
		const revisionId = 1367;
		const res = await chai.request(app).get(`/revision/${revisionId}`);
		expect(res.ok).to.be.false;
		expect(res).to.have.status(404);
	});
});
