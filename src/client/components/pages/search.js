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

const React = require('react');
const request = require('superagent-bluebird-promise');

const SearchField = require('./parts/search-field');
const SearchResults = require('./parts/search-results');

(() => {
	'use strict';

	class SearchPage extends React.Component {
		constructor(props) {
			super(props);

			this.state = {
				results: this.props.initialResults
			};

			// React does not autobind non-React class methods
			this.handleSearch = this.handleSearch.bind(this);
		}

		handleSearch(q) {
			request.get(`./search/autocomplete?q=${q}`)
				.then((res) => JSON.parse(res.text))
				.then((data) => {
					this.setState({results: data});
				});
		}

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

	module.exports = SearchPage;
})();
