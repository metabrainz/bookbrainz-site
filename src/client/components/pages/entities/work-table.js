/*
 * Copyright (C) 2019  Akhilesh Kumar (@akhilesh26)
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

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {kebabCase as _kebabCase} from 'lodash';


const {Button, Table} = bootstrap;

const {getEntityDisambiguation} = entityHelper;

function WorkTableRow({work, showCheckboxes, selectedEntities, toggleRow}) {
	const name = work.defaultAlias ? work.defaultAlias.name : '(unnamed)';
	const disambiguation = getEntityDisambiguation(work);
	const workType = work.workType ? work.workType.label : '?';
	const workBBID = work.bbid;

	/* eslint-disable react/jsx-no-bind */
	return (
		<tr>
			<td>
				{
					showCheckboxes ?
						<input
							checked={selectedEntities.find(bbid => bbid === work.bbid)}
							className="checkboxes"
							id={work.bbid}
							type="checkbox"
							onClick={() => toggleRow(work.bbid)}
						/> : null
				}
				<a href={`/Work/${workBBID}`}>{name}</a>
				{disambiguation}
			</td>
			<td>{workType}</td>
		</tr>
	);
}
WorkTableRow.displayName = 'WorkTableRow';
WorkTableRow.propTypes = {
	selectedEntities: PropTypes.array,
	showCheckboxes: PropTypes.bool,
	toggleRow: PropTypes.func,
	work: PropTypes.object.isRequired
};
WorkTableRow.defaultProps = {
	selectedEntities: [],
	showCheckboxes: false,
	toggleRow: null
};

function WorkTable({entity, works, showAdd, showCheckboxes, selectedEntities, toggleRow}) {
	let tableContent;
	if (works.length) {
		tableContent = (
			<React.Fragment>
				<Table striped>
					<thead>
						<tr>
							<th>Name</th>
							<th>Type</th>
						</tr>
					</thead>
					<tbody>
						{
							works.map((work) => (
								<WorkTableRow
									key={work.bbid}
									selectedEntities={selectedEntities}
									showCheckboxes={showCheckboxes}
									toggleRow={toggleRow}
									work={work}
								/>
							))
						}
					</tbody>
				</Table>
				{showAdd &&
					<Button
						bsStyle="success"
						className="margin-top-d15"
						href={`/work/create?${_kebabCase(entity.type)}=${entity.bbid}`}
					>
						<FontAwesomeIcon className="margin-right-0-5" icon="plus"/>Add Work
					</Button>
				}
				<hr className="margin-bottom-d0"/>
			</React.Fragment>
		);
	}
	else if (showAdd) {
		tableContent = (
			<React.Fragment>
				<span className="margin-right-2 pull-left">
					<Button
						bsStyle="success"
						href={`/work/create?${_kebabCase(entity.type)}=${entity.bbid}`}
					>
						<FontAwesomeIcon icon="pen-nib" size="2x"/>
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
		tableContent = <span>No Works</span>;
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
	selectedEntities: PropTypes.array,
	showAdd: PropTypes.bool,
	showCheckboxes: PropTypes.bool,
	toggleRow: PropTypes.func,
	works: PropTypes.array.isRequired
};
WorkTable.defaultProps = {
	entity: null,
	selectedEntities: [],
	showAdd: true,
	showCheckboxes: false,
	toggleRow: null
};

export default WorkTable;
