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

// @flow

import Icon from 'react-fontawesome';
import {Input} from 'react-bootstrap';
import React from 'react';
import Select from 'react-select';
import ValidationLabel from '../common/validation-label';
import request from 'superagent-bluebird-promise';

/**
 * Determines whether an entity provided to the EntitySearch component is an
 * Area, using the present attributes.
 *
 * @param {Object} entity the entity to test
 * @returns {boolean} true if the entity looks like an Area
 **/
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
 **/
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

type OptionProps = {
	disambiguation: string,
	text: string,
	type: string
};

function Option({disambiguation, text, type}: OptionProps) {
	console.log(text);
	const ENTITY_TYPE_ICONS = {
		Area: 'globe',
		Creator: 'user',
		Edition: 'book',
		Publication: 'th-list',
		Publisher: 'university',
		Work: 'file-text-o'
	};

	return (
		<div>
			{type && <Icon name={ENTITY_TYPE_ICONS[type]}/>}
			{' '}
			{text}
			{
				disambiguation &&
				<span className="disambig">
					({disambiguation})
				</span>
			}
		</div>
	);
}
Option.displayName = 'Option';

type EntitySearchFieldProps = {
	label: string,
	type: string,
	empty?: boolean,
	error?: boolean
};

/**
 * Presentational component. This component renders a selection field which
 * uses the user input to search for entities on the server. It allows the
 * selection of one or more of the returned entities.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.error - Passed to the ValidationLabel within the
 *        component to indicate a validation error.
 * @param {boolean} props.empty - Passed to the ValidationLabel within the
 *        component to indicate that the field is empty.
 * @param {string} props.type - Determines the type of entity to search for.
 * @param {string} props.label - The text to be used for the input label.
 * @returns {Object} A React component containing the rendered input.
 */
function EntitySearchField(
	{
		label,
		empty,
		error,
		type,
		...rest
		}: EntitySearchFieldProps
) {
	function fetchOptions(query) {
		return request
			.get('/search/autocomplete')
			.query({
				collection: type,
				q: query
			})
			.then((response) => ({
				options: response.body.map(entityToOption)
			}));
	}

	const labelElement =
		<ValidationLabel empty={empty} error={error}>{label}</ValidationLabel>;

	return (
		<Input label={labelElement}>
			<Select.Async
				labelKey="text"
				loadOptions={fetchOptions}
				optionRenderer={Option}
				valueKey="id"
				{...rest}
			/>
		</Input>
	);
}
EntitySearchField.displayName = 'EntitySearchField';
EntitySearchField.defaultProps = {
	empty: true,
	error: false,
	type: null
};

export default EntitySearchField;
