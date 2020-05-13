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

// @flow

import * as bootstrap from 'react-bootstrap';

import CustomInput from '../../../input';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {genEntityIconHTMLElement} from '../../../helpers/entity';


const {Button, DropdownButton, InputGroup, MenuItem} = bootstrap;

const SearchButton = (
	<Button
		block
		bsStyle="success"
		type="submit"
	>
		<FontAwesomeIcon icon="search"/>&nbsp;Search
	</Button>
);

const updateDelay = 300;

class SearchField extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			type: ''
		};
		// React does not autobind non-React class methods
		this.handleSubmit = this.handleSubmit.bind(this);
		this.change = this.change.bind(this);
		this.handleEntitySelect = this.handleEntitySelect.bind(this);
	}

	triggerOnSearch() {
		const inputValue = this.queryInput.getValue();
		const {type} = this.state;
		this.props.onSearch(inputValue, _.snakeCase(type));
	}

	handleSubmit(event) {
		event.preventDefault();
		event.stopPropagation();
		this.triggerOnSearch();
	}

	change() {
		const inputValue = this.queryInput.getValue();
		if (!inputValue.match(/^ *$/)) {
			this.triggerOnSearch();
		}
	}

	handleEntitySelect(eventKey: any) {
		this.setState({type: eventKey}, this.triggerOnSearch);
	}

	render() {
		const entityTypeSelect = Array.isArray(this.props.entityTypes) ? (
			<DropdownButton
				componentClass={InputGroup.Button}
				id="entity-type-select"
				title={_.startCase(this.state.type) || 'All Entities'}
				onSelect={this.handleEntitySelect}
			>
				{this.props.entityTypes.map((entityType: string) => (
					<MenuItem
						eventKey={entityType}
						key={entityType}
					>
						{genEntityIconHTMLElement(entityType)}
						{_.startCase(entityType)}
					</MenuItem>
				))}
				<MenuItem divider/>
				<MenuItem
					eventKey="all_entities"
					key="allEntities"
				>
					All Entities
				</MenuItem>

				<MenuItem divider/>
				<MenuItem
					eventKey="editor"
					key="editor"
				>
					{genEntityIconHTMLElement('Editor')}
					Editor
				</MenuItem>
			</DropdownButton>
		) : '';

		return (
			<div className="row">
				<div className="col-md-6 col-md-offset-3">
					<form
						action="/search"
						className="form-horizontal whole-page-form"
						onSubmit={this.handleSubmit}
					>
						<CustomInput
							buttonAfter={[entityTypeSelect, SearchButton]}
							defaultValue={this.props.query}
							name="q"
							ref={(ref) => this.queryInput = ref}
							type="text"
							onChange={_.debounce(this.change, updateDelay)}
						/>
					</form>
				</div>
			</div>
		);
	}
}

SearchField.displayName = 'SearchField';
SearchField.propTypes = {
	entityTypes: PropTypes.array.isRequired,
	onSearch: PropTypes.func.isRequired,
	query: PropTypes.string
};

SearchField.defaultProps = {
	query: ''
};

export default SearchField;
