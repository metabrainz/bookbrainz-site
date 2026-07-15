import * as auth from '../../../../src/server/helpers/auth';
import chai from 'chai';
import orm from '../../../bookbrainz-data';
import {truncateEntities} from '../../../test-helpers/create-entities';


const {Editor, EditorType, Gender} = orm;
const {expect} = chai;

function createEditorType() {
	return new EditorType({label: 'Editor'}).save(null, {method: 'insert'});
}

function createGender() {
	return new Gender({name: 'Male'}).save(null, {method: 'insert'});
}

describe('auth helpers', () => {
	afterEach(truncateEntities);

	describe('createBookBrainzEditorForMetaBrainzProfile', () => {
		it('creates an editor from a MetaBrainz profile', async () => {
			const editorType = await createEditorType();
			const gender = await createGender();

			const editor = await auth.createBookBrainzEditorForMetaBrainzProfile(orm, {
				gender: 'male',
				metabrainzOauthAccessToken: 'access-token',
				metabrainzOauthRefreshToken: 'refresh-token',
				sub: '12345',
				username: 'alice'
			});

			expect(editor.get('cachedMetabrainzName')).to.equal('alice');
			expect(editor.get('genderId')).to.equal(gender.id);
			expect(editor.get('metabrainzOauthAccessToken')).to.equal('access-token');
			expect(editor.get('metabrainzOauthRefreshToken')).to.equal('refresh-token');
			expect(editor.get('metabrainzUserId')).to.equal(12345);
			expect(editor.get('name')).to.equal('alice');
			expect(editor.get('typeId')).to.equal(editorType.id);
		});

		it('suffixes the editor name when the MetaBrainz username is taken', async () => {
			const editorType = await createEditorType();
			await new Editor({
				name: 'alice',
				typeId: editorType.id
			}).save(null, {method: 'insert'});

			const editor = await auth.createBookBrainzEditorForMetaBrainzProfile(orm, {
				sub: '12345',
				username: 'alice'
			});

			expect(editor.get('cachedMetabrainzName')).to.equal('alice');
			expect(editor.get('metabrainzUserId')).to.equal(12345);
			expect(editor.get('name')).to.equal('alice-12345');
		});
	});
});
