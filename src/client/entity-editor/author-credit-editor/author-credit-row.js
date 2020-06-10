/*
 * Copyright (C) 2020  Sean Burke
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

// @flow

import {
	type Action,
	type Author,
	removeAuthorCreditRow,
	updateCreditAuthorValue,
	updateCreditDisplayValue,
	updateCreditJoinPhraseValue
} from './actions';
import {Button, Col, Row} from 'react-bootstrap';

import CustomInput from '../../input';
import EntitySearchFieldOption from '../common/entity-search-field-option';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from 'react';
import {connect} from 'react-redux';


type OwnProps = {
	index: number,
};

type StateProps = {
	author: Author,
	joinPhrase: string,
	name: string
};

type DispatchProps = {
	onAuthorChange: (Author) => mixed,
	onJoinPhraseChange: (string) => mixed,
	onNameChange: (string) => mixed,
	onRemoveButtonClick: () => mixed
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
 * @param {string} props.author - The ID of the type currently selected.
 * @param {string} props.joinPhrase - The ID of the type currently selected.
 * @param {string} props.name - The value currently set for this
 *        identifier.
 * @param {Function} props.onAuthorChange - A function to be called when a new
 *        identifier type is selected.
 * @param {Function} props.onJoinPhraseChange - A function to be called when the
 *        value for the identifier is changed.
 * @param {Function} props.onNameChange - A function to be called when the
 *        value for the identifier is changed.
 * @param {Function} props.onRemoveButtonClick - A function to be called when
 *        the button to remove the identifier is clicked.
 * @returns {ReactElement} React element containing the rendered IdentifierRow.
 */
function AuthorCreditRow({
	index,
	author,
	joinPhrase,
	name,
	onAuthorChange,
	onJoinPhraseChange,
	onNameChange,
	onRemoveButtonClick
}: Props) {
	return (
		<div>
			<Row>
				<Col md={3}>
					<EntitySearchFieldOption
						instanceId={`author${index}`}
						label="Author"
						type="author"
						validationState={!author ? 'error' : null}
						value={author}
						onChange={onAuthorChange}
					/>
				</Col>
				<Col md={3}>
					<CustomInput
						id={`authorDisplayName${index}`}
						label="Author as credited"
						type="text"
						validationState={!name.length ? 'error' : null}
						value={name}
						onChange={onNameChange}
					/>
				</Col>
				<Col md={3}>
					<CustomInput
						id={`identifierType${index}`}
						label="Join phrase"
						type="text"
						value={joinPhrase}
						onChange={onJoinPhraseChange}
					/>
				</Col>
				<Col md={3}>
					<Button
						block
						bsStyle="danger"
						className="margin-top-d18"
						onClick={onRemoveButtonClick}
					>
						<FontAwesomeIcon icon="times"/>
						&nbsp;Remove
					</Button>
				</Col>
			</Row>
			<hr/>
		</div>
	);
}
AuthorCreditRow.displayName = 'AuthorCreditEditor.CreditRow';

function mapStateToProps(rootState, {index}: OwnProps): StateProps {
	const state = rootState.get('authorCreditEditor');
	return {
		author: state.getIn([index, 'author']),
		joinPhrase: state.getIn([index, 'joinPhrase']),
		name: state.getIn([index, 'name'])
	};
}

function mapDispatchToProps(
	dispatch: Dispatch<Action>,
	{index}: OwnProps
): DispatchProps {
	return {
		onAuthorChange: (value) => dispatch(updateCreditAuthorValue(index, value)),
		onJoinPhraseChange: (event: SyntheticInputEvent<>) => dispatch(updateCreditJoinPhraseValue(index, event.target.value)),
		onNameChange: (event: SyntheticInputEvent<>) => dispatch(updateCreditDisplayValue(index, event.target.value)),
		onRemoveButtonClick: () => dispatch(removeAuthorCreditRow(index))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorCreditRow);
