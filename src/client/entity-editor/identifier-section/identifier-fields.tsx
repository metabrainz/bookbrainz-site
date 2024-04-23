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
	Action, addIdentifier
} from './actions';
import {Button, Col, Container, Form, Row} from 'react-bootstrap';
import {
	IdentifierType,
	validateIdentifierValue
} from '../validators/common';
import type {Dispatch} from 'redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import ValueField from './value-field';
import {collapseWhiteSpaces} from '../../../common/helpers/utils';
import {connect} from 'react-redux';
import {faPlus} from '@fortawesome/free-solid-svg-icons';


type OwnProps = {
	index: number,
	typeOptions: Array<IdentifierType>,
	isUnifiedForm: boolean
};

type DispatchProps = {
	onAddNewIdentifier: (value, type) => unknown
};

type Props = DispatchProps & OwnProps;

type TypeObj = {
	value: number,
	label: string
};

/**
 * The IdentifierFields component renders a single Row
 * containing several input fields, allowing the user to set the value and type
 * for an identifier in the identifierSection. A button is also included to
 * remove the identifier from the editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.index - The index of the row in the parent editor.
 * @param {Array} props.typeOptions - The list of possible types for an
 *        identifier.
 * @param {Function} props.onAddNewIdentifier - A function to be called when a new
 *        identifier is added
 * @returns {ReactElement} React element containing the rendered IdentifierRow.
 */
function IdentifierFields({
	index,
	typeOptions,
	onAddNewIdentifier,
	isUnifiedForm
}: Props) {
	const identifierTypesForDisplay = typeOptions.map((type) => ({
		label: type.label,
		value: type.id
	}));

	const [value, setValue] = React.useState<string>('');
	const [type, setType] = React.useState<TypeObj | null>(null);

	const lgCol = {offset: 3, span: 2};
	if (isUnifiedForm) {
		lgCol.offset = 0;
	}

	const handleIdentifierValueChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setValue(event.target.value);
	  }, []);

	const handleAddIdentifier = React.useCallback(() => {
		onAddNewIdentifier(value, type);
	}, [value, type]);

	return (
		// <Container className="d-flex justify-content-center mt-2">
		<Container className="mt-2">
			<Row>
				<Col lg={lgCol}>
					<ValueField
						defaultValue={value}
						empty={!value && type === null}
						error={type && !validateIdentifierValue(
							value, type.value, typeOptions
						)}
						onChange={handleIdentifierValueChange}
					/>
				</Col>
				<Col lg={2}>
					<Form.Group>
						<Form.Label>Type</Form.Label>
						<Select
							classNamePrefix="react-select"
							instanceId={`identifierType${index}`}
							options={identifierTypesForDisplay}
							value={type}
							onChange={setType}
						/>
					</Form.Group>
				</Col>
				<Col className="d-flex align-items-center mt-2" lg={3}>
					<Button variant="success" onClick={handleAddIdentifier}>
						<FontAwesomeIcon icon={faPlus}/>
						<span>&nbsp;Add</span>
					</Button>
				</Col>
			</Row>
		</Container>
	);
}
IdentifierFields.displayName = 'IdentifierFields';


function handleValueChange(
	dispatch: Dispatch<Action>,
	orignalValue: string,
	type: TypeObj,
	types: Array<IdentifierType>
) {
	let value = collapseWhiteSpaces(orignalValue);
	const guessedType =
		data.guessIdentifierType(value, types);
	if (guessedType) {
		const result = new RegExp(guessedType.detectionRegex).exec(value);
		value = result[1];
		// 	disabling "add isbn row" feature temporary
		// if (guessedType.id === 9) {
		// 	const isbn10Type:any = types.find((el) => el.id === 10);
		// 	const isbn10 = isbn13To10(value);
		// 	if (isbn10) {
		// 		dispatch(debouncedUpdateIdentifierValue(index + 1, isbn10, isbn10Type, false));
		// 	}
		// }
		// if (guessedType.id === 10) {
		// 	const isbn13Type:any = types.find((el) => el.id === 9);
		// 	const isbn13 = isbn10To13(value);
		// 	if (isbn13) {
		// 		dispatch(debouncedUpdateIdentifierValue(index + 1, isbn10To13(value), isbn13Type, false));
		// 	}
		// }
	}
	return dispatch(addIdentifier(value, type, guessedType));
}

function mapDispatchToProps(
	dispatch: Dispatch<Action>,
	{typeOptions}: OwnProps
): DispatchProps {
	return {
		onAddNewIdentifier: (value, type) => {
			handleValueChange(dispatch, value, type, typeOptions);
		}
	};
}

export default connect(null, mapDispatchToProps)(IdentifierFields);
