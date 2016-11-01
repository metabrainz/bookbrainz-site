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

import DateField from './date-field';
import _debounce from 'lodash.debounce';
import {connect} from 'react-redux';
import {updateBeginDate} from '../actions';

const KEYSTROKE_DEBOUNCE_TIME = 250;

function isPartialDateValid(value) {
	const ymdRegex = /^\d{4}-\d{2}-\d{2}$/;
	const ymRegex = /^\d{4}-\d{2}$/;
	const yRegex = /^\d{4}$/;

	const validSyntax = Boolean(
		ymdRegex.test(value) ||
		ymRegex.test(value) ||
		yRegex.test(value)
	);
	const validValue = !isNaN(Date.parse(value));

	return validSyntax && validValue;
}

function mapStateToProps(rootState) {
	const state = rootState.get('creatorData');

	const labelText = state.get('singular') ?
		'Date of Birth' :
		'Date Founded';

	return {
		label: labelText,
		error: !isPartialDateValid(state.get('beginDate')),
		empty: !state.get('beginDate'),
		defaultValue: state.get('beginDate')
	};
}

function mapDispatchToProps(dispatch) {
	const debouncedDispatch = _debounce(dispatch, KEYSTROKE_DEBOUNCE_TIME);
	return {
		onChange: (event) =>
			debouncedDispatch(updateBeginDate(event.target.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(DateField);
