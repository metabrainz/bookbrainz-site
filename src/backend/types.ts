/*
 * TODO: the Bookshelf models are untyped, so the no-unsafe rules cannot hold in the queries below.
 * Replace the disables with proper ORM types.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {camelCase, snakeCase, startCase, upperFirst} from 'lodash';
import {BadRequestError} from '../common/helpers/error';
import {ENTITY_TYPES} from 'bookbrainz-data/lib/types/entity';
import type {ORM} from 'bookbrainz-data';


type QueryBuilder = ReturnType<ORM['bookshelf']['knex']['queryBuilder']>;


export async function getIdentifierTypes(orm: ORM) {
	const identifierTypes = await orm.IdentifierType.fetchAll();
	return identifierTypes.toJSON() as Array<Record<string, unknown>>;
}

// The relationship types between two entity types, given in snake case (for example edition_group)
export async function getRelationshipTypesPage(orm: ORM, {type1, type2}: {type1: string, type2: string}) {
	const entityTypes = ENTITY_TYPES.map((entity) => snakeCase(entity));
	for (const type of [type1, type2]) {
		if (!entityTypes.includes(type)) {
			throw new BadRequestError(`Invalid Entity Type: ${startCase(type)}`);
		}
	}
	const entityType1 = upperFirst(camelCase(type1));
	const entityType2 = upperFirst(camelCase(type2));

	const rows = await new orm.RelationshipType().query((qb: QueryBuilder) => {
		/* eslint-disable camelcase */
		qb.where({source_entity_type: entityType1, target_entity_type: entityType2})
			.orWhere({source_entity_type: entityType2, target_entity_type: entityType1});
		/* eslint-enable camelcase */
	}).fetchAll();

	return {
		heading: `${startCase(type1)}-${startCase(type2)} relationship types`,
		relationshipTypes: rows.toJSON() as Array<Record<string, unknown>>
	};
}
