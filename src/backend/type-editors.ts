/*
 * TODO: the Bookshelf models are untyped, so the no-unsafe rules cannot hold in the queries below.
 * Replace the disables with proper ORM types.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import type {AttributeTypeDataT, RelationshipTypeDataT} from '../common/types/type-data';
import {BadRequestError, NotFoundError} from '../common/helpers/error';
import type {IdentifierTypeWithIdT} from 'bookbrainz-data/lib/types/identifiers';
import type {ORM} from 'bookbrainz-data';


function checkTypeId(id: string, path: string) {
	const idToNumber = Number(id);
	if (!Number.isInteger(idToNumber) || idToNumber <= 0) {
		throw new BadRequestError(`Invalid Type id: ${id}`, {originalUrl: path});
	}
	return idToNumber;
}

export async function getIdentifierTypeCreateData(orm: ORM): Promise<{parentTypes: IdentifierTypeWithIdT[]}> {
	const parentTypes: IdentifierTypeWithIdT[] = (await orm.IdentifierType.fetchAll()).toJSON();
	return {parentTypes};
}

export async function getIdentifierTypeEditData(
	orm: ORM, {id, path}: {id: string, path: string}
): Promise<{identifierTypeData: IdentifierTypeWithIdT, parentTypes: IdentifierTypeWithIdT[]}> {
	const typeId = checkTypeId(id, path);
	const allTypes: IdentifierTypeWithIdT[] = (await orm.IdentifierType.fetchAll()).toJSON();
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

async function getRelationshipTypeLists(orm: ORM): Promise<{attributeTypes: AttributeTypeDataT[], parentTypes: RelationshipTypeDataT[]}> {
	const [parentTypes, attributeTypes] = await Promise.all([
		orm.RelationshipType.fetchAll(),
		orm.RelationshipAttributeType.fetchAll()
	]);
	return {attributeTypes: attributeTypes.toJSON(), parentTypes: parentTypes.toJSON()};
}

export function getRelationshipTypeCreateData(orm: ORM) {
	return getRelationshipTypeLists(orm);
}

export async function getRelationshipTypeEditData(orm: ORM, {id, path}: {id: string, path: string}): Promise<{
	attributeTypes: AttributeTypeDataT[],
	parentTypes: RelationshipTypeDataT[],
	relationshipTypeData: RelationshipTypeDataT
}> {
	const typeId = checkTypeId(id, path);
	const lists = await getRelationshipTypeLists(orm);
	const relationshipType = await new orm.RelationshipType({id: typeId})
		.fetch({require: false, withRelated: ['attributeTypes']});
	if (!relationshipType) {
		throw new NotFoundError(`Relationship Type with id ${id} not found`, {originalUrl: path});
	}
	const relationshipTypeData: Omit<RelationshipTypeDataT, 'attributeTypes'> & {attributeTypes: Array<{id: number}>} = relationshipType.toJSON();
	return {
		...lists,
		// The form wants the ids of the attribute types
		relationshipTypeData: {...relationshipTypeData, attributeTypes: relationshipTypeData.attributeTypes.map(({id: attributeId}) => attributeId)}
	};
}
