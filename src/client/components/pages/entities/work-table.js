/*
 * Copyright (C) 2019  Akhilesh Kumar (@akhilesh26)
 * Copyright (C) 2020  Prabal Singh
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

import {faPenNib, faPlus} from '@fortawesome/free-solid-svg-icons';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {kebabCase as _kebabCase} from 'lodash';


const {Button, Table} = bootstrap;

const {getEntityDisambiguation, getLanguageAttribute, getEntityLabel} = entityHelper;

function renderAuthors(authorData) {
	return authorData.map(author => <div key={author.authorbbid}><a href={`/author/${author.authorbbid}`}>{author.authoralias}</a></div>);
}

function WorkTableRow({showAddedAtColumn, work, showCheckboxes, selectedEntities, onToggleRow}) {
	const name = getEntityLabel(work);
	const authorData = work.authorsData;
	const number = work.number || '?';
	const disambiguation = getEntityDisambiguation(work);
	const workType = work.workType ? work.workType.label : '?';
	const languages = getLanguageAttribute(work).data;
	const addedAt = showAddedAtColumn ? utilHelper.formatDate(new Date(work.addedAt), true) : null;

	/* eslint-disable react/jsx-no-bind */
	return (
		<tr>
			{work.displayNumber && <td>{number}</td>}
			<td>
				{
					showCheckboxes ?
						<input
							checked={selectedEntities.find(bbid => bbid === work.bbid)}
							className="checkboxes"
							id={work.bbid}
							type="checkbox"
							onClick={() => onToggleRow(work.bbid)}
						/> : null
				}
				<a href={`/work/${work.bbid}`}>{name}</a>
				{disambiguation}
			</td>
			{authorData && <td>{authorData.length ? renderAuthors(authorData) : '?'}</td>}
			<td>{languages}</td>
			<td>{workType}</td>
			{showAddedAtColumn ? <td>{addedAt}</td> : null}
		</tr>
	);
}
WorkTableRow.displayName = 'WorkTableRow';
WorkTableRow.propTypes = {
	onToggleRow: PropTypes.func,
	selectedEntities: PropTypes.array,
	showAddedAtColumn: PropTypes.bool.isRequired,
	showCheckboxes: PropTypes.bool,
	work: PropTypes.object.isRequired
};
WorkTableRow.defaultProps = {
	onToggleRow: null,
	selectedEntities: [],
	showCheckboxes: false
};

function WorkTable({entity, showAddedAtColumn, works, showAdd, showCheckboxes, selectedEntities, onToggleRow}) {
	let tableContent;
	if (works.length) {
		const showAuthors = works[0].authorsData;
		tableContent = (
			<React.Fragment>
				<Table striped>
					<thead>
						<tr>
							{works[0].displayNumber && <th style={{width: '10%'}}>#</th>}
							<th>Name</th>
							{showAuthors && <th>Author</th>}
							<th>Languages</th>
							<th>Type</th>
							{
								showAddedAtColumn ? <th>Added at</th> : null
							}
						</tr>
					</thead>
					<tbody>
						{
							works.map((work) => (
								<WorkTableRow
									key={work.bbid}
									selectedEntities={selectedEntities}
									showAddedAtColumn={showAddedAtColumn}
									showCheckboxes={showCheckboxes}
									work={work}
									onToggleRow={onToggleRow}
								/>
							))
						}
					</tbody>
				</Table>
				{showAdd &&
					<Button
						className="margin-top-d15"
						href={`/work/create?${_kebabCase(entity.type)}=${entity.bbid}`}
						variant="success"
					>
						<FontAwesomeIcon className="margin-right-0-5" icon={faPlus}/>Add Work
					</Button>
				}
			</React.Fragment>
		);
	}
	else if (showAdd) {
		tableContent = (
			<React.Fragment>
				<span className="margin-right-2 float-start">
					<Button
						href={`/work/create?${_kebabCase(entity.type)}=${entity.bbid}`}
						variant="success"
					>
						<FontAwesomeIcon icon={faPenNib} size="2x"/>
						<br/>
						Add Work
					</Button>
				</span>
				<span>
					<h4>There are no Works yet!</h4>
					<p>
						Help us complete BookBrainz
						<br/>
					</p>
					<br/><small>Not sure what to do? Visit the <a href="/help">help page</a> to get started.</small>
				</span>
				<hr className="margin-bottom-d0"/>
			</React.Fragment>
		);
	}
	else {
		tableContent = <span>No works</span>;
	}
	return (
		<div>
			<h2>Works</h2>
			{tableContent}
		</div>
	);
}
WorkTable.displayName = 'WorkTable';
WorkTable.propTypes = {
	entity: PropTypes.object,
	onToggleRow: PropTypes.func,
	selectedEntities: PropTypes.array,
	showAdd: PropTypes.bool,
	showAddedAtColumn: PropTypes.bool,
	showCheckboxes: PropTypes.bool,
	works: PropTypes.array.isRequired
};
WorkTable.defaultProps = {
	entity: null,
	onToggleRow: null,
	selectedEntities: [],
	showAdd: true,
	showAddedAtColumn: false,
	showCheckboxes: false
};

export default WorkTable;
