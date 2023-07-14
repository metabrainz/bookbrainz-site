/*
 * Copyright (C) 2023 Shivam Awasthi
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import {AdminActionType} from '../../common/helpers/privileges-utils';


export async function createAdminLog(actionType: AdminActionType, adminId: number,
	newPrivs: number, note: string, oldPrivs: number, targetUserId: number, AdminLog) {
	await new AdminLog({
		actionType,
		adminId,
		newPrivs,
		note,
		oldPrivs,
		targetUserId
	}).save(null, {method: 'insert'});
}

/**
 * Fetches Admin logs for Show All Admin Logs page
 * Fetches the last 'size' number of admin logs with offset 'from'
 *
 * @param {number} from - the offset value
 * @param {number} size - no. of last logs required
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {array} - orderedLogs
 */
export async function getOrderedAdminLogs(from, size, orm) {
	const {AdminLog} = orm;
	const logs = await new AdminLog().orderBy('time', 'DESC')
		.fetchPage({
			limit: size,
			offset: from,
			withRelated: [
				'admin',
				'targetUser'
			]
		});
	const logsJSON = logs.toJSON();
	return logsJSON;
}
