/*
 * Copyright (C) 2021  Akash Gupta
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
import * as entityHelper from '../../../helpers/entity';
import * as utilHelper from '../../../helpers/utils';
import PropTypes from 'prop-types';
import React from 'react';


const {Table} = bootstrap;
const {getEntityDisambiguation, getEntityLabel} = entityHelper;

function SeriesTableRow({series, showAddedAtColumn, showCheckboxes, selectedEntities, onToggleRow}) {
	const name = getEntityLabel(series);
	const disambiguation = getEntityDisambiguation(series);
	const seriesType = series.entityType || '?';
	const seriesOrderingType = series.seriesOrderingType ? series.seriesOrderingType.label : '?';
	const addedAt = showAddedAtColumn ? utilHelper.formatDate(new Date(series.addedAt), true) : null;
	/* eslint-disable react/jsx-no-bind */
	return (
		<tr>
			<td>
				{
					showCheckboxes ?
						<input
							checked={selectedEntities.find(bbid => bbid === series.bbid)}
							className="checkboxes"
							id={series.bbid}
							type="checkbox"
							onClick={() => onToggleRow(series.bbid)}
						/> : null
				}
				<a href={`/series/${series.bbid}`}>{name}</a>
				{disambiguation}
			</td>
			<td>{seriesType}</td>
			<td>{seriesOrderingType}</td>
			{
				showAddedAtColumn ? <td>{addedAt}</td> : null
			}
		</tr>
	);
}
SeriesTableRow.displayName = 'SeriesTableRow';
SeriesTableRow.propTypes = {
	onToggleRow: PropTypes.func,
	selectedEntities: PropTypes.array,
	series: PropTypes.object.isRequired,
	showAddedAtColumn: PropTypes.bool.isRequired,
	showCheckboxes: PropTypes.bool
};
SeriesTableRow.defaultProps = {
	onToggleRow: null,
	selectedEntities: [],
	showCheckboxes: false
};

function SeriesTable({series, showAddedAtColumn, showCheckboxes, selectedEntities, onToggleRow}) {
	let tableContent;
	if (series.length) {
		tableContent = (
			<React.Fragment>
				<Table striped>
					<thead>
						<tr>
							<th width="40%">Name</th>
							<th>Series Type</th>
							<th>Ordering Type</th>
							{
								showAddedAtColumn ? <th>Added at</th> : null
							}
						</tr>
					</thead>
					<tbody>
						{
							series.map((entity) => (
								<SeriesTableRow
									key={entity.bbid}
									selectedEntities={selectedEntities}
									series={entity}
									showAddedAtColumn={showAddedAtColumn}
									showCheckboxes={showCheckboxes}
									onToggleRow={onToggleRow}
								/>
							))
						}
					</tbody>
				</Table>
			</React.Fragment>
		);
	}
	else {
		tableContent = <span>No Series</span>;
	}
	return (
		<div>
			<h2>Series</h2>
			{tableContent}
		</div>
	);
}
SeriesTable.displayName = 'SeriesTable';
SeriesTable.propTypes = {
	onToggleRow: PropTypes.func,
	selectedEntities: PropTypes.array,
	series: PropTypes.array.isRequired,
	showAddedAtColumn: PropTypes.bool,
	showCheckboxes: PropTypes.bool
};
SeriesTable.defaultProps = {
	onToggleRow: null,
	selectedEntities: [],
	showAddedAtColumn: false,
	showCheckboxes: false
};

export default SeriesTable;
