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
/* eslint valid-jsdoc: ["error", { "requireReturn": false }] */

import React from 'react';
import SearchField from './parts/search-field';
import SearchResults from './parts/search-results';
import request from 'superagent-bluebird-promise';

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
			results: this.props.initialResults
		};

		// React does not autobind non-React class methods
		this.handleSearch = this.handleSearch.bind(this);
	}

	/**
	 * Gets user text query from the SearchField component and retrieves
	 * autocomplete search results.
	 *
	 * @param {string} q - Query string entered by user.
	 */
	handleSearch(q) {
		request.get(`./search/autocomplete?q=${q}`)
			.then((res) => JSON.parse(res.text))
			.then((data) => {
				this.setState({results: data});
			});
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
				<SearchField onSearch={this.handleSearch}/>
				<SearchResults results={this.state.results}/>
			</div>
		);
	}
}

SearchPage.displayName = 'SearchPage';
SearchPage.propTypes = {
	initialResults: React.PropTypes.array
};
SearchPage.defaultProps = {
	initialResults: []
};

export default SearchPage;
