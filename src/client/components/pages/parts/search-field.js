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

const Icon = require('react-fontawesome');
const React = require('react');
const _debounce = require('lodash.debounce');

const Button = require('react-bootstrap').Button;
const Input = require('react-bootstrap').Input;

const SearchButton = (
	<Button
		block
		bsStyle="success"
		type="submit"
	>
		<Icon name="search"/>&nbsp;Search
	</Button>
);

const updateDelay = 300;

class SearchField extends React.Component {
	constructor(props) {
		super(props);

		// React does not autobind non-React class methods
		this.handleSubmit = this.handleSubmit.bind(this);
		this.change = this.change.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();
		event.stopPropagation();

		this.props.onSearch(this.query.getValue());
	}

	change() {
		const inputValue = this.query.getValue();

		if (!inputValue.match(/^ *$/)) {
			this.props.onSearch(inputValue);
		}
	}

	render() {
		return (
			<div className="row">
				<div className="col-md-6 col-md-offset-3">
					<form
						action="/search"
						className="form-horizontal whole-page-form"
						onSubmit={this.handleSubmit}
					>
						<Input
							buttonAfter={SearchButton}
							name="q"
							ref={(ref) => this.query = ref}
							type="text"
							onChange={_debounce(this.change, updateDelay)}
						/>
					</form>
				</div>
			</div>
		);
	}
}

SearchField.displayName = 'SearchField';
SearchField.propTypes = {
	onSearch: React.PropTypes.func.isRequired
};

module.exports = SearchField;
