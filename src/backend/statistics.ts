/*
 * TODO: the Bookshelf models are untyped, so the no-unsafe rules cannot hold in the queries below.
 * Replace the disables with proper ORM types.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {ENTITY_TYPES} from 'bookbrainz-data/lib/types/entity';
import type {ORM} from 'bookbrainz-data';
import type {_Editor} from '../types';
import {snakeCase} from 'lodash';


type QueryBuilder = ReturnType<ORM['bookshelf']['knex']['queryBuilder']>;

// The number of master revisions of each entity type, from `since` on if given
function countEntities(orm: ORM, since?: Date) {
	return Promise.all(ENTITY_TYPES.map(async (modelName) => {
		// The database returns counts as strings
		const count = await new orm[modelName]()
			.query((qb: QueryBuilder) => {
				qb
					.leftJoin('bookbrainz.revision', `bookbrainz.${snakeCase(modelName)}.revision_id`, 'bookbrainz.revision.id')
					.where('master', true);
				if (since) {
					qb.where('bookbrainz.revision.created_at', '>=', since);
				}
			})
			.count() as string;
		return {count, modelName};
	}));
}

/**
 * Retrieves the total count of all entities in the database and returns it as an array of objects,
 * where each object contains the entity name and its count. The results are sorted by count in
 * descending order.
 *
 * @param {Object} orm - An object representing the ORM.
 * @returns {Array<Object>} An array of objects, where each object contains the entity name and its count
 * @throws {Error} If there is an error fetching entities lifetime total
 */
async function getAllEntities(orm: ORM) {
	try {
		const allEntities = await countEntities(orm);
		return allEntities.sort((a, b) => Number(b.count) - Number(a.count));
	}
	catch {
		throw new Error('Error fetching all entities total');
	}
}

/**
 * Retrieves the count of entities created in the last 30 days and returns it as an object, where
 * each key is the entity name and its value is the count.
 *
 * @param {Object} orm - An object representing the ORM.
 * @returns {Object} An object where each key is the entity name and its value is the count
 * @throws {Error} If there is an error fetching entities total count from last 30 days
 */
async function getLast30DaysEntities(orm: ORM) {
	try {
		const since = new Date();
		since.setDate(since.getDate() - 30);
		const counts = await countEntities(orm, since);
		return Object.fromEntries(counts.map(({count, modelName}) => [modelName, count])) as Record<string, string>;
	}
	catch {
		throw new Error('Error fetching entities from last 30 days');
	}
}

/**
 * Retrieves the top 10 editors with the most revisions and returns them as an array of objects,
 * where each object contains the editor's information.
 *
 * @param {Object} orm - An object representing the ORM.
 * @returns {Array<Object>} An array of objects, where each object contains the editor's information.
 * @throws {Error} If there is an error fetching the top 10 editors.
 */
async function getTop10Editors(orm: ORM) {
	try {
		const topEditors = await new orm.Editor()
			.query((q) => q.orderBy('total_revisions', 'desc').limit(10))
			.fetchAll();
		return (topEditors.models as Array<{attributes: _Editor}>).map((model) => model.attributes);
	}
	catch {
		throw new Error('Error fetching top 10 editors');
	}
}

export async function getStatisticsPage(orm: ORM) {
	const [allEntities, last30DaysEntities, topEditors] = await Promise.all([
		getAllEntities(orm),
		getLast30DaysEntities(orm),
		getTop10Editors(orm)
	]);
	return {allEntities, last30DaysEntities, topEditors};
}
