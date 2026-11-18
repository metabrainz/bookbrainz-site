/*
 * The Bookshelf models are untyped, so the no-unsafe rules cannot hold in the queries below.
 * To be replaced by proper ORM types.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {BadRequestError} from '../common/helpers/error';
import {ENTITY_TYPES} from 'bookbrainz-data/lib/types/entity';
import type {ORM} from 'bookbrainz-data';


/**
 * Fetches public collections for Show All Collections/Index Page
 * Fetches the last 'size' number of collections with offset 'from'
 *
 * @param {number} from - the offset value
 * @param {number} size - no. of last collections required
 * @param {string} entityType - entityType filter
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {array} - orderedCollections
 */
export async function getOrderedPublicCollections(from: number, size: number, entityType: string | null, orm: ORM) {
	const allCollections = await new orm.UserCollection()
		.where((builder: {where: (column: string, value: unknown) => unknown}) => {
			builder.where('public', true);
			if (entityType) {
				builder.where('entity_type', entityType);
			}
		})
		.orderBy('last_modified', 'DESC')
		.fetchPage({
			limit: size,
			offset: from,
			withItemCount: true,
			withRelated: ['owner']
		});

	return (allCollections ? allCollections.toJSON() : []) as Array<Record<string, unknown>>;
}

export function checkCollectionType(type: string | null) {
	if (type !== null && !ENTITY_TYPES.some((entityType) => entityType === type)) {
		throw new BadRequestError(`Type ${type} do not exist`);
	}
}

export async function getPublicCollectionsPage(orm: ORM, {from, size, type}: {from: number, size: number, type: string | null}) {
	checkCollectionType(type);
	// Fetch one more than required to know whether there is a next page
	const collections = await getOrderedPublicCollections(from, size + 1, type, orm);
	const limit = Math.max(0, size);
	return {
		entityTypes: [...ENTITY_TYPES],
		nextEnabled: collections.length > limit,
		results: collections.slice(0, limit)
	};
}
