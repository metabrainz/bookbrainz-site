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
	showAuthorCreditEditor
} from './actions';
import {Button, Col, Row} from 'react-bootstrap';
import {map as _map, values as _values} from 'lodash';

import AuthorCreditEditor from './author-credit-editor';
import CustomInput from '../../input';
import type {Dispatch} from 'redux'; // eslint-disable-line import/named
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import ValidationLabel from '../common/validation-label';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';
import {faPencilAlt} from '@fortawesome/free-solid-svg-icons';
import {validateAuthorCreditSection} from '../validators/common';


type OwnProps = {
};

type StateProps = {
	authorCreditEditor: Record<string, AuthorCreditRow>,
	showEditor: boolean,
};

type DispatchProps = {
	onEditAuthorCredit: (rowCount: number) => unknown,
	onEditorClose: () => unknown,
};

type Props = OwnProps & StateProps & DispatchProps;

function AuthorCreditSection({
	authorCreditEditor, onEditAuthorCredit, onEditorClose, showEditor
}: Props) {
	let editor;
	if (showEditor) {
		editor = (
			<AuthorCreditEditor
				showEditor
				onClose={onEditorClose}
			/>
		);
	}
	const authorCreditPreview = _map(authorCreditEditor, (credit) => `${credit.name}${credit.joinPhrase}`).join('');
	const authorCreditRows = _values(authorCreditEditor);
	const noAuthorCredit = authorCreditRows.length <= 0;

	const isValid = !noAuthorCredit && validateAuthorCreditSection(authorCreditRows);

	const editButton = (
		// eslint-disable-next-line react/jsx-no-bind
		<Button bsStyle="success" onClick={function openEditor() { onEditAuthorCredit(authorCreditRows.length); }}>
			<FontAwesomeIcon icon={faPencilAlt}/>
			&nbsp;Edit
		</Button>);

	const label = (
		<ValidationLabel error={!isValid}>
			Author Credit
		</ValidationLabel>
	);

	return (
		<Row className="margin-bottom-2">
			{editor}
			<Col md={6} mdOffset={3}>
				<CustomInput
					buttonAfter={editButton}
					label={label}
					placeholder="No Author Credit yet, click edit to add one"
					tooltipText="Name(s) of the Author(s) as they appear on the book cover"
					validationState={!isValid ? 'error' : 'success'}
					value={authorCreditPreview}
				/>
			</Col>
		</Row>
	);
}

AuthorCreditSection.propTypes = {
	authorCreditEditor: PropTypes.object.isRequired,
	showEditor: PropTypes.bool.isRequired
};

function mapStateToProps(rootState): StateProps {
	return {
		authorCreditEditor: convertMapToObject(rootState.get('authorCreditEditor')),
		showEditor: rootState.getIn(['editionSection', 'authorCreditEditorVisible'])
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
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

export default connect(mapStateToProps, mapDispatchToProps)(
	AuthorCreditSection
);
