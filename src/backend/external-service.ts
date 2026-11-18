import type {ORM} from 'bookbrainz-data';


// Whether the editor has connected CritiqueBrainz ('review') or not ('disable')
export async function getCritiqueBrainzPermission(orm: ORM, {editorId}: {editorId: number}) {
	const token: unknown = await orm.func.externalServiceOauth.getOauthToken(editorId, 'critiquebrainz', orm);
	return token ? 'review' : 'disable';
}
