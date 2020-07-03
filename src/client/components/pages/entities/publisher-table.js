/*
 * Copyright (C) 2020 Prabal Singh
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

import PropTypes from 'prop-types';
import React from 'react';


const {Table} = bootstrap;

const {getEntityDisambiguation} = entityHelper;

function PublisherTableRow({publisher, showCheckboxes, selectedEntities, onToggleRow}) {
	const name = publisher.defaultAlias ? publisher.defaultAlias.name : '(unnamed)';
	const disambiguation = getEntityDisambiguation(publisher);
	const publisherType = publisher.publisherType ? publisher.publisherType.label : '?';
	const area = publisher.area ? publisher.area.name : '?';
	const publisherBBID = publisher.bbid;

	/* eslint-disable react/jsx-no-bind */
	return (
		<tr>
			<td>
				{
					showCheckboxes ?
						<input
							checked={selectedEntities.find(bbid => bbid === publisher.bbid)}
							className="checkboxes"
							id={publisher.bbid}
							type="checkbox"
							onClick={() => onToggleRow(publisher.bbid)}
						/> : null
				}
				<a href={`/publisher/${publisherBBID}`}>{name}</a>
				{disambiguation}
			</td>
			<td>{area}</td>
			<td>{publisherType}</td>
		</tr>
	);
}
PublisherTableRow.displayName = 'PublisherTableRow';
PublisherTableRow.propTypes = {
	onToggleRow: PropTypes.func,
	publisher: PropTypes.object.isRequired,
	selectedEntities: PropTypes.array,
	showCheckboxes: PropTypes.bool
};
PublisherTableRow.defaultProps = {
	onToggleRow: null,
	selectedEntities: [],
	showCheckboxes: false
};

function PublisherTable({publishers, showCheckboxes, selectedEntities, onToggleRow}) {
	let tableContent;
	if (publishers.length) {
		tableContent = (
			<React.Fragment>
				<Table striped>
					<thead>
						<tr>
							<th>Name</th>
							<th>Area</th>
							<th>Type</th>
						</tr>
					</thead>
					<tbody>
						{
							publishers.map((publisher) => (
								<PublisherTableRow
									key={publisher.bbid}
									publisher={publisher}
									selectedEntities={selectedEntities}
									showCheckboxes={showCheckboxes}
									onToggleRow={onToggleRow}
								/>
							))
						}
					</tbody>
				</Table>
				<hr className="margin-bottom-d0"/>
			</React.Fragment>
		);
	}
	else {
		tableContent = <span>No Authors</span>;
	}
	return (
		<div>
			<h2>Authors</h2>
			{tableContent}
		</div>
	);
}
PublisherTable.displayName = 'WorkTable';
PublisherTable.propTypes = {
	onToggleRow: PropTypes.func,
	publishers: PropTypes.array.isRequired,
	selectedEntities: PropTypes.array,
	showCheckboxes: PropTypes.bool
};
PublisherTable.defaultProps = {
	onToggleRow: null,
	selectedEntities: [],
	showCheckboxes: false
};

export default PublisherTable;
