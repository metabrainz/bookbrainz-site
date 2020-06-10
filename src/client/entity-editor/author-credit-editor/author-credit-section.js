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

// @flow

import {
	type Action,
	hideAuthorCreditEditor,
	removeEmptyCreditRows,
	showAuthorCreditEditor
} from './actions';
import {Button, Col, Row} from 'react-bootstrap';
import {keys as _keys, map as _map} from 'lodash';

import AuthorCreditEditor from './author-credit-editor';
import CustomInput from '../../input';
import type {Dispatch} from 'redux'; // eslint-disable-line import/named
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';


type OwnProps = {
};

type StateProps = {
	authorCredit: Object,
	showEditor: boolean,
};

type DispatchProps = {
	onEditAuthorCredit: () => mixed,
	onEditorClose: () => mixed,
};

type Props = OwnProps & StateProps & DispatchProps;

function AuthorCreditSection({
	authorCredit, onEditAuthorCredit, onEditorClose, showEditor
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
	const authorCreditPreview = _map(authorCredit, (credit) => `${credit.name}${credit.joinPhrase}`).join('');
	const noAuthorCredit = _keys(authorCredit).length <= 0;

	const editButton = (
		<Button bsStyle="success" onClick={onEditAuthorCredit}>
			<FontAwesomeIcon icon="pencil-alt"/>
			&nbsp;Edit Author Credit
		</Button>);

	return (
		<Row className="margin-bottom-2">
			{editor}
			<Col md={6} mdOffset={3}>
				<CustomInput
					readOnly
					buttonAfter={editButton}
					label="Author Credit"
					placeholder="No Author Credit yet, click edit to add one"
					tooltipText="Names of the Authors as they appear on the book cover"
					validationState={noAuthorCredit ? 'error' : null}
					value={authorCreditPreview}
				/>
			</Col>
		</Row>
	);
}

AuthorCreditSection.displayName = 'AuthorCreditSection';
AuthorCreditSection.propTypes = {
	authorCredit: PropTypes.object.isRequired,
	showEditor: PropTypes.bool.isRequired
};

function mapStateToProps(rootState): StateProps {
	return {
		authorCredit: convertMapToObject(rootState.get('authorCreditEditor')),
		showEditor: rootState.getIn(['editionSection', 'authorCreditEditorVisible'])
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onEditAuthorCredit: () => dispatch(showAuthorCreditEditor()),
		onEditorClose: () => {
			dispatch(removeEmptyCreditRows());
			dispatch(hideAuthorCreditEditor());
		}
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(
	AuthorCreditSection
);
