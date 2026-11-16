/*
 * TODO: the Bookshelf models are untyped, so the no-unsafe rules cannot hold in the queries below.
 * Replace the disables with proper ORM types.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import type {AdminLogDataT} from '../server/helpers/adminLogs';
import type {ORM} from 'bookbrainz-data';


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
