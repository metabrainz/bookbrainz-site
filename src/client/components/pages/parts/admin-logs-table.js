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

import AdminLogStatement from './admin-log-statement';
import PropTypes from 'prop-types';
import React from 'react';
import {Table} from 'react-bootstrap';
import {formatDate} from '../../../helpers/utils';


function AdminLogsTable(props) {
	const {results, tableHeading} = props;
	return (
		<div>
			<div>
				<h1 className="text-center">{tableHeading}</h1>
			</div>
			<hr className="thin"/>
			{
				results.length > 0 ?
					<Table
						borderless
						responsive
						striped
					>
						<thead>
							<tr>
								<th width="85%">Action</th>
								<th width="15%">Date</th>
							</tr>
						</thead>

						<tbody>
							{
								results.map((logData) => (
									<tr key={logData.id}>
										<td>
											<AdminLogStatement logData={logData}/>
										</td>
										<td>
											{formatDate(new Date(logData.time), true)}
										</td>
									</tr>
								))
							}
						</tbody>
					</Table> :

					<div>
						<h4> No logs to show</h4>
						<hr className="wide"/>
					</div>
			}
		</div>

	);
}

AdminLogsTable.propTypes = {
	results: PropTypes.array.isRequired,
	tableHeading: PropTypes.node
};
AdminLogsTable.defaultProps = {
	tableHeading: 'Admin Logs'
};

AdminLogsTable.displayName = 'AdminLogsTable';

export default AdminLogsTable;
