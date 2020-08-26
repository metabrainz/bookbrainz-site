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
const {transformISODateForDisplay, extractAttribute, getEntityDisambiguation, getEntityLabel} = entityHelper;

function AuthorTableRow({author, isCollectionTable, showCheckboxes, selectedEntities, onToggleRow}) {
	const name = getEntityLabel(author);
	const disambiguation = getEntityDisambiguation(author);
	const authorType = author.authorType ? author.authorType.label : '?';
	const gender = author.gender ? author.gender.name : '?';
	const beginDate = transformISODateForDisplay(extractAttribute(author.beginDate));
	const endDate = transformISODateForDisplay(extractAttribute(author.endDate));
	const addedAt = isCollectionTable ? utilHelper.formatDate(new Date(author.addedAt), true) : null;
	/* eslint-disable react/jsx-no-bind */
	return (
		<tr>
			<td>
				{
					showCheckboxes ?
						<input
							checked={selectedEntities.find(bbid => bbid === author.bbid)}
							className="checkboxes"
							id={author.bbid}
							type="checkbox"
							onClick={() => onToggleRow(author.bbid)}
						/> : null
				}
				<a href={`/author/${author.bbid}`}>{name}</a>
				{disambiguation}
			</td>
			<td>{gender}</td>
			<td>{authorType}</td>
			<td>{beginDate}</td>
			<td>{endDate}</td>
			{
				isCollectionTable ? <td>{addedAt}</td> : null
			}
		</tr>
	);
}
AuthorTableRow.displayName = 'AuthorTableRow';
AuthorTableRow.propTypes = {
	author: PropTypes.object.isRequired,
	isCollectionTable: PropTypes.bool.isRequired,
	onToggleRow: PropTypes.func,
	selectedEntities: PropTypes.array,
	showCheckboxes: PropTypes.bool
};
AuthorTableRow.defaultProps = {
	onToggleRow: null,
	selectedEntities: [],
	showCheckboxes: false
};

function AuthorTable({authors, isCollectionTable, showCheckboxes, selectedEntities, onToggleRow}) {
	let tableContent;
	if (authors.length) {
		tableContent = (
			<React.Fragment>
				<Table striped>
					<thead>
						<tr>
							<th style={{width: '50%'}}>Name</th>
							<th>Gender</th>
							<th>Type</th>
							<th>Date of birth</th>
							<th>Date of death</th>
							{
								isCollectionTable ? <th>Added at</th> : null
							}
						</tr>
					</thead>
					<tbody>
						{
							authors.map((author) => (
								<AuthorTableRow
									author={author}
									isCollectionTable={isCollectionTable}
									key={author.bbid}
									selectedEntities={selectedEntities}
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
		tableContent = <span>No Authors</span>;
	}
	return (
		<div>
			<h2>Authors</h2>
			{tableContent}
		</div>
	);
}
AuthorTable.displayName = 'WorkTable';
AuthorTable.propTypes = {
	authors: PropTypes.array.isRequired,
	isCollectionTable: PropTypes.bool,
	onToggleRow: PropTypes.func,
	selectedEntities: PropTypes.array,
	showCheckboxes: PropTypes.bool
};
AuthorTable.defaultProps = {
	isCollectionTable: false,
	onToggleRow: null,
	selectedEntities: [],
	showCheckboxes: false
};

export default AuthorTable;
