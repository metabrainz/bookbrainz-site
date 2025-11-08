import {createEditor, truncateEntities} from '../../../test-helpers/create-entities';
import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';


chai.use(chaiHttp);
const {expect} = chai;
const {Editor, EditorType} = orm;

describe('GET /user/:username', () => {
	let editor;
	let editorJSON;

	beforeEach(async () => {
		editor = await createEditor();
		editorJSON = editor.toJSON();
	});

	afterEach(truncateEntities);

	it('should return 404 when editor does not exist', async () => {
		const res = await chai.request(app)
			.get('/user/nonexistentuser12345');

		expect(res.status).to.equal(404);
		expect(res.res.statusMessage).to.equal('Editor not found');
	});

	it('should redirect to /editor/:id when editor exists', async () => {
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

	describe('URL encoding/decoding with special characters', () => {
		it('should handle usernames with spaces (encoded as %20)', async () => {
			const editorType = await EditorType.forge({label: 'Editor'})
				.fetch({require: true});

			const specialEditor = await new Editor({
				cachedMetabrainzName: 'Hello, World',
				name: 'Hello, World',
				typeId: editorType.id
			}).save();

			// Test with URL-encoded space
			const res = await chai.request(app)
				.get('/user/Hello,%20World')
				.redirects(0);

			expect(res.status).to.equal(301);
			expect(res).to.redirectTo(`/editor/${specialEditor.get('id')}`);
		});

		it('should handle usernames with question marks (encoded as %3F)', async () => {
			const editorType = await EditorType.forge({label: 'Editor'})
				.fetch({require: true});

			const specialEditor = await new Editor({
				cachedMetabrainzName: 'hello?world',
				name: 'hello?world',
				typeId: editorType.id
			}).save();

			// Test with URL-encoded question mark
			const res = await chai.request(app)
				.get('/user/hello%3Fworld')
				.redirects(0);

			expect(res.status).to.equal(301);
			expect(res).to.redirectTo(`/editor/${specialEditor.get('id')}`);
		});

		it('should handle usernames with HTML-like characters (encoded)', async () => {
			const editorType = await EditorType.forge({label: 'Editor'})
				.fetch({require: true});

			const specialEditor = await new Editor({
				cachedMetabrainzName: '</Hello>',
				name: '</Hello>',
				typeId: editorType.id
			}).save();

			// Test with URL-encoded HTML characters
			const res = await chai.request(app)
				.get('/user/%3C%2FHello%3E')
				.redirects(0);

			expect(res.status).to.equal(301);
			expect(res).to.redirectTo(`/editor/${specialEditor.get('id')}`);
		});

		it('should handle usernames with commas', async () => {
			const editorType = await EditorType.forge({label: 'Editor'})
				.fetch({require: true});

			const specialEditor = await new Editor({
				cachedMetabrainzName: 'user,with,commas',
				name: 'user,with,commas',
				typeId: editorType.id
			}).save();

			// Commas don't need encoding in URLs, but test anyway
			const res = await chai.request(app)
				.get('/user/user,with,commas')
				.redirects(0);

			expect(res.status).to.equal(301);
			expect(res).to.redirectTo(`/editor/${specialEditor.get('id')}`);
		});
	});
});

