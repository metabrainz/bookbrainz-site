/*
 * TODO: the Bookshelf models are untyped, so the no-unsafe rules cannot hold in the queries below.
 * Replace the disables with proper ORM types.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import type {IdentifierTypeDataT} from '../common/types/type-data';
import type {ORM} from 'bookbrainz-data';


export async function getIdentifierTypeCreateData(orm: ORM): Promise<{parentTypes: IdentifierTypeDataT[]}> {
	const parentTypes: IdentifierTypeDataT[] = (await orm.IdentifierType.fetchAll()).toJSON();
	return {parentTypes};
}
