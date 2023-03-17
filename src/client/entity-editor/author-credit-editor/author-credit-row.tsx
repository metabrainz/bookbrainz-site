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

import {
	Action,
	removeAuthorCreditRow,
	updateCreditAuthorValue,
	updateCreditDisplayValue,
	updateCreditJoinPhraseValue
} from './actions';
import {Button, Col, Form, Row} from 'react-bootstrap';
import type {Dispatch} from 'redux';
import EntitySearchFieldOption from '../common/entity-search-field-option';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Immutable from 'immutable';
import React from 'react';
import SearchEntityCreate from '../../unified-form/common/search-entity-create-select';
import ValidationLabel from '../common/validation-label';
import {clearAuthor} from '../../unified-form/cover-tab/action';
import {connect} from 'react-redux';
import {faTimes} from '@fortawesome/free-solid-svg-icons';


type OwnProps = {
	index: string,
	isUnifiedForm?: boolean
};

type StateProps = {
	author: Immutable.Map<string, any>,
	joinPhrase: string,
	name: string
};

type DispatchProps = {
	onAuthorChange: (Author) => unknown,
	onClearHandler:(arg) => unknown,
	onJoinPhraseChange: (string) => unknown,
	onNameChange: (string) => unknown,
	onRemoveButtonClick: () => unknown
};

type Props = StateProps & DispatchProps & OwnProps;

/**
 * Container component. The IdentifierRow component renders a single Row
 * containing several input fields, allowing the user to set the value and type
 * for an identifier in the IdentifierEditor. A button is also included to
 * remove the identifier from the editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.index - The index of the row in the parent editor (i.e. 'n0')
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
	isUnifiedForm,
	onAuthorChange,
	onJoinPhraseChange,
	onClearHandler,
	onNameChange,
	onRemoveButtonClick,
	...rest
}: Props) {
	const SelectWrapper = !isUnifiedForm ? EntitySearchFieldOption : SearchEntityCreate;
	const onChangeHandler = React.useCallback((value, action) => {
		if (['clear', 'pop-value', 'select-option'].includes(action?.action) && author?.get('__isNew__', false)) {
			onClearHandler(author.get('id'));
		}
		onAuthorChange(value);
	}, [author, onAuthorChange, onClearHandler]);
	const handleButtonClick = React.useCallback(() => {
		if (author?.get('__isNew__', false)) {
			onClearHandler(author.get('id'));
		}
		onRemoveButtonClick();
	}, [author, index, onClearHandler, onRemoveButtonClick]);
	return (
		<div>
			<Row>
				<Col md={{span: 3}}>
					<SelectWrapper
						instanceId={`author${index}`}
						isUnifiedForm={isUnifiedForm}
						label="Author"
						rowId={index}
						validationState={!author ? 'error' : null}
						value={author}
						onChange={onChangeHandler}
						{...rest}
						type="author"
					/>
				</Col>
				<Col md={{span: 3}}>

					<Form.Group>
						<Form.Label>
							<ValidationLabel empty={name.length === 0} error={!name.length}>
								Author as credited

							</ValidationLabel>
						</Form.Label>
						<Form.Control type="text" value={name} onChange={onNameChange}/>

					</Form.Group>
				</Col>
				<Col md={{span: 3}}>
					<Form.Group>
						<Form.Label>Join Phrase</Form.Label>
						<Form.Control type="text" value={joinPhrase} onChange={onJoinPhraseChange}/>

					</Form.Group>
				</Col>
				<Col md={{span: 3}}>
					<Button
						block
						className="margin-top-d18"
						variant="danger"
						onClick={handleButtonClick}
					>
						<FontAwesomeIcon icon={faTimes}/>
						&nbsp;Remove
					</Button>
				</Col>
			</Row>
			<hr/>
		</div>
	);
}
AuthorCreditRow.displayName = 'AuthorCreditEditor.CreditRow';
AuthorCreditRow.defaultProps = {
	isUnifiedForm: false
};

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
		onClearHandler: (aid) => dispatch(clearAuthor(aid)),
		onJoinPhraseChange: (event: React.ChangeEvent<HTMLInputElement>) => dispatch(updateCreditJoinPhraseValue(index, event.target.value)),
		onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => dispatch(updateCreditDisplayValue(index, event.target.value)),
		onRemoveButtonClick: () => dispatch(removeAuthorCreditRow(index))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorCreditRow);
