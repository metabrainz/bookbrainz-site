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
import {Col, Row} from 'react-bootstrap';
import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import type {Dispatch} from 'redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import IdentifierEditor from './identifier-editor';
import {IdentifierType} from '../validators/common';
import {collapseWhiteSpaces} from '../../../common/helpers/utils';
import {connect} from 'react-redux';


type OwnProps = {
	index: number,
	typeOptions: Array<IdentifierType>,
	isUnifiedForm: boolean
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

type Props = DispatchProps & OwnProps & StateProps;

/**
 * Container component. The IdentifierRow component renders all the identifiers
 * of the entity, displaying information about the identifier value and it's type
 * with the edit and delete icon button besides each identifiers
 * the edit icon button opens a model when the show property is set
 * the delete icon button removes the identifier from the list when clicked
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
 *        the trash icon to remove the identifier is clicked.
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
	onValueChange,
	isUnifiedForm
}: Props) {
	const identifierTypesForDisplay = typeOptions.map((type) => ({
		label: type.label,
		value: type.id
	}));
	const [showEditor, setEditorVisibility] = React.useState(false);
	const identifierValue = identifierTypesForDisplay.filter((el) => el.value === typeValue);

	const handleEditButtonClick = React.useCallback(() => {
		setEditorVisibility(true);
	  }, []);

	const lgCol = {offset: 4, span: 3};
	if (isUnifiedForm) {
		lgCol.offset = 0;
	}
	return (
		<div>
			<IdentifierEditor
				identifierTypesForDisplay={identifierTypesForDisplay}
				// eslint-disable-next-line react/no-array-index-key
				identifierValue={identifierValue}
				index={index}
				key={index}
				setVisibility={setEditorVisibility}
				show={showEditor}
				typeOptions={typeOptions}
				typeValue={typeValue}
				valueValue={valueValue}
				onTypeChange={onTypeChange}
				onValueChange={onValueChange}
			/>
			<Row>
				<Col lg={lgCol}>
		        <strong>{identifierValue[0].label} : {valueValue}</strong>
				</Col>
		    <Col className="d-flex justify-content-end" lg={1}>
					<FontAwesomeIcon
						icon={faPencilAlt}
						onClick={handleEditButtonClick}
					/>
					<FontAwesomeIcon
						className="ml-4"
						icon={faTrash}
						onClick={onRemoveButtonClick}
					/>
		    </Col>
			</Row>
		</div>
	);
}
IdentifierRow.displayName = 'IdentifierRow';


function handleValueChange(
	dispatch: Dispatch<Action>,
	event: React.ChangeEvent<HTMLInputElement>,
	index: number,
	types: Array<IdentifierType>
) {
	let {value} = event.target;
	value = collapseWhiteSpaces(value);
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
	return dispatch(debouncedUpdateIdentifierValue(index, value, guessedType));
}

function mapStateToProps(rootState, {index}: OwnProps): StateProps {
	const state = rootState.get('identifierSection');
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
