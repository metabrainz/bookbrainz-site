/*
 * Copyright (C) 2019 Prabal Singh
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
import * as utilsHelper from '../../../helpers/utils';
import {genEntityIconHTMLElement, getEntityLabel, getEntityUrl} from '../../../helpers/entity';
import PropTypes from 'prop-types';
import React from 'react';


const {Table} = bootstrap;
const {formatDate} = utilsHelper;


function RevisionsTable(props) {
	const {results} = props;
	const tableCssClasses = 'table table-striped';
	return (

		<div>
			<div>
				<h1 className="text-center">Recent Activity</h1>
			</div>
			<hr className="thin"/>
			<Table
				responsive
				className={tableCssClasses}
			>
				<thead>
					<tr>
						<th className="col-sm-2">Revision ID</th>
						<th className="col-sm-5">Modified entities</th>
						<th className="col-sm-3">User</th>
						<th className="col-sm-2">Date</th>

					</tr>
				</thead>
				<tbody>
					{
						results.map((revision, i) => (
							<tr key={i}>
								<td>
									<a href={`/revision/${revision.revisionId}`} >
										{revision.revisionId}
									</a>
								</td>
								<td>
									{revision.entities.map(entity => (
										<div key={`${revision.revisionId}-${entity.bbid}`}>
											<a href={getEntityUrl(entity)} >
												{genEntityIconHTMLElement(entity.type)}
												{getEntityLabel(entity)}
											</a>
										</div>
									))}
								</td>
								<td>
									<a href={`/editor/${revision.editor.id}`} >
										{revision.editor.name}
									</a>
								</td>
								<td>{formatDate(new Date(revision.createdAt), true)}</td>
							</tr>
						))
					}
				</tbody>
			</Table>
		</div>

	);
}

RevisionsTable.propTypes = {
	results: PropTypes.array.isRequired
};

RevisionsTable.displayName = 'RevisionsTable';


export default RevisionsTable;
