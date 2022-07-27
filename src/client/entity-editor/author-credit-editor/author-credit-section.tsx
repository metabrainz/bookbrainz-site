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

import {
	Action,
	AuthorCreditRow,
	addAuthorCreditRow,
	hideAuthorCreditEditor,
	removeEmptyCreditRows,
	showAuthorCreditEditor,
	updateCreditAuthorValue
} from './actions';
import {Button, Col, Form, InputGroup, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';

import {SingleValueProps, components} from 'react-select';
import {get as _get, map as _map, values as _values} from 'lodash';

import {faPencilAlt, faQuestionCircle} from '@fortawesome/free-solid-svg-icons';
import AuthorCreditEditor from './author-credit-editor';
import type {Dispatch} from 'redux'; // eslint-disable-line import/named
import EntitySearchFieldOption from '../common/entity-search-field-option';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import SearchEntityCreate from '../../unified-form/common/search-entity-create-select';
import ValidationLabel from '../common/validation-label';
import {clearAuthor} from '../../unified-form/cover-tab/action';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';
import {validateAuthorCreditSection} from '../validators/common';


type OwnProps = {
	isUf?: boolean,
	isLeftAlign?: boolean;

};

type StateProps = {
	authorCreditEditor: Record<string, AuthorCreditRow>,
	showEditor: boolean,
	isEditable:boolean,
};

type DispatchProps = {
	onAuthorChange: (Author) => unknown,
	onClearHandler:(arg) => unknown,
	onEditAuthorCredit: (rowCount: number) => unknown,
	onEditorClose: () => unknown,
};

type Props = OwnProps & StateProps & DispatchProps;

function AuthorCreditSection({
	authorCreditEditor: immutableAuthorCreditEditor, onEditAuthorCredit, onEditorClose,
	showEditor, onAuthorChange, isEditable, onClearHandler, isUf, isLeftAlign, ...rest
}: Props) {
	const authorCreditEditor = convertMapToObject(immutableAuthorCreditEditor);
	let editor;
	if (showEditor) {
		editor = (
			<AuthorCreditEditor
				showEditor
				isUf={isUf}
				onClose={onEditorClose}
				{...rest}
			/>
		);
	}
	const authorCreditPreview = _map(authorCreditEditor, (credit) => `${credit.name}${credit.joinPhrase}`).join('');
	const authorCreditRows = _values(authorCreditEditor);

	const isValid = validateAuthorCreditSection(authorCreditRows, isUf);

	const editButton = (
		// eslint-disable-next-line react/jsx-no-bind
		<Button variant="success" onClick={function openEditor() { onEditAuthorCredit(authorCreditRows.length); }}>
			<FontAwesomeIcon icon={faPencilAlt}/>
			&nbsp;Edit
		</Button>);

	const label = (
		<ValidationLabel empty={authorCreditPreview.length === 0} error={!isValid}>
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
		<Tooltip>
			Name(s) of the Author(s) as they appear on the book cover
		</Tooltip>
	);
	let resCol:any = {md: {offset: 3, span: 6}};
	if (isUf || isLeftAlign) {
		resCol = {lg: {offset: 0, span: 6}};
	}
	const onChangeHandler = React.useCallback((value, action) => {
		const authorId = _get(authorCreditEditor, 'n0.author.id', null);
		if (action && ['clear', 'pop-value', 'select-option'].includes(action.action) && authorId) {
			onClearHandler(authorId);
		}
		onAuthorChange(value);
	}, [authorCreditEditor]);
	const SelectWrapper = !isUf ? EntitySearchFieldOption : SearchEntityCreate;
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
								isUf={isUf}
								placeholder="Type to search or paste a BBID"
								rowId="n0"
								type="author"
								value={optionValue}
								onChange={onChangeHandler}
								{...rest}
							/>
						</div>
						<InputGroup.Append>{editButton}</InputGroup.Append>

					</InputGroup>
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
	isUf: false
};
function mapStateToProps(rootState): StateProps {
	const firstRowKey = rootState.get('authorCreditEditor').keySeq().first();
	const authorCreditRow = rootState.getIn(['authorCreditEditor', firstRowKey]);
	const isEditable = !(rootState.get('authorCreditEditor').size > 1) &&
	 authorCreditRow.get('name') === authorCreditRow.getIn(['author', 'text'], '');
	return {
		authorCreditEditor: rootState.get('authorCreditEditor'),
		isEditable,
		showEditor: rootState.getIn(['editionSection', 'authorCreditEditorVisible'])
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
		}
	};
}

export default connect<StateProps, DispatchProps>(mapStateToProps, mapDispatchToProps)(
	AuthorCreditSection
);
