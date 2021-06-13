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
import * as utilHelper from '../../../helpers/utils';

import PropTypes from 'prop-types';
import React from 'react';


const {Table} = bootstrap;

const {getEntityDisambiguation, getEntityLabel} = entityHelper;

function EditionGroupTableRow({editionGroup, showAddedAtColumn, showCheckboxes, selectedEntities, onToggleRow}) {
	const name = getEntityLabel(editionGroup);
	const number = editionGroup.number || '?';
	const disambiguation = getEntityDisambiguation(editionGroup);
	const editionGroupType = editionGroup.editionGroupType ? editionGroup.editionGroupType.label : '?';
	const addedAt = showAddedAtColumn ? utilHelper.formatDate(new Date(editionGroup.addedAt), true) : null;

	/* eslint-disable react/jsx-no-bind */
	return (
		<tr>
			{editionGroup.displayNumber && <td>{number}</td>}
			<td>
				{
					showCheckboxes ?
						<input
							checked={selectedEntities.find(bbid => bbid === editionGroup.bbid)}
							className="checkboxes"
							id={editionGroup.bbid}
							type="checkbox"
							onClick={() => onToggleRow(editionGroup.bbid)}
						/> : null
				}
				<a href={`/edition-group/${editionGroup.bbid}`}>{name}</a>
				{disambiguation}
			</td>
			<td>{editionGroupType}</td>
			{showAddedAtColumn ? <td>{addedAt}</td> : null}
		</tr>
	);
}
EditionGroupTableRow.displayName = 'EditionGroupTableRow';
EditionGroupTableRow.propTypes = {
	editionGroup: PropTypes.object.isRequired,
	onToggleRow: PropTypes.func,
	selectedEntities: PropTypes.array,
	showAddedAtColumn: PropTypes.bool.isRequired,
	showCheckboxes: PropTypes.bool
};
EditionGroupTableRow.defaultProps = {
	onToggleRow: null,
	selectedEntities: [],
	showCheckboxes: false
};

function EditionGroupTable({editionGroups, showAddedAtColumn, showCheckboxes, selectedEntities, onToggleRow}) {
	let tableContent;
	if (editionGroups.length) {
		tableContent = (
			<React.Fragment>
				<Table striped>
					<thead>
						<tr>
							{editionGroups[0].displayNumber && <th style={{width: '10%'}}>#</th>}
							<th>Name</th>
							<th>Type</th>
							{
								showAddedAtColumn ? <th>Added at</th> : null
							}
						</tr>
					</thead>
					<tbody>
						{
							editionGroups.map((editionGroup) => (
								<EditionGroupTableRow
									editionGroup={editionGroup}
									key={editionGroup.bbid}
									selectedEntities={selectedEntities}
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
		tableContent = <span>No edition groups</span>;
	}
	return (
		<div>
			<h2>Edition Groups</h2>
			{tableContent}
		</div>
	);
}
EditionGroupTable.displayName = 'EditionGroupTable';
EditionGroupTable.propTypes = {
	editionGroups: PropTypes.array.isRequired,
	onToggleRow: PropTypes.func,
	selectedEntities: PropTypes.array,
	showAddedAtColumn: PropTypes.bool,
	showCheckboxes: PropTypes.bool
};
EditionGroupTable.defaultProps = {
	onToggleRow: null,
	selectedEntities: [],
	showAddedAtColumn: false,
	showCheckboxes: false
};

export default EditionGroupTable;
