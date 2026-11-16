/*
 * TODO: the search helpers and the Bookshelf models are untyped, so the no-unsafe rules cannot hold here.
 * Replace the disables with proper types.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import {isNil, snakeCase} from 'lodash';
import type {AdminLogDataT} from '../server/helpers/adminLogs';
import type {ORM} from 'bookbrainz-data';
import {searchByName} from '../common/helpers/search';


/**
 * Fetches Admin logs for Show All Admin Logs page
 * Fetches the last 'size' number of admin logs with offset 'from'
 *
 * @param {number} from - the offset value
 * @param {number} size - no. of last logs required
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {array} - orderedLogs
 */
export async function getOrderedAdminLogs(from: number, size: number, orm: ORM) {
	const logs = await new orm.AdminLog().orderBy('time', 'DESC')
		.fetchPage({
			limit: size,
			offset: from,
			withRelated: ['admin', 'targetUser']
		});
	return logs.toJSON() as AdminLogDataT[];
}

export async function getAdminLogsPage(orm: ORM, {from, size}: {from: number, size: number}) {
	// Fetch one more than required to know whether there is a next page
	const logs = await getOrderedAdminLogs(from, size + 1, orm);
	const limit = Math.max(0, size);
	return {nextEnabled: logs.length > limit, results: logs.slice(0, limit)};
}

export async function getEditorSearchPage(orm: ORM, {from, query, size}: {from: number, query: string, size: number}) {
	let initialResults: unknown[] = [];
	if (query) {
		// Fetch one more result than required to know whether there is a next page
		const {results} = await searchByName(orm, query, snakeCase('editor') as never, size + 1, from);
		initialResults = results.filter((entity: unknown) => !isNil(entity));
	}
	const limit = Math.max(0, size);
	return {initialResults: initialResults.slice(0, limit), nextEnabled: initialResults.length > limit};
}
