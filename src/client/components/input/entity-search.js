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

import {Async} from 'react-select';
import PropTypes from 'prop-types';
import React from 'react';
import SelectWrapper from './select-wrapper';
import {genEntityIconHTMLElement} from '../../helpers/entity';
import request from 'superagent-bluebird-promise';

/**
 * Determines whether an entity provided to the EntitySearch component is an
 * Area, using the present attributes.
 *
 * @param {Object} entity the entity to test
 * @returns {boolean} true if the entity looks like an Area
 */
function isArea(entity) {
	if (entity.type === 'Area') {
		return true;
	}

	if (entity.gid) {
		return true;
	}

	return false;
}

/**
 * Takes an entity and converts it to a format acceptable to react-select.
 *
 * @param {Object} entity the entity to convert
 * @returns {Object} the formatted data
 */
function entityToOption(entity) {
	const id = isArea(entity) ? entity.id : entity.bbid;

	return {
		disambiguation: entity.disambiguation ?
			entity.disambiguation.comment : null,
		id,
		text: entity.defaultAlias ?
			entity.defaultAlias.name : '(unnamed)',
		type: entity.type
	};
}

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
				collection: this.props.collection,
				q: query
			})
			.then((response) => ({
				options: response.body.map(entityToOption)
			}));
	}

	renderOption(option) {
		return (
			<div>
				{option.type && genEntityIconHTMLElement(option.type)}
				{' '}
				{option.text}
				{
					option.disambiguation &&
					<span className="disambig">
						({option.disambiguation})
					</span>
				}
			</div>
		);
	}

	render() {
		const {defaultValue, ...props} = this.props;

		return (
			<SelectWrapper
				base={Async}
				defaultValue={defaultValue && entityToOption(defaultValue)}
				idAttribute="id"
				labelAttribute="text"
				loadOptions={this.fetchOptions}
				optionRenderer={this.renderOption}
				ref={(ref) => this.select = ref}
				{...props}
			/>
		);
	}
}

EntitySearch.displayName = 'EntitySearch';
EntitySearch.propTypes = {
	collection: PropTypes.string,
	defaultValue: PropTypes.shape({
		bbid: PropTypes.string
	})
};
EntitySearch.defaultProps = {
	collection: null,
	defaultValue: null

};

export default EntitySearch;
