/*
 * Copyright (C) 2020  Sean Burke
 *               2020  Nicolas Pelletier
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

import {Button, Modal} from 'react-bootstrap';
import {keys as _keys, map as _map} from 'lodash';

import AuthorCreditRow from './author-credit-row';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {addAuthorCreditRow} from './actions';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';

/**
 * Container component. The AuthorCreditEditor component contains a number of
 * AuthorCreditRow elements, and renders these inside a modal, which appears when
 * the show property of the component is set.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.authorCredit - The Author credit object containing rows
 *        to be rendered in the editor.
 * @param {Function} props.onAddAuthorCreditRow - A function to be called when the
 *        button to add an Author is clicked.
 * @param {Function} props.onClose - A function to be called when the
 *        modal is closed by a button click or clicking outside the modal.
 * @param {boolean} props.showEditor - A boolean indicating whether to show the modal or not.
 * @returns {ReactElement} React element containing the rendered
 *          AuthorCreditEditor modal.
 */
const AuthorCreditEditor = ({
	authorCredit,
	onAddAuthorCreditRow,
	onClose,
	showEditor
}) => (
	<Modal bsSize="large" show={showEditor} onHide={onClose} >
		<Modal.Header>
			<Modal.Title>Edit Author credit</Modal.Title>
		</Modal.Header>
		<Modal.Body>
			<p>
				Author credits indicate who is the main credited Author (or Authors) for Editions,
				and how they are credited. They consist of Authors, with (optionally) their names
				as credited in the specific Edition (i.e. on the cover), and join phrases between them.
				Keep in mind that join phrases should include spaces if you want any to appear in final credit.
			</p>
			<hr/>
			<dl>
				<dt>Preview of the Author credit:</dt>
				<dd>{
					_map(authorCredit, (credit) => (
						<span key={`author-credit-${credit.authorCreditID}-${credit.position}`}>
							<a href={`/author/${credit.authorBBID}`}>
								{credit.name}
							</a>
							{credit.joinPhrase}
						</span>
					))
				}
				</dd>
			</dl>
			<hr className="thin"/>
			<div>
				{
					_keys(authorCredit).map(rowId => (
						<AuthorCreditRow
							index={rowId}
							// eslint-disable-next-line react/no-array-index-key
							key={rowId}
						/>
					))
				}
			</div>
		</Modal.Body>
		<Modal.Footer>
			<Button bsStyle="success" onClick={onAddAuthorCreditRow}>
				<FontAwesomeIcon icon="plus"/>
				&nbsp;Add another author
			</Button>
			<Button bsStyle="warning" onClick={onClose}>Close</Button>
		</Modal.Footer>
	</Modal>
);

AuthorCreditEditor.displayName = 'AuthorCreditEditor';
AuthorCreditEditor.propTypes = {
	authorCredit: PropTypes.object.isRequired,
	onAddAuthorCreditRow: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	showEditor: PropTypes.bool
};
AuthorCreditEditor.defaultProps = {
	showEditor: false
};

function mapStateToProps(state) {
	return {
		authorCredit: convertMapToObject(state.get('authorCreditEditor'))
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onAddAuthorCreditRow: () => dispatch(addAuthorCreditRow())
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorCreditEditor);
