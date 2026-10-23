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
import * as bootstrap from 'react-bootstrap';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {faSearch} from '@fortawesome/free-solid-svg-icons';


const {Button, Col, InputGroup, Form, Row} = bootstrap;

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

type AdminPanelSearchFieldState = {
	query: string
};
type AdminPanelSearchFieldProps = {
	onSearch: (query: string) => void,
	query?: string
};

class AdminPanelSearchField extends React.Component<AdminPanelSearchFieldProps, AdminPanelSearchFieldState> {
	static displayName = 'AdminPanelSearchField';

	static propTypes = {
		onSearch: PropTypes.func.isRequired,
		query: PropTypes.string
	};

	static defaultProps = {
		query: ''
	};

	constructor(props: AdminPanelSearchFieldProps) {
		super(props);

		this.state = {
			query: props.query || ''
		};
		this.debouncedTriggerOnSearch = _.debounce(this.triggerOnSearch, updateDelay, {});
	}

	// If search term is changed outside this component (for example browser navigation),
	// reflects those changes
	componentDidUpdate(prevProps: AdminPanelSearchFieldProps) {
		if (prevProps.query !== this.props.query) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({query: this.props.query});
		}
	}

	debouncedTriggerOnSearch: () => void;

	triggerOnSearch() {
		const {query} = this.state;
		this.props.onSearch(query);
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

	render() {
		return (
			<Row>
				<Col lg={{offset: 3, span: 6}}>
					<form
						action="/admin-panel"
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

export default AdminPanelSearchField;
