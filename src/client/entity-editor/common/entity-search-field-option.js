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

import CustomInput from '../../input';
import Entity from './entity';
import LinkedEntity from './linked-entity';
import PropTypes from 'prop-types';
import React from 'react';
import {Async as SelectAsync} from 'react-select';
import ValidationLabel from '../common/validation-label';
import _ from 'lodash';
import makeImmutable from './make-immutable';
import request from 'superagent';


const ImmutableAsyncSelect = makeImmutable(SelectAsync);

class EntitySearchFieldOption extends React.Component {
	constructor(props) {
		super(props);

		// React does not autobind non-React class methods
		this.fetchOptions = this.fetchOptions.bind(this);
		this.isArea = this.isArea.bind(this);
		this.entityToOption = this.entityToOption.bind(this);
	}

	/**
	 * Determines whether an entity provided to the EntitySearch component is an
	 * Area, using the present attributes.
	 *
	 * @param {Object} entity the entity to test
	 * @returns {boolean} true if the entity looks like an Area
	 */
	isArea(entity) {
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
	 * @param {Array<LanguageOption>} languageOptions - The list of possible languages for an
	 * entity.
	 */
	entityToOption(entity) {
		if (_.isNil(entity)) {
			return null;
		}
		const id = this.isArea(entity) ? entity.id : entity.bbid;
		const languageId = _.get(entity, ['defaultAlias', 'languageId']);
		const language = this.props.languageOptions.find(index => index.value === languageId);
		return {
			disambiguation: _.get(entity, ['disambiguation', 'comment']),
			id,
			language: language && language.label,
			text: _.get(entity, ['defaultAlias', 'name']),
			type: entity.type
		};
	}

	async fetchOptions(query) {
		if (!query) {
			return {
				options: []
			};
		}
		const response = await request
			.get('/search/autocomplete')
			.query({
				q: query,
				type: this.props.type
			});
		return {
			options: response.body.map(this.entityToOption)
		};
	}

	render() {
		const labelElement = <ValidationLabel empty={this.props.empty} error={this.props.error}>{this.props.label}</ValidationLabel>;
		return (
			<CustomInput label={labelElement} tooltipText={this.props.tooltipText}>
				<ImmutableAsyncSelect
					filterOptions={false}
					labelKey="text"
					loadOptions={this.fetchOptions}
					optionComponent={LinkedEntity}
					valueRenderer={Entity}
					onBlurResetsInput={false}
					{...this.props}
				/>
			</CustomInput>
		);
	}
}

EntitySearchFieldOption.displayName = 'EntitySearchFieldOption';
EntitySearchFieldOption.propTypes = {
	empty: PropTypes.bool,
	error: PropTypes.bool,
	label: PropTypes.string.isRequired,
	languageOptions: PropTypes.array,
	tooltipText: PropTypes.string,
	type: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.arrayOf(PropTypes.string)
	]).isRequired
};
EntitySearchFieldOption.defaultProps = {
	empty: true,
	error: false,
	languageOptions: [],
	tooltipText: null
};

export default EntitySearchFieldOption;
