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


import * as data from '../../helpers/data';
import {Button, Col, Input, Row} from 'react-bootstrap';
import {
	debouncedUpdateIdentifierValue, removeIdentifierRow, updateIdentifierType
} from './actions';
import React from 'react';
import Select from 'react-select';
import ValueField from './value-field';
import {connect} from 'react-redux';

/**
 * Container component. The IdentifierRow component renders a single Row
 * containing several input fields, allowing the user to set the value and type
 * for an identifier in the IdentifierEditor. A button is also included to
 * remove the identifier from the editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.typeOptions - The list of possible types for an
 *        identifier.
 * @param {number} props.typeValue - The ID of the type currently selected.
 * @param {string} props.valueValue - The value currently set for this
 *        identifier.
 * @param {Function} props.onTypeChange - A function to be called when a new
 *        identifier type is selected.
 * @param {Function} props.onRemoveButtonClick - A function to be called when
 *        the button to remove the identifier is clicked.
 * @param {Function} props.onValueChange - A function to be called when the
 *        value for the identifier is changed.
 * @returns {ReactElement} React element containing the rendered IdentifierRow.
 **/
function IdentifierRow({
	typeOptions,
	valueValue,
	typeValue,
	onTypeChange,
	onRemoveButtonClick,
	onValueChange
}) {
	const identifierTypesForDisplay = typeOptions.map((type) => ({
		label: type.label,
		value: type.id
	}));

	return (
		<div>
			<Row>
				<Col md={4}>
					<ValueField
						defaultValue={valueValue}
						empty={!valueValue && typeValue === null}
						error={!data.identifierIsValid(
							typeValue, valueValue, typeOptions
						)}
						typeValue={typeValue}
						onChange={onValueChange}
					/>
				</Col>
				<Col md={4}>
					<Input label="Type">
						<Select
							options={identifierTypesForDisplay}
							value={typeValue}
							onChange={onTypeChange}
						/>
					</Input>
				</Col>
				<Col className="text-right" md={3} mdOffset={1}>
					<Button
						block
						bsStyle="danger"
						className="margin-top-d15"
						onClick={onRemoveButtonClick}
					>
						Remove
					</Button>
				</Col>
			</Row>
			<hr/>
		</div>
	);
}
IdentifierRow.displayName = 'IdentifierEditor.Identifier';
IdentifierRow.propTypes = {
	onRemoveButtonClick: React.PropTypes.func.isRequired,
	onTypeChange: React.PropTypes.func.isRequired,
	onValueChange: React.PropTypes.func.isRequired,
	typeOptions: React.PropTypes.array.isRequired,
	typeValue: React.PropTypes.number.isRequired,
	valueValue: React.PropTypes.string.isRequired
};


function handleValueChange(dispatch, event, index, types) {
	const guessedType =
		data.guessIdentifierType(event.target.value, types);
	if (guessedType) {
		const result = new RegExp(guessedType.detectionRegex)
			.exec(event.target.value);
		event.target.value = result[1];
	}
	return dispatch(
		debouncedUpdateIdentifierValue(index, event.target.value, guessedType)
	);
}


function mapStateToProps(rootState, {index}) {
	const state = rootState.get('identifierEditor');
	return {
		typeValue: state.getIn([index, 'type']),
		valueValue: state.getIn([index, 'value'])
	};
}


function mapDispatchToProps(dispatch, {index, typeOptions}) {
	return {
		onRemoveButtonClick: () => dispatch(removeIdentifierRow(index)),
		onTypeChange: (value) =>
			dispatch(updateIdentifierType(index, value && value.value)),
		onValueChange: (event) =>
			handleValueChange(dispatch, event, index, typeOptions)
	};
}


export default connect(mapStateToProps, mapDispatchToProps)(
	IdentifierRow
);
