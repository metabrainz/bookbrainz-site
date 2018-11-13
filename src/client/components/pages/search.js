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

import * as bootstrap from 'react-bootstrap';

import PropTypes from 'prop-types';
import React from 'react';
import SearchField from './parts/search-field';
import SearchResults from './parts/search-results';
import request from 'superagent-bluebird-promise';


const {Button, ButtonGroup, DropdownButton, MenuItem, Pager} = bootstrap;

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
			nextEnabled: this.props.initialResults.length === this.props.resultsPerPage,
			query: this.props.query,
			results: this.props.initialResults,
			size: this.props.resultsPerPage
		};

		// React does not autobind non-React class methods
		this.handleSearch = this.handleSearch.bind(this);
		this.triggerSearch = this.triggerSearch.bind(this);
		this.handleClickPrevious = this.handleClickPrevious.bind(this);
		this.handleClickNext = this.handleClickNext.bind(this);
		this.handleResultsPerPageChange = this.handleResultsPerPageChange.bind(this);
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
		if (query === this.state.query && collection === this.state.collection) {
			return;
		}
		if (typeof query !== 'string' || typeof collection !== 'string') {
			return;
		}

		this.setState({collection, from: 0, query}, this.triggerSearch);
	}

	triggerSearch() {
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
		this.setState(prevState => ({from: Math.max(prevState.from - prevState.size, 0)}), this.triggerSearch);
	}

	handleClickNext(event) {
		this.setState(prevState => ({from: prevState.from + prevState.size}), this.triggerSearch);
	}

	handleResultsPerPageChange(value) {
		this.setState({size: parseInt(value, 10)}, this.triggerSearch);
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
				{this.state.results && this.state.results.length ?
					<div>
						<hr className="thin"/>
						<Pager>
							<Pager.Item
								previous disabled={this.state.from <= 0}
								href="#" onClick={this.handleClickPrevious}
							>
								&larr; Previous Page
							</Pager.Item>
							<ButtonGroup>
								<Button disabled link>Results {this.state.from}—
									{this.state.results.length < this.state.size ?
										this.state.results.length :
										this.state.from + this.state.size
									}
								</Button>
								<DropdownButton
									dropup bsStyle="info" id="bg-nested-dropdown"
									title={`${this.state.size} per page`}
									onSelect={this.handleResultsPerPageChange}
								>
									<MenuItem eventKey="10">10 per page</MenuItem>
									<MenuItem eventKey="20">20 per page</MenuItem>
									<MenuItem eventKey="35">35 per page</MenuItem>
									<MenuItem eventKey="50">50 per page</MenuItem>
									<MenuItem eventKey="100">100 per page</MenuItem>
								</DropdownButton>
							</ButtonGroup>
							<Pager.Item
								next disabled={!this.state.nextEnabled}
								href="#" onClick={this.handleClickNext}
							>
								Next Page &rarr;
							</Pager.Item>
						</Pager>
					</div> : null
				}
			</div>
		);
	}
}

SearchPage.displayName = 'SearchPage';
SearchPage.propTypes = {
	entityTypes: PropTypes.array.isRequired,
	initialResults: PropTypes.array,
	query: PropTypes.string,
	resultsPerPage: PropTypes.number
};
SearchPage.defaultProps = {
	initialResults: [],
	query: '',
	resultsPerPage: 20
};

export default SearchPage;
