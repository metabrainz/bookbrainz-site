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

function WorkTableRow({work}) {
	const name = work.defaultAlias ? work.defaultAlias.name : '(unnamed)';
	const disambiguation = getEntityDisambiguation(work);
	const workType = work.workType ? work.workType.label : '?';
	const workBBID = work.bbid;
	return (
		<tr>
			<td>
				<a href={`/Work/${workBBID}`}>{name}</a>
				{disambiguation}
			</td>
			<td>{workType}</td>
		</tr>
	);
}
WorkTableRow.displayName = 'WorkTableRow';
WorkTableRow.propTypes = {
	work: PropTypes.object.isRequired
};

function WorkTable({entity, works}) {
	return (
		<div>
			<h2>Works</h2>
			{
				works.length ?
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
											work={work}
										/>
									))}
							</tbody>
						</Table>
						<Button
							bsStyle="success"
							className="margin-top-d15"
							href={`/work/create?${_kebabCase(entity.type)}=${entity.bbid}`}
						>
							<FontAwesomeIcon className="margin-right-0-5" icon="plus"/>Add Work
						</Button>
						<hr className="margin-bottom-d0"/>
					</React.Fragment> :
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
			}
		</div>
	);
}
WorkTable.displayName = 'WorkTable';
WorkTable.propTypes = {
	entity: PropTypes.object.isRequired,
	works: PropTypes.array.isRequired
};

export default WorkTable;
