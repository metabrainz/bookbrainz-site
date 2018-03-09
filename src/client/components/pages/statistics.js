/*
 * Copyright (C) 2018 Akhilesh Kumar <akhilesh5991@gmail.com>
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

import * as bootstrap from 'react-bootstrap';
import * as utilsHelper from '../../helpers/utils';
import PropTypes from 'prop-types';
import React from 'react';


const {PageHeader, Table} = bootstrap;
const {formatDate} = utilsHelper;

/**
 * Renders the document and displays the topEditors table.
 * @returns {ReactElement} a HTML document which displays the topEditors table
 * in the statistics page
 */

function TopEditorsTable(props) {
	const {editors} = props;
	return (
		<div>
			<div>
				<h2 className="text-center">Top 10 Editors</h2>
			</div>
			<Table
				bordered
				condensed
				striped
			>
				<thead>
					<tr>
						<th >#</th>
						<th>Editor&apos;s Name</th>
						<th>Total Revisions</th>
						<th>Registration Date</th>
					</tr>
				</thead>
				<tbody>
					{
						editors.map((editor, i) => (
							<tr key={editor.id}>
								<td>{i + 1}</td>
								<td>
									<a	href={`/editor/${editor.id}`}>
										{editor.name}
									</a>
								</td>
								<td>{editor.totalRevisions}</td>
								<td>
									{formatDate(new Date(editor.createdAt))}
								</td>
							</tr>
						))
					}
				</tbody>
			</Table>
		</div>
	);
}

/**
 * Renders the document and displays the 'Statistics' page.
 * @returns {ReactElement} a HTML document which displays the Statistics
 * page
 */

function StatisticsPage(props) {
	const {topEditors} = props;
	return (
		<div>
			<PageHeader>Statistics of BookBrainz</PageHeader>
			<TopEditorsTable editors={topEditors}/>
		</div>
	);
}

StatisticsPage.displayName = 'StatisticsPage';
StatisticsPage.propTypes = {
	topEditors: PropTypes.array.isRequired
};
TopEditorsTable.propTypes = {
	editors: PropTypes.array.isRequired
};

export default StatisticsPage;
