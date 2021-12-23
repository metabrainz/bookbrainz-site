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


import * as React from 'react';
import * as data from '../../helpers/data';

import {
	Action, debouncedUpdateIdentifierValue, removeIdentifierRow,
	updateIdentifierType
} from './actions';
import {Button, Col, Row} from 'react-bootstrap';
import {
	IdentifierType,
	validateIdentifierValue
} from '../validators/common';
import CustomInput from '../../input';
import type {Dispatch} from 'redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import ValueField from './value-field';
import {connect} from 'react-redux';
import {faTimes} from '@fortawesome/free-solid-svg-icons';


type OwnProps = {
	index: number,
	typeOptions: Array<IdentifierType>
};

type StateProps = {
	valueValue: string,
	typeValue: number
};

type DispatchProps = {
	onTypeChange: (obj: {value: number}) => unknown,
	onRemoveButtonClick: () => unknown,
	onValueChange: (arg: React.ChangeEvent<HTMLInputElement>) => unknown
};

type Props = StateProps & DispatchProps & OwnProps;

/**
 * Container component. The IdentifierRow component renders a single Row
 * containing several input fields, allowing the user to set the value and type
 * for an identifier in the IdentifierEditor. A button is also included to
 * remove the identifier from the editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.index - The index of the row in the parent editor.
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
 */
function IdentifierRow({
	index,
	typeOptions,
	valueValue,
	typeValue,
	onTypeChange,
	onRemoveButtonClick,
	onValueChange
}: Props) {
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
						error={!validateIdentifierValue(
							valueValue, typeValue, typeOptions
						)}
						onChange={onValueChange}
					/>
				</Col>
				<Col md={4}>
					<CustomInput label="Type">
						<Select
							instanceId={`identifierType${index}`}
							options={identifierTypesForDisplay}
							value={typeValue}
							onChange={onTypeChange}
						/>
					</CustomInput>
				</Col>
				<Col className="text-right" md={3} mdOffset={1}>
					<Button
						block
						className="margin-top-d15"
						variant="danger"
						onClick={onRemoveButtonClick}
					>
						<FontAwesomeIcon icon={faTimes}/>
						<span>&nbsp;Remove</span>
					</Button>
				</Col>
			</Row>
			<hr/>
		</div>
	);
}
IdentifierRow.displayName = 'IdentifierEditor.Identifier';


function handleValueChange(
	dispatch: Dispatch<Action>,
	event: React.ChangeEvent<HTMLInputElement>,
	index: number,
	types: Array<IdentifierType>
) {
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


function mapStateToProps(rootState, {index}: OwnProps): StateProps {
	const state = rootState.get('identifierEditor');
	return {
		typeValue: state.getIn([index, 'type']),
		valueValue: state.getIn([index, 'value'])
	};
}


function mapDispatchToProps(
	dispatch: Dispatch<Action>,
	{index, typeOptions}: OwnProps
): DispatchProps {
	return {
		onRemoveButtonClick: () => dispatch(removeIdentifierRow(index)),
		onTypeChange: (value: {value: number}) =>
			dispatch(updateIdentifierType(index, value && value.value)),
		onValueChange: (event: React.ChangeEvent<HTMLInputElement>) =>
			handleValueChange(dispatch, event, index, typeOptions)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(IdentifierRow);
