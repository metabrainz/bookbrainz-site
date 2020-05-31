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
import PropTypes from 'prop-types';
import React from 'react';


const {Table} = bootstrap;


function CollectionsTable(props) {
	const {results, tableHeading} = props;

	const tableCssClasses = 'table table-striped';
	return (

		<div>
			<div>
				<h1 className="text-center">{tableHeading}</h1>
			</div>
			<hr className="thin"/>
			{
				results.length > 0 ?
					<Table
						responsive
						className={tableCssClasses}
					>
						<thead>
							<tr>
								<th className="col-sm-2">Collection Name</th>
								<th className="col-sm-5">Description</th>
								<th className="col-sm-3">EntityType</th>
								<th className="col-sm-3">Privacy</th>
								<th className="col-sm-2">Last Modified</th>
							</tr>
						</thead>

						<tbody>
							{
								results.map((collection) => (
									<tr key={collection.id}>
										<td>
											<a
												href={`/collection/${collection.id}`}
											>
												{collection.name}
											</a>
										</td>
										<td>{collection.description}</td>
										<td>{collection.entityType}</td>
										<td>{collection.public ? 'Public' : 'Private'}</td>
										<td>{collection.lastModified.toString()}</td>
									</tr>
								))
							}
						</tbody>
					</Table> :

					<div>
						<h4> No collections to show</h4>
						<hr className="wide"/>
					</div>
			}
		</div>

	);
}

CollectionsTable.propTypes = {
	results: PropTypes.array.isRequired,
	tableHeading: PropTypes.node
};
CollectionsTable.defaultProps = {
	tableHeading: 'Collections'
};


CollectionsTable.displayName = 'CollectionsTable';


export default CollectionsTable;
