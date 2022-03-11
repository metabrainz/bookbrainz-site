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
import {Button, Col, Form, Row} from 'react-bootstrap';
import {
	IdentifierType,
	validateIdentifierValue
} from '../validators/common';
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
	typeValue: number,
	showOptions: boolean
};

type DispatchProps = {
	onBlur: (arg: React.ChangeEvent<HTMLInputElement>) => unknown,
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
 * @param {string} props.showOptions - The boolean value to determine
 *        if type field and remove button should be visible.
 * @param {Function} props.onTypeChange - A function to be called when a new
 *        identifier type is selected.
 * @param {Function} props.onRemoveButtonClick - A function to be called when
 *        the button to remove the identifier is clicked.
 * @param {Function} props.onValueChange - A function to be called when the
 *        value for the identifier is changed.
 * @param {Function} props.onBlur - A function to be called when the identifier
 *        field goes out of focus.
 * @returns {ReactElement} React element containing the rendered IdentifierRow.
 */
function IdentifierRow({
	index,
	typeOptions,
	valueValue,
	typeValue,
	showOptions,
	onBlur,
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
				<Col lg={{offset: 3, span: 6}}>
					<ValueField
						defaultValue={valueValue}
						empty={!valueValue && typeValue === null}
						error={!validateIdentifierValue(
							valueValue, typeValue, typeOptions
						)}
						onBlur={onBlur}
						onChange={onValueChange}
					/>
				</Col>
			</Row>
			{showOptions && (
				<Row>
					<Col lg={{offset: 3, span: 4}}>
						<Form.Group>
							<Form.Label>Type</Form.Label>
							<Select
								instanceId={`identifierType${index}`}
								options={identifierTypesForDisplay}
								value={typeValue}
								onChange={onTypeChange}
							/>
						</Form.Group>
					</Col>
					<Col className="text-right" lg={{offset: 0, span: 2}}>
						<Button
							block
							className="margin-top-d21"
							variant="danger"
							onClick={onRemoveButtonClick}
						>
							<FontAwesomeIcon icon={faTimes}/>
							<span>&nbsp;Remove</span>
						</Button>
					</Col>
				</Row>
			)}
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


function handleBlur(
	dispatch: Dispatch<Action>,
	event: React.ChangeEvent<HTMLInputElement>,
	index: number
) {
	if (event.target.value === '') {
		return dispatch(removeIdentifierRow(index));
	}
	return null;
}


function mapStateToProps(rootState, {index}: OwnProps): StateProps {
	const state = rootState.get('identifierEditor');
	const typeValue = state.getIn([index, 'type']);
	const valueValue = state.getIn([index, 'value']);
	let showOptions = true;
	if (valueValue === null || valueValue === '') {
		showOptions = false;
	}
	return {
		showOptions,
		typeValue,
		valueValue
	};
}


function mapDispatchToProps(
	dispatch: Dispatch<Action>,
	{index, typeOptions}: OwnProps
): DispatchProps {
	return {
		onBlur: (event: React.ChangeEvent<HTMLInputElement>) =>
			handleBlur(dispatch, event, index),
		onRemoveButtonClick: () => dispatch(removeIdentifierRow(index)),
		onTypeChange: (value: {value: number}) =>
			dispatch(updateIdentifierType(index, value && value.value)),
		onValueChange: (event: React.ChangeEvent<HTMLInputElement>) =>
			handleValueChange(dispatch, event, index, typeOptions)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(IdentifierRow);
