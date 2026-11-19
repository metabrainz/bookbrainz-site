/*
 * TODO: the Bookshelf models are untyped, so the no-unsafe rules cannot hold in the queries below.
 * Replace the disables with proper ORM types.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {BadRequestError, NotFoundError} from '../common/helpers/error';
import type {IdentifierTypeDataT} from '../common/types/type-data';
import type {ORM} from 'bookbrainz-data';


function checkTypeId(id: string, path: string) {
	const idToNumber = Number(id);
	if (!Number.isInteger(idToNumber) || idToNumber <= 0) {
		throw new BadRequestError(`Invalid Type id: ${id}`, {originalUrl: path});
	}
	return idToNumber;
}

export async function getIdentifierTypeCreateData(orm: ORM): Promise<{parentTypes: IdentifierTypeDataT[]}> {
	const parentTypes: IdentifierTypeDataT[] = (await orm.IdentifierType.fetchAll()).toJSON();
	return {parentTypes};
}

export async function getIdentifierTypeEditData(
	orm: ORM, {id, path}: {id: string, path: string}
): Promise<{identifierTypeData: IdentifierTypeDataT, parentTypes: IdentifierTypeDataT[]}> {
	const typeId = checkTypeId(id, path);
	const allTypes: IdentifierTypeDataT[] = (await orm.IdentifierType.fetchAll()).toJSON();
	const identifierType = await new orm.IdentifierType({id: typeId})
		.fetch({require: false});
	if (!identifierType) {
		throw new NotFoundError(`IdentifierType with id ${id} not found`, {originalUrl: path});
	}
	return {
		identifierTypeData: identifierType.toJSON(),
		// A type cannot be its own parent
		parentTypes: allTypes.filter((type) => type.id !== typeId)
	};
}
