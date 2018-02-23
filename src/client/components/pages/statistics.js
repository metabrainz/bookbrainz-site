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
import PropTypes from 'prop-types';
import React from 'react';


const {PageHeader, Table} = bootstrap;

/**
 * Renders the document and displays the 'Statistics' page.
 * @returns {ReactElement} a HTML document which displays the Statistics
 * page
 */
class StatisticsPage extends React.Component {
	constructor(props) {
		super(props);
		this.renderTopEditorsTable = this.renderTopEditorsTable.bind(this);
	}

	renderTopEditorsTable(topEditors) {
		return (
			<div>
				<div>
					<h2 className="text-center">Top 10 Editors</h2>
				</div>
				<Table
					bordered
					striped
				>
					<thead>
					    <tr>
							<th>#</th>
							<th>Editor&apos;s Name</th>
							<th>Total Revisions</th>
					    </tr>
					</thead>
					<tbody>
						{
							topEditors.map((entity, i) => (
								<tr key={entity.id}>
									<td>{i + 1}</td>
									<td>
										<a
											href={`/editor/${entity.id}`}
										>
											{entity.name}
										</a>
									</td>
									<td>{entity.totalRevisions}</td>
								</tr>
							))
						}
					</tbody>
				</Table>
			</div>
		);
	}

	render() {
		const {topEditors} = this.props;
		return (
			<div>
				<PageHeader>Statistics of BookBrainz</PageHeader>
				{topEditors.length &&
					<div>
						{this.renderTopEditorsTable(topEditors)}
					</div>
				}
			</div>
		);
	}
}

StatisticsPage.displayName = 'StatisticsPage';
StatisticsPage.propTypes = {
	topEditors: PropTypes.array.isRequired
};

export default StatisticsPage;
