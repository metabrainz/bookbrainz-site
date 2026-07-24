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

import * as React from 'react';
import AdminPanelSearchField from './parts/admin-panel-search-field';
import AdminPanelSearchResults from './parts/admin-panel-search-results';
import {Card} from 'react-bootstrap';
import PagerElement from './parts/pager';
import PropTypes from 'prop-types';


type Props = {
	from?: number,
	initialResults?: any[],
	nextEnabled: boolean,
	query?: string,
	resultsPerPage?: number,
	user: Record<string, unknown>
};

type State = {
	query: string | null | undefined;
	results: any[];
};

class AdminPanelSearchPage extends React.Component<Props, State> {
	static displayName = 'AdminPanelSearchPage';

	static propTypes = {
		from: PropTypes.number,
		initialResults: PropTypes.array,
		nextEnabled: PropTypes.bool.isRequired,
		query: PropTypes.string,
		resultsPerPage: PropTypes.number,
		user: PropTypes.object.isRequired
	};

	static defaultProps = {
		from: 0,
		initialResults: [],
		query: '',
		resultsPerPage: 20
	};

	/**
	 * Initializes component state to default values and binds class
	 * methods to proper context so that they can be directly invoked
	 * without explicit binding.
	 *
	 * @param {object} props - Properties object passed down from parents.
	 */
	constructor(props) {
		super(props);

		this.state = {
			query: props.query,
			results: props.initialResults
		};

		this.paginationUrl = './admin-panel/search';
		this.pagerRef = React.createRef<PagerElement>();
	}

	paginationUrl: string;

	pagerRef: React.RefObject<PagerElement>;

	/**
	 * Gets user text query from the browser's URL search parameters and
	 * sets it in the state to be passed down to AdminPanelSearchField and Pager components
	 *
	 * @param {string} query - Query string entered by user.
	 */
	handleSearch = (query: string) => {
		this.setState({query});
	};

	/**
	 * The Pager component deals with fetching the query from the server.
	 * We use this callback to set the results on this component's state.
	 *
	 * @param {array} newResults - The array of results from the  query
	 */
	searchResultsCallback = (newResults: any[]) => {
		this.setState({results: newResults});
	};

	/**
	 * The Pager component is set up to react to browser history navigation (prev/next buttons),
	 * and we use this callback to set the query and type on this component's state.
	 *
	 * @param {URLSearchParams} searchParams - The URL search parameters passed up from the pager component
	 */
	searchParamsChangeCallback = (searchParams: URLSearchParams) => {
		let query;
		if (searchParams.has('q')) {
			query = searchParams.get('q');
		}
		if (query === this.state.query) {
			return;
		}
		this.handleSearch(query);
	};

	/**
	 * When we update the privileges of the user, we need to update the information in the results page
	 * The updateResultsTrigger is passed as a prop in the Pager Component, whenever we want to
	 * get updated results, we need to just use the triggerSearch function in the Pager Component. In order to
	 * trigger that function without any change in query, we can just update this prop by flipping it between 0 and 1.
	 * This will trigger the componentDidUpdate lifecycle method in Pager component and then we can run the
	 * triggerSearch function
	 */
	updateResultsOnPrivsChange = () => {
		this.pagerRef?.current?.triggerSearch();
	};

	/**
	 * Renders the component: Search bar with results table located vertically
	 * below it.
	 *
	 * @returns {object} - JSX to render.
	 */
	render() {
		const {query, results} = this.state;
		const querySearchParams = `q=${query}&type=editor`;
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
							onSearch={this.handleSearch}
						/>
						<AdminPanelSearchResults
							results={this.state.results}
							updateResultsOnPrivsChange={this.updateResultsOnPrivsChange}
							user={this.props.user}
						/>
						<PagerElement
							from={this.props.from}
							nextEnabled={this.props.nextEnabled}
							paginationUrl={this.paginationUrl}
							querySearchParams={querySearchParams}
							ref={this.pagerRef}
							results={results}
							searchParamsChangeCallback={this.searchParamsChangeCallback}
							searchResultsCallback={this.searchResultsCallback}
							size={this.props.resultsPerPage}
						/>
						<div className="text-center">
							{results.length === 0 && query.length !== 0 &&
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
}

export default AdminPanelSearchPage;
