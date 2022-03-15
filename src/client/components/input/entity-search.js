/*
 * Copyright (C) 2015-2017  Ben Ockmore
 *               2015-2016  Sean Burke
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

import {entityToOption, genEntityIconHTMLElement} from '../../helpers/entity';
import Async from 'react-select/async';
import {Form} from 'react-bootstrap';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {components} from 'react-select';
import request from 'superagent';


class EntitySearch extends React.Component {
	constructor(props) {
		super(props);

		this.fetchOptions = this.fetchOptions.bind(this);
		this.renderOption = this.renderOption.bind(this);
	}

	getValue() {
		return this.select.getValue();
	}

	fetchOptions(query) {
		return request
			.get('/search/autocomplete')
			.query({
				q: query,
				type: _.snakeCase(this.props.type)
			})
			.then((response) => response.body.map(entityToOption));
	}

	renderOption(optionProps) {
		return (
			<components.Option {...optionProps}>
				{optionProps.data.type && genEntityIconHTMLElement(optionProps.data.type)}
				{' '}
				{optionProps.data.text}
				{
					optionProps.data.disambiguation &&
					<span className="disambig">
						({optionProps.data.disambiguation})
					</span>
				}
			</components.Option>
		);
	}

	getOptionLabel(option) {
		return option.text;
	}

	render() {
		const {defaultValue, ...props} = this.props;

		return (
			<Form.Group>
				{props.label &&
				<Form.Label>{props.label}</Form.Label>}
				<Async
					classNamePrefix="react-select"
					components={{Option: this.renderOption}}
					defaultValue={defaultValue && entityToOption(defaultValue)}
					getOptionLabel={this.getOptionLabel}
					loadOptions={this.fetchOptions}
					{...props}
				/>
			</Form.Group>
		);
	}
}

EntitySearch.displayName = 'EntitySearch';
EntitySearch.propTypes = {
	defaultValue: PropTypes.shape({
		bbid: PropTypes.string
	}),
	type: PropTypes.string
};
EntitySearch.defaultProps = {
	defaultValue: null,
	type: null
};

export default EntitySearch;
