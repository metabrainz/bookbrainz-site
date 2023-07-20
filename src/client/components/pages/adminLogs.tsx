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

import React, {useState} from 'react';
import {AdminLogDataT} from '../../../server/helpers/adminLogs';
import AdminLogsTable from './parts/admin-logs-table';
import PagerElement from './parts/pager';


type Props = {
	from?: number,
	nextEnabled: number,
	results?: AdminLogDataT[],
	size?: number
};

function AdminLogsPage({from, nextEnabled, results, size}: Props) {
	const [logs, setLogs] = useState(results);
	const paginationUrl = './admin-logs/admin-logs';
	return (
		<div id="pageWithPagination">
			<AdminLogsTable
				results={logs}
			/>
			<PagerElement
				from={from}
				nextEnabled={nextEnabled}
				paginationUrl={paginationUrl}
				results={logs}
				searchResultsCallback={setLogs}
				size={size}
			/>
		</div>
	);
}


AdminLogsPage.displayName = 'AdminLogsPage';
AdminLogsPage.defaultProps = {
	from: 0,
	results: [],
	size: 20
};

export default AdminLogsPage;
