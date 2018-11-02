/*
 * Copyright (C) 2015  Ohm Patel
 *               2016  Sean Burke
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
import SearchField from './parts/search-field';
import SearchResults from './parts/search-results';
import request from 'superagent-bluebird-promise';


const {Pager, Pagination} = bootstrap;

class SearchPage extends React.Component {
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
			from: 0,
			nextEnabled: true,
			query: this.props.query,
			results: this.props.initialResults,
			size: 20
		};

		// React does not autobind non-React class methods
		this.handleSearch = this.handleSearch.bind(this);
		this.handleClickPrevious = this.handleClickPrevious.bind(this);
		this.handleClickNext = this.handleClickNext.bind(this);
	}

	/**
	 * Gets user text query from the SearchField component and retrieves
	 * autocomplete search results.
	 *
	 * @param {string} query - Query string entered by user.
	 * @param {string} collection - Entity type selected from dropdown
	 * @param {boolean} reset - Reset the search 'from' to 0 for a new search
	 */
	handleSearch(query, collection) {
		if (typeof query === 'string' && query !== this.state.query) {
			this.setState({from: 0, query});
		}
		if (typeof collection === 'string') {
			this.setState({collection});
		}
		const collectionString = this.state.collection ? `&collection=${this.state.collection}` : '';
		const pagination = `&size=${this.state.size}&from=${this.state.from}`;
		request.get(`./search/search?q=${this.state.query}${collectionString}${pagination}`)
			.then((res) => JSON.parse(res.text))
			.then((data) => {
				this.setState(prevState => ({
					nextEnabled: data.length >= prevState.size,
					results: data
				}));
			});
	}

	handleClickPrevious(event) {
		this.setState(prevState => ({from: Math.max(prevState.from - prevState.size, 0)}), this.handleSearch);
	}

	handleClickNext(event) {
		this.setState(prevState => ({from: prevState.from + prevState.size}), this.handleSearch);
	}

	/**
	 * Renders the component: Search bar with results table located vertically
	 * below it.
	 *
	 * @returns {object} - JSX to render.
	 */
	render() {
		return (
			<div id="searchPage">
				<SearchField
					entityTypes={this.props.entityTypes}
					query={this.props.query}
					onSearch={this.handleSearch}
				/>
				<SearchResults results={this.state.results}/>
				<Pager>
					<Pager.Item
						previous disabled={this.state.from <= 0}
						href="#" onClick={this.handleClickPrevious}
					>
						&larr; Previous Page
					</Pager.Item>
					<Pager.Item
						next disabled={!this.state.nextEnabled}
						href="#" onClick={this.handleClickNext}
					>
						Next Page &rarr;
					</Pager.Item>
				</Pager>
			</div>
		);
	}
}

SearchPage.displayName = 'SearchPage';
SearchPage.propTypes = {
	entityTypes: PropTypes.array.isRequired,
	initialResults: PropTypes.array,
	query: PropTypes.string
};
SearchPage.defaultProps = {
	initialResults: [],
	query: ''
};

export default SearchPage;
