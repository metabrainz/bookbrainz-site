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

import {Col, Input, Row} from 'react-bootstrap';

import React from 'react';
import ValidationLabel from './validation-label';
import _debounce from 'lodash.debounce';
import {connect} from 'react-redux';
import {updateNameField} from './actions';


/**
 * Container component. Renders the name field for the alias section of entity
 * editing forms.
 *
 * @returns {Object} a React component containing the rendered input
 */
let NameField = ({
	dispatch,
	storedNameValue = '',
	storedSortNameValue = ''
}) => {
	let input;

	const label = (
		<ValidationLabel
			empty={
				storedNameValue.length === 0 &&
				storedSortNameValue.length === 0
			}
			error={storedNameValue === 0}
		>
			Name
		</ValidationLabel>
	);

	const KEYSTROKE_DEBOUNCE_TIME = 250;
	const debouncedDispatch = _debounce(dispatch, KEYSTROKE_DEBOUNCE_TIME);

	return (
		<Row>
			<Col
				md={6}
				mdOffset={3}
			>
				<Input
					label={label}
					ref={(node) => { input = node; }}
					type="text"
					onChange={() => debouncedDispatch(
						updateNameField(input.getInputDOMNode().value)
					)}
				/>
			</Col>
		</Row>
	);
};
NameField.displayName = 'NameField';
NameField.propTypes = {
	dispatch: React.PropTypes.func,
	storedNameValue: React.PropTypes.string,
	storedSortNameValue: React.PropTypes.string
};

NameField = connect(
	(state) => ({
		storedNameValue: state.nameValue,
		storedSortNameValue: state.sortNameValue
	})
)(NameField);

export default NameField;
