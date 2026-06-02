/* eslint-disable camelcase */
import type {ORM} from 'bookbrainz-data';


export function fetchEditorByMetaBrainzUserId(orm: ORM, metabrainzUserId: number) {
	const {Editor} = orm;

	return new Editor({metabrainzUserId})
		.fetch({require: true})
		.catch(Editor.NotFoundError, () => null);
}

function clearEditorByID(trx, editorID) {
	return trx('bookbrainz.editor')
		.where({id: editorID})
		.update({
			area_id: null,
			bio: '',
			cached_metabrainz_name: '<deleted>',
			gender_id: null,
			metabrainz_oauth_access_token: null,
			metabrainz_oauth_refresh_token: null,
			name: `Deleted Editor #${editorID}`
		});
}

function clearEditorLanguagesByEditorID(trx, editorID) {
	return trx('bookbrainz.editor__language')
		.where({editor_id: editorID})
		.del();
}

export async function deleteEditorByMetaBrainzID(orm: ORM, metabrainzUserID: number) {
	const editor = await fetchEditorByMetaBrainzUserId(orm, metabrainzUserID);
	if (!editor) {
		return false;
	}
	return await orm.bookshelf.transaction(async (trx) => {
		// Set the editor name to "Deleted Editor #ID"
		// Set cached MetaBrainz name to "<deleted>"
		// Also clear bio, gender, area and languages
		await clearEditorByID(trx, editor.id);
		await clearEditorLanguagesByEditorID(trx, editor.id);
		return true;
	});
}
