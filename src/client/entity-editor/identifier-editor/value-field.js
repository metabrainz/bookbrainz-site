/*
 * Copyright (C) 2016  Ben Ockmore
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

import {suggestIdentifierType, updateIdentifierValue} from '../actions';
import {Input} from 'react-bootstrap';

import React from 'react';
import ValidationLabel from '../common/validation-label';
import _debounce from 'lodash.debounce';
import {connect} from 'react-redux';
import data from '../../helpers/data';

const KEYSTROKE_DEBOUNCE_TIME = 250;

/**
 * Presentational component. Renders the name field for the alias section of
 * entity editing forms.
 *
 * @returns {Object} a React component containing the rendered input
 */
function ValueField({
	empty,
	error,
	...rest
}) {
	const label = (
		<ValidationLabel empty={empty} error={error}>
			Value
		</ValidationLabel>
	);

	return (
		<Input label={label} type="text" {...rest}/>
	);
}
ValueField.displayName = 'ValueField';
ValueField.propTypes = {
	empty: React.PropTypes.bool,
	error: React.PropTypes.bool
};

function isEmpty(state, index) {
	const value = state.get(index).get('value');
	const type = state.get(index).get('type');

	return value && type === null;
}

function isError(state, types, index) {
	const value = state.get(index).get('value');

	return !data.identifierIsValid(state.getIn([index, 'type']), value, types);
}

function mapStateToProps(rootState, {index, types}) {
	const state = rootState.get('identifierEditor');
	return {
		empty: isEmpty(state, index),
		error: isError(state, types, index),
		defaultValue: state.getIn([index, 'value'])
	};
}

function mapDispatchToProps(dispatch, {index, types}) {
	const debouncedDispatch = _debounce(dispatch, KEYSTROKE_DEBOUNCE_TIME);
	return {
		onChange: (event) => {
			const guessedType =
				data.guessIdentifierType(event.target.value, types);
			if (guessedType) {
				const result = new RegExp(guessedType.detectionRegex).exec(event.target.value);
				event.target.value = result[1];
			}
			return debouncedDispatch(updateIdentifierValue(index, event.target.value, guessedType));
		}
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ValueField);
