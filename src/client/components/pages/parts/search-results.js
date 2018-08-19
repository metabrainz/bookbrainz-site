/*
 * Copyright (C) 2015  Ohm Patel
 *               2016  Sean Burke
 *               2017 Shivam Tripathi
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


const {Label, Table} = bootstrap;

function SearchResults(props) {
	const noResults = !props.results || props.results.length === 0;
	if (noResults) {
		return (
			<div className="col-md-6 col-md-offset-3">
				{'No results found'}
			</div>
		);
	}

	const results = props.results.map((result) => {
		// No redirect link for Area entity results
		const name = result.defaultAlias ? result.defaultAlias.name :
			'(unnamed)';

		let link = null;
		if (result.type === 'Area') {
			link = `//musicbrainz.org/area/${result.bbid}`;
		}
		else if (result.bbid) {
			link = `/${result.type.toLowerCase()}/${result.bbid}`;
		}
		else if (result.importId) {
			link = `/imports/${result.type.toLowerCase()}/${result.importId}`;
		}
		result.id = result.bbid || result.importId;
		const tag = result.importId ? <Label> Imported </Label> : null;

		return (
			<tr key={result.id}>
				<td>
					<a
						className={result.importId ? 'color-red' : ''}
						href={link}
					>
						{name}
					</a>
				</td>
				<td>
					{result.type}{' '}{tag}
				</td>
			</tr>
		);
	});

	return (
		<Table
			responsive
			className="table table-striped"
		>
			<thead>
				<tr>
					<th>Alias</th>
					<th>Type</th>
				</tr>
			</thead>
			<tbody>
				{results}
			</tbody>
		</Table>
	);
}

SearchResults.displayName = 'SearchResults';
SearchResults.propTypes = {
	results: PropTypes.array
};
SearchResults.defaultProps = {
	results: null
};

export default SearchResults;
