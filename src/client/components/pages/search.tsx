/*
 * Copyright (C) 2015  Ohm Patel
 *               2016  Sean Burke
 *               2018  Nicolas Pelleiter
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
import PagerElement from './parts/pager';
import PropTypes from 'prop-types';
import SearchField from './parts/search-field';
import SearchResults from './parts/search-results';


type Props = {
	entityTypes: any[],
	from?: number,
	initialResults?: any[],
	nextEnabled: boolean,
	query?: string,
	resultsPerPage?: number,
	type?: string,
	user: Record<string, unknown>
};

type State = {
	query: string | null | undefined;
	results: any[];
	type: string | null | undefined;
};

class SearchPage extends React.Component<Props, State> {
	static displayName = 'SearchPage';

	static propTypes = {
		entityTypes: PropTypes.array.isRequired,
		from: PropTypes.number,
		initialResults: PropTypes.array,
		nextEnabled: PropTypes.bool.isRequired,
		query: PropTypes.string,
		resultsPerPage: PropTypes.number,
		type: PropTypes.string,
		user: PropTypes.object.isRequired
	};

	static defaultProps = {
		from: 0,
		initialResults: [],
		query: '',
		resultsPerPage: 20,
		type: null
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
			results: props.initialResults,
			type: props.type
		};

		this.paginationUrl = './search/search';
	}

	paginationUrl: string;

	/**
	 * Gets user text query from the browser's URL search parameters and
	 * sets it in the state to be passed down to SearchField and Pager components
	 *
	 * @param {string} query - Query string entered by user.
	 * @param {string} type - Entity type selected from dropdown
	 */
	handleSearch = (query: string, type: string) => {
		this.setState({query, type});
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
		let type;
		if (searchParams.has('q')) {
			query = searchParams.get('q');
		}
		if (searchParams.has('type')) {
			type = searchParams.get('type');
		}
		if (query === this.state.query && type === this.state.type) {
			return;
		}
		this.handleSearch(query, type);
	};

	/**
	 * Renders the component: Search bar with results table located vertically
	 * below it.
	 *
	 * @returns {object} - JSX to render.
	 */
	render() {
		const {type, query, results} = this.state;
		const querySearchParams = `q=${query}${type ? `&type=${type}` : ''}`;
		return (
			<div id="pageWithPagination">
				<SearchField
					entityTypes={this.props.entityTypes}
					query={query}
					type={type}
					onSearch={this.handleSearch}
				/>
				<SearchResults
					results={this.state.results}
					user={this.props.user}
				/>
				<PagerElement
					from={this.props.from}
					nextEnabled={this.props.nextEnabled}
					paginationUrl={this.paginationUrl}
					querySearchParams={querySearchParams}
					results={results}
					searchParamsChangeCallback={this.searchParamsChangeCallback}
					searchResultsCallback={this.searchResultsCallback}
					size={this.props.resultsPerPage}
				/>
			</div>
		);
	}
}

export default SearchPage;
