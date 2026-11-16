/*
 * TODO: the Bookshelf models are untyped, so the no-unsafe rules cannot hold in the queries below.
 * Replace the disables with proper ORM types.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import type {ORM} from 'bookbrainz-data';


// Null when the editor does not exist
export async function getProfileEditData(orm: ORM, {editorId}: {editorId: number}) {
	const {Editor, Gender, TitleUnlock} = orm;
	const [editorModel, titleUnlockModel, genderModel] = await Promise.all([
		new Editor({id: editorId}).fetch({require: false, withRelated: ['area', 'gender']}),
		new TitleUnlock().where('editor_id', editorId).fetchAll({require: false, withRelated: ['title']}),
		new Gender().fetchAll({require: false})
	]);
	if (!editorModel) {
		return null;
	}
	return {
		editor: editorModel.toJSON() as Record<string, unknown>,
		genders: (genderModel ? genderModel.toJSON() : []) as Array<Record<string, unknown>>,
		titles: (titleUnlockModel === null ? {} : titleUnlockModel.toJSON()) as Record<string, unknown>
	};
}
