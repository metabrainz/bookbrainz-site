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

import * as React from 'react';
import * as bootstrap from 'react-bootstrap';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {genEntityIconHTMLElement} from '../../../helpers/entity';


const {Button, Col, Dropdown, DropdownButton, InputGroup, Form, Row} = bootstrap;

const SearchButton = (
	<Button
		block
		type="submit"
		variant="success"
	>
		<FontAwesomeIcon icon={faSearch}/>&nbsp;Search
	</Button>
);

const updateDelay = 1000;

type SearchFieldState = {
	type: string,
	query: string,
};
type SearchFieldProps = {
	entityTypes: any[],
	onSearch: (query: string, type: string) => void,
	query?: string,
	type?: string
};

class SearchField extends React.Component<SearchFieldProps, SearchFieldState> {
	static displayName = 'SearchField';

	static propTypes = {
		entityTypes: PropTypes.array.isRequired,
		onSearch: PropTypes.func.isRequired,
		query: PropTypes.string,
		type: PropTypes.string
	};

	static defaultProps = {
		query: '',
		type: ''
	};

	constructor(props: SearchFieldProps) {
		super(props);

		this.state = {
			query: props.query || '',
			type: props.type || ''
		};
		this.debouncedTriggerOnSearch = _.debounce(this.triggerOnSearch, updateDelay, {});
	}

	// If search term is changed outside this component (for example browser navigation),
	// reflects those changes
	componentDidUpdate(prevProps: SearchFieldProps) {
		if (prevProps.query !== this.props.query) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({query: this.props.query});
		}
		if (prevProps.type !== this.props.type) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({type: this.props.type});
		}
	}

	debouncedTriggerOnSearch: () => void;

	triggerOnSearch() {
		const {query, type} = this.state;
		this.props.onSearch(query, _.snakeCase(type));
	}

	handleSubmit = event => {
		event.preventDefault();
		event.stopPropagation();
		this.triggerOnSearch();
	};

	handleChange = event => {
		if (!event.target.value.match(/^ +$/) && event.target.value !== this.state.query) {
			this.setState({query: event.target.value}, this.debouncedTriggerOnSearch);
		}
	};

	handleEntitySelect = (eventKey: any) => {
		this.setState({type: eventKey}, this.debouncedTriggerOnSearch);
	};

	render() {
		const entityTypeSelect = Array.isArray(this.props.entityTypes) ? (
			<DropdownButton
				as={InputGroup.Append}
				id="entity-type-select"
				title={_.startCase(this.state.type) || 'All Entities'}
				variant="secondary"
				onSelect={this.handleEntitySelect}
			>
				{this.props.entityTypes.map((entityType: string) => (
					<Dropdown.Item
						eventKey={entityType}
						key={entityType}
					>
						{genEntityIconHTMLElement(entityType)}
						{_.startCase(entityType)}
					</Dropdown.Item>
				))}
				<Dropdown.Divider/>
				<Dropdown.Item
					eventKey="all_entities"
					key="allEntities"
				>
					All Entities
				</Dropdown.Item>

				<Dropdown.Divider/>
				<Dropdown.Item
					eventKey="editor"
					key="editor"
				>
					{genEntityIconHTMLElement('Editor')}
					Editor
				</Dropdown.Item>
				<Dropdown.Item
					eventKey="collection"
					key="collection"
				>
					{genEntityIconHTMLElement('Collection')}
					Collection
				</Dropdown.Item>
			</DropdownButton>
		) : '';

		return (
			<Row>
				<Col lg={{offset: 3, span: 6}}>
					<form
						action="/search"
						className="form-horizontal whole-page-form"
						role="search"
						onSubmit={this.handleSubmit}
					>
						<Form.Group>
							<InputGroup>
								<Form.Control
									name="q"
									type="text"
									value={this.state.query}
									onChange={this.handleChange}
								/>
								<InputGroup.Append>
									{entityTypeSelect}
									{SearchButton}
								</InputGroup.Append>
							</InputGroup>
						</Form.Group>
					</form>
				</Col>
			</Row>
		);
	}
}

export default SearchField;
