import {createEditor, truncateEntities} from '../../../test-helpers/create-entities';
import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';


chai.use(chaiHttp);
const {expect} = chai;

describe('GET /user/:username', () => {
	let editor;
	let editorJSON;

	beforeEach(async () => {
		editor = await createEditor();
		editorJSON = editor.toJSON();
	});

	afterEach(truncateEntities);

	it('should redirect to /editor/:id when editor exists', async () => {
		const res = await chai.request(app)
			.get(`/user/${editorJSON.name}`)
			.redirects(0);

		expect(res).to.redirect;
		expect(res.status).to.equal(301);
		expect(res).to.redirectTo(`/editor/${editorJSON.id}`);
	});

	it('should return 404 when editor does not exist', async () => {
		const res = await chai.request(app)
			.get('/user/nonexistentuser12345');

		expect(res.status).to.equal(404);
		expect(res.res.statusMessage).to.equal('Editor not found');
	});

	it('should redirect with 301 status code (permanent redirect)', async () => {
		const res = await chai.request(app)
			.get(`/user/${editorJSON.name}`)
			.redirects(0);

		expect(res.status).to.equal(301);
		expect(res.headers.location).to.equal(`/editor/${editorJSON.id}`);
	});

	it('should work with different usernames', async () => {
		const editor2 = await createEditor();
		const editor2JSON = editor2.toJSON();

		const res1 = await chai.request(app)
			.get(`/user/${editorJSON.name}`)
			.redirects(0);

		const res2 = await chai.request(app)
			.get(`/user/${editor2JSON.name}`)
			.redirects(0);

		expect(res1.status).to.equal(301);
		expect(res1).to.redirectTo(`/editor/${editorJSON.id}`);
		expect(res2.status).to.equal(301);
		expect(res2).to.redirectTo(`/editor/${editor2JSON.id}`);
	});
});

