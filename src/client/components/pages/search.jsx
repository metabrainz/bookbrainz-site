/*
 * Copyright (C) 2015  Ohm Patel
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
const PageHeader = require('react-bootstrap').PageHeader;
const Input = require('react-bootstrap').Input;
const Button = require('react-bootstrap').Button;
const Table = require('react-bootstrap').Table;
const request = require('superagent');
require('superagent-bluebird-promise');
const _ = require('lodash');

const SearchButton = (<Button block bsStyle="success" type="submit"><span className="fa fa-search"></span>&nbsp;Search</Button>);
const delayUpdate = 300;
const SearchField = React.createClass({
	displayName: 'SearchField',
	propTypes: {
		onSearch: React.PropTypes.func.isRequired
	},
	handleSubmit(event) {
		'use strict';
		event.preventDefault();
		event.stopPropagation();
		this.props.onSearch(this.refs.q.getValue());
	},

	change() {
		'use strict';
		const inputValue = this.refs.q.getValue();
		if (!inputValue.match(/^ *$/)) {
			this.props.onSearch(inputValue);
		}
	},

	render() {
		'use strict';
		return (
				<div className="row">
					<div className="col-md-6 col-md-offset-3">
						<form action="/search" className="form-horizontal whole-page-form" onSubmit={this.handleSubmit}>
							<Input buttonAfter={SearchButton} name="q" onChange={_.debounce(this.change, delayUpdate)} ref="q"	type="text"/>
						</form>
					</div>
				</div>
		);
	}
});

const SearchResults = React.createClass({
	displayName: 'SearchResults',
	render() {
		'use strict';
		if (!this.props.results || this.props.results.length === 0) {
			return (
				<div className="col-md-6 col-md-offset-3">
					{this.props.error || 'No results found'}
				</div>
			);
		}
		const results = this.props.results.map((result) => (
			<tr key={result.id}>
				<td>
					<a href={`/${result._type.toLowerCase()}/${result.bbid}`}>
						{result.default_alias ? result.default_alias.name : '(unnamed)'}
					</a>
				</td>
				<td>
					{result._type}
				</td>
			</tr>)
		);

		return (
			<Table className="table table-striped" responsive>
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
});

module.exports = React.createClass({
	displayName: 'SearchPage',
	getInitialState() {
		'use strict';
		return {
			results: this.props.initialResults
		};
	},
	handleSearch(q) {
		'use strict';
		request.get(`./search?mode=auto&q=${q}`)
		.promise()
		.then((res) => (JSON.parse(res.text)))
		.then((data) => {
			this.setState({results: data});
		});
	},
	render() {
		'use strict';
		return (
			<div id="searchPage">
				<SearchField onSearch={this.handleSearch} />
				<SearchResults results={this.state.results} />
			</div>
		);
	}
});
