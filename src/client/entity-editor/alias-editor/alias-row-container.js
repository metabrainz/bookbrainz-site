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
	removeAlias, updateAliasLanguage, updateAliasName,
	updateAliasPrimary, updateAliasSortName
} from '../actions';
import AliasRow from './alias-row';
import React from 'react';
import _debounce from 'lodash.debounce';
import {connect} from 'react-redux';


/**
 * Container component, Renders a single row in the alias editor, connecting
 * the current state and event handlers.
 *
 * @returns {Object} a React component containing the rendered alias row
 */
function AliasRowContainer({
	...props
}) {
	return (
		<AliasRow {...props}/>
	);
}
AliasRowContainer.displayName = 'AliasRowContainer';


const KEYSTROKE_DEBOUNCE_TIME = 250;
function mapDispatchToProps(dispatch, {index}) {
	const debouncedDispatch = _debounce(dispatch, KEYSTROKE_DEBOUNCE_TIME);
	return {
		onLanguageChange: (value) =>
			dispatch(updateAliasLanguage(index, value.value)),
		onNameChange: (event) =>
			debouncedDispatch(updateAliasName(index, event.target.value)),
		onPrimaryClick: (event) =>
			dispatch(updateAliasPrimary(index, event.target.checked)),
		onRemoveButtonClick: () =>
			dispatch(removeAlias(index)),
		onSortNameChange: (event) =>
			debouncedDispatch(updateAliasSortName(index, event.target.value))
	};
}

function mapStateToProps(rootState, {index}) {
	const state = rootState.get('aliasEditor');
	return {
		nameValue: state.getIn([index, 'name']),
		languageValue: state.getIn([index, 'language']),
		primaryChecked: state.getIn([index, 'primary']),
		sortNameValue: state.getIn([index, 'sortName'])
	};
}


export default connect(mapStateToProps, mapDispatchToProps)(AliasRowContainer);
