/*
 * Copyright (C) 2023 Shivam Awasthi
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

import React, {useCallback} from 'react';
import {useRevalidator, useSearchParams} from 'react-router';
import AdminPanelSearchField from './parts/admin-panel-search-field';
import AdminPanelSearchResults from './parts/admin-panel-search-results';
import {Card} from 'react-bootstrap';
import type {EditorSearchResult} from '../../../common/types/search';
import Pagination from './parts/pagination';
import type {SiteUser} from '../../../common/types/site';


type Props = {
	from: number,
	initialResults: EditorSearchResult[],
	nextEnabled: boolean,
	query: string,
	resultsPerPage: number,
	user: SiteUser
};

// The query and the page are in the address; the route's loader searches for them
export default function AdminPanelSearchPage({from, initialResults, nextEnabled, query, resultsPerPage, user}: Props) {
	const [, setSearchParams] = useSearchParams();
	const revalidator = useRevalidator();

	// A new search starts again from the first page
	const handleSearch = useCallback((newQuery: string) => {
		setSearchParams((params) => {
			params.set('q', newQuery);
			params.delete('from');
			return params;
		});
	}, [setSearchParams]);

	// The privileges of an editor changed, so the results are loaded again
	const updateResultsOnPrivsChange = useCallback(() => {
		revalidator.revalidate();
	}, [revalidator]);

	return (
		<Card>
			<Card.Header as="h2">
				Admin Panel
			</Card.Header>
			<Card.Body>
				<div id="pageWithPagination">
					<h3>User search</h3>
					<AdminPanelSearchField
						query={query}
						onSearch={handleSearch}
					/>
					<AdminPanelSearchResults
						results={initialResults}
						updateResultsOnPrivsChange={updateResultsOnPrivsChange}
						user={user}
					/>
					<Pagination
						from={from}
						nextEnabled={nextEnabled}
						shown={initialResults.length}
						size={resultsPerPage}
					/>
					<div className="text-center">
						{initialResults.length === 0 && query.length !== 0 &&
						<div>
							<hr className="thin"/>
							<h2 style={{color: '#754e37'}}>
								No results found
							</h2>
						</div>}
					</div>
				</div>
			</Card.Body>
		</Card>
	);
}
