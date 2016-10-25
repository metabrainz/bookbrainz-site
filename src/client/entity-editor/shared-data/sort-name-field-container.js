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

import SortNameField from '../common/sort-name-field';
import _debounce from 'lodash.debounce';
import {connect} from 'react-redux';
import {updateSortNameField} from '../actions';

const KEYSTROKE_DEBOUNCE_TIME = 250;

function isEmpty(state) {
	return !(state.get('name') || state.get('sortName'));
}

function isError(state) {
	return !(state.get('sortName'));
}

function mapStateToProps(rootState) {
	const state = rootState.get('sharedData');
	return {
		empty: isEmpty(state),
		error: isError(state),
		storedNameValue: state.get('name'),
		defaultValue: state.get('sortName')
	};
}

function mapDispatchToProps(dispatch) {
	const debouncedDispatch = _debounce(dispatch, KEYSTROKE_DEBOUNCE_TIME);
	return {
		onChange: (event) => debouncedDispatch(
			updateSortNameField(event.target.value)
		)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(SortNameField);
