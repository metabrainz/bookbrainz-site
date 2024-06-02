/*
 * Copyright (C) 2020  Nicolas Pelletier
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

import {Action,
	AuthorCreditRow,
	addAuthorCreditRow,
	clearAuthorCredit,
	hideAuthorCreditEditor,
	removeEmptyCreditRows,
	resetAuthorCredit,
	showAuthorCreditEditor,
	toggleAuthorCredit,
	updateCreditAuthorValue} from './actions';
import {Button, Col, Form, FormLabel, InputGroup, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';

import {get as _get, map as _map, values as _values, camelCase} from 'lodash';

import {faInfoCircle, faPencilAlt, faQuestionCircle} from '@fortawesome/free-solid-svg-icons';

import AuthorCreditEditor from './author-credit-editor';
import type {Dispatch} from 'redux'; // eslint-disable-line import/named
import EntitySearchFieldOption from '../common/entity-search-field-option';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import SearchEntityCreate from '../../unified-form/common/search-entity-create-select';
import {SingleValueProps} from 'react-select/src/components/SingleValue';
import ValidationLabel from '../common/validation-label';
import {clearAuthor} from '../../unified-form/cover-tab/action';
import {components} from 'react-select';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';
import {validateAuthorCreditSection} from '../validators/common';


type OwnProps = {
	isUnifiedForm?: boolean,
	isLeftAlign?: boolean;

};

type StateProps = {
	authorCreditEditor: Record<string, AuthorCreditRow>,
	authorCreditEnable: boolean,
	showEditor: boolean,
	isEditable:boolean,
};

type DispatchProps = {
	onAuthorChange: (Author) => unknown,
	toggleAuthorCreditEnable: (newValue:boolean) => unknown,
	onClearHandler:(arg) => unknown,
	onEditAuthorCredit: (rowCount: number) => unknown,
	onEditorClose: () => unknown,
};

type Props = OwnProps & StateProps & DispatchProps;

function AuthorCreditSection({
	authorCreditEditor: immutableAuthorCreditEditor, onEditAuthorCredit, onEditorClose,
	showEditor, onAuthorChange, isEditable, authorCreditEnable, toggleAuthorCreditEnable,
	onClearHandler, isUnifiedForm, isLeftAlign, ...rest
}: Props) {
	const authorCreditEditor = convertMapToObject(immutableAuthorCreditEditor);
	let editor;
	if (showEditor) {
		editor = (
			<AuthorCreditEditor
				showEditor
				isUnifiedForm={isUnifiedForm}
				onClose={onEditorClose}
				{...rest}
			/>
		);
	}
	const authorCreditPreview = _map(authorCreditEditor, (credit) => `${credit.name}${credit.joinPhrase}`).join('');
	const authorCreditRows = _values(authorCreditEditor);

	const isValid = validateAuthorCreditSection(authorCreditRows, authorCreditEnable);

	const editButton = (
		// eslint-disable-next-line react/jsx-no-bind
		<Button disabled={!authorCreditEnable} variant="success" onClick={function openEditor() { onEditAuthorCredit(authorCreditRows.length); }}>
			<FontAwesomeIcon icon={faPencilAlt}/>
			&nbsp;Edit
		</Button>);

	const label = (
		<ValidationLabel empty={false} error={!isValid}>
			Author Credit
		</ValidationLabel>
	);
	const SingleValue = (props:SingleValueProps<any>) => (
		<components.SingleValue {...props}>
			<span>
				{props.data.label}
			</span>
		</components.SingleValue>
	);
	const optionValue = authorCreditPreview.length && {label: authorCreditPreview, value: authorCreditPreview};
	const tooltip = (
		<Tooltip id="AC-checkbox-tooltip">
			Name(s) of the Author(s) as they appear on the book cover
		</Tooltip>
	);
	const checkboxLabel = (
		<>
			<FormLabel className="font-weight-normal">
			This Edition doesn&apos;t have an Author
				<OverlayTrigger
					delay={50}
					overlay={
						<Tooltip id="ac-enabled">Select this checkbox if this Edition doesn&apos;t have an Author or
					if you don&apos;t know the Author(s)
						</Tooltip>}
				>
					<FontAwesomeIcon
						className="margin-left-0-5"
						icon={faInfoCircle}
					/>
				</OverlayTrigger>
			</FormLabel>
		</>

	);
	const onCheckChangeHandler = React.useCallback(() => {
		toggleAuthorCreditEnable(!authorCreditEnable);
	}, [authorCreditEnable]);
	let resCol:any = {md: {offset: 3, span: 6}};
	if (isUnifiedForm || isLeftAlign) {
		resCol = {lg: {offset: 0, span: 6}};
	}
	const onChangeHandler = React.useCallback((value, action) => {
		const authorId = _get(authorCreditEditor, 'n0.author.id', null);
		if (action && ['clear', 'pop-value', 'select-option'].includes(action.action) && authorId) {
			onClearHandler(authorId);
		}
		onAuthorChange(value);
	}, [authorCreditEditor]);
	const SelectWrapper = !isUnifiedForm ? EntitySearchFieldOption : SearchEntityCreate;
	return (
		<Row className="margin-bottom-2">
			{editor}
			<Col {...resCol}>
				<Form.Group>
					<Form.Label>
						{label}
						<OverlayTrigger delay={50} overlay={tooltip}>
							<FontAwesomeIcon
								className="margin-left-0-5"
								icon={faQuestionCircle}
							/>
						</OverlayTrigger>
					</Form.Label>
					<InputGroup>
						<div className="ac-select">
							<SelectWrapper
								customComponents={{DropdownIndicator: null, SingleValue}}
								instanceId="author0"
								isClearable={false}
								isDisabled={!isEditable}
								isUnifiedForm={isUnifiedForm}
								placeholder="Type to search or paste a BBID"
								rowId="n0"
								value={optionValue}
								onChange={onChangeHandler}
								{...rest}
								type="author"
							/>
						</div>
						<InputGroup.Append>{editButton}</InputGroup.Append>
					</InputGroup>
					<Form.Check
						checked={!authorCreditEnable}
						className="mt-2"
						// disabled={!immutableAuthorCreditEditor.size}
						id="ac-enabled-check"
						label={checkboxLabel}
						type="checkbox"
						onChange={onCheckChangeHandler}
					/>
				</Form.Group>
			</Col>
		</Row>
	);
}

AuthorCreditSection.propTypes = {
	authorCreditEditor: PropTypes.object.isRequired,
	isEditable: PropTypes.bool.isRequired,
	showEditor: PropTypes.bool.isRequired
};

AuthorCreditSection.defaultProps = {
	isLeftAlign: false,
	isUnifiedForm: false
};
function mapStateToProps(rootState, {type}): StateProps {
	const entitySection = `${camelCase(type)}Section`;
	const authorCreditEnable = rootState.getIn([entitySection, 'authorCreditEnable']) ?? true;
	const authorCreditState = rootState.get('authorCreditEditor');
	const showEditor = rootState.getIn([entitySection, 'authorCreditEditorVisible']);

	const authorCreditRow = authorCreditState.first();
	const isEditable = Boolean(authorCreditEnable) &&
	authorCreditState.size <= 1 &&
	Boolean(authorCreditRow) &&
	authorCreditRow.get('name') === authorCreditRow.getIn(['author', 'text'], '');

	return {
		authorCreditEditor: rootState.get('authorCreditEditor'),
		authorCreditEnable,
		isEditable,
		showEditor
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onAuthorChange: (value) => {
			dispatch(updateCreditAuthorValue(-1, value));
		},
		onClearHandler: (aid) => dispatch(clearAuthor(aid)),
		onEditAuthorCredit: (rowCount:number) => {
			dispatch(showAuthorCreditEditor());
			// Automatically add an empty row if editor is empty
			if (rowCount === 0) {
				dispatch(addAuthorCreditRow());
			}
		},
		onEditorClose: () => {
			dispatch(removeEmptyCreditRows());
			dispatch(hideAuthorCreditEditor());
		},
		toggleAuthorCreditEnable: (newValue) => {
			if (newValue) {
				dispatch(resetAuthorCredit());
			}
			else {
				dispatch(clearAuthorCredit());
			}
			dispatch(toggleAuthorCredit());
		}
	};
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(
	AuthorCreditSection
);
