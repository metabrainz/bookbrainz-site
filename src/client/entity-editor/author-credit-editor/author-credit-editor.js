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

import {Button, Col, Row} from 'react-bootstrap';
import AuthorCreditRow from './author-credit-row';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {addAuthorCreditRow} from './actions';
import {connect} from 'react-redux';


/**
 * Container component. The IdentifierEditor component contains a number of
 * IdentifierRow elements, and renders these inside a modal, which appears when
 * the show property of the component is set.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.authorCredit - The list of identifiers to be rendered in
 *        the editor.
 * @param {Function} props.onAddAuthorCreditRow - A function to be called when the
 *        button to add an identifier is clicked.
 * @returns {ReactElement} React element containing the rendered
 *          IdentifierEditor.
 */
const AuthorCreditEditor = ({
	authorCredit,
	onAddAuthorCreditRow
}) => (
	<span>
		<div>
			{
				authorCredit.map((credit, rowId) => (
					<AuthorCreditRow
						index={rowId}
						// eslint-disable-next-line react/no-array-index-key
						key={rowId}
					/>
				)).toArray()
			}
		</div>
		<Row>
			<Col className="text-right" md={3} mdOffset={9}>
				<Button bsStyle="success" onClick={onAddAuthorCreditRow}>
					<FontAwesomeIcon icon="plus"/>
					<span>&nbsp;Add author</span>
				</Button>
			</Col>
		</Row>
	</span>
);

AuthorCreditEditor.displayName = 'AuthorCreditEditor';
AuthorCreditEditor.propTypes = {
	authorCredit: PropTypes.object.isRequired,
	onAddAuthorCreditRow: PropTypes.func.isRequired
};

function mapStateToProps(state) {
	return {
		authorCredit: state.get('authorCreditEditor')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onAddAuthorCreditRow: () => dispatch(addAuthorCreditRow())
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorCreditEditor);
