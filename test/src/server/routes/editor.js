import {createEditor, truncateEntities} from '../../../test-helpers/create-entities';

import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import request from 'supertest';
import status from 'http-status';


chai.use(chaiHttp);
const {expect} = chai;


describe('GET Editor routes', () => {
	let editorJSON;
	before(async () => {
		const editor = await createEditor();
		editorJSON = editor.toJSON();
	});
	after(truncateEntities);

	it('should get editor/id', (done) => {
		request(app)
			.get(`/editor/${editorJSON.id}`)
			.expect('Content-Type', 'text/html; charset=utf-8')
			.expect(status.OK, done);
	});
	it('should get editor/id/revisions', (done) => {
		request(app)
			.get(`/editor/${editorJSON.id}/revisions`)
			.expect('Content-Type', 'text/html; charset=utf-8')
			.expect(status.OK, done);
	});
	it('should get editor/id/revisions/revisions', (done) => {
		request(app)
			.get(`/editor/${editorJSON.id}/revisions/revisions`)
			.expect('Content-Type', /json/)
			.expect(status.OK, done);
	});
	it('should get editor/id/achievements', (done) => {
		request(app)
			.get(`/editor/${editorJSON.id}/achievements`)
			.expect('Content-Type', 'text/html; charset=utf-8')
			.expect(status.OK, done);
	});
});

