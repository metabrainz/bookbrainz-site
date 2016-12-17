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

import {
	removeIdentifier, updateIdentifierType, updateIdentifierValue
} from './actions';
import IdentifierRow from './identifier-row';
import React from 'react';
import _debounce from 'lodash.debounce';
import {connect} from 'react-redux';
import data from '../../helpers/data';

function IdentifierRowContainer({
	...props
}) {
	return (
		<IdentifierRow {...props}/>
	);
}
IdentifierRowContainer.displayName = 'IdentifierRowContainer';


function handleValueChange(debouncedDispatch, event, index, types) {
	const guessedType =
		data.guessIdentifierType(event.target.value, types);
	if (guessedType) {
		const result = new RegExp(guessedType.detectionRegex)
			.exec(event.target.value);
		event.target.value = result[1];
	}
	return debouncedDispatch(
		updateIdentifierValue(index, event.target.value, guessedType)
	);
}


function mapStateToProps(rootState, {index}) {
	const state = rootState.get('identifierEditor');
	return {
		valueValue: state.getIn([index, 'value']),
		typeValue: state.getIn([index, 'type'])
	};
}

const KEYSTROKE_DEBOUNCE_TIME = 250;
function mapDispatchToProps(dispatch, {index, typeOptions}) {
	const debouncedDispatch = _debounce(dispatch, KEYSTROKE_DEBOUNCE_TIME);
	return {
		onTypeChange: (value) =>
			dispatch(updateIdentifierType(index, value && value.value)),
		onRemoveButtonClick: () => dispatch(removeIdentifier(index)),
		onValueChange: (event) =>
			handleValueChange(debouncedDispatch, event, index, typeOptions)
	};
}


export default connect(mapStateToProps, mapDispatchToProps)(
	IdentifierRowContainer
);
