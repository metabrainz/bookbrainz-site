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
import AuthorCreditDisplay from '../../components/author-credit-display';

import AuthorCreditRow from './author-credit-row';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {keys as _keys} from 'lodash';
import {addAuthorCreditRow} from './actions';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from 'react-i18next';

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
	showEditor,
	...rest
}) => {
	// eslint-disable-next-line id-length
	const {t: translate} = useTranslation(['entityEditor', 'common']);

	return (
		<Modal show={showEditor} size="lg" onHide={onClose} >
			<Modal.Header>
				<Modal.Title>{translate('shared.authorCreditLabel')}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>
					{translate('authorCreditEditor.introText')}
				</p>
				<hr/>
				<dl>
					<dt>{translate('authorCreditEditor.previewText')}</dt>
					<dd>
						<AuthorCreditDisplay names={authorCredit}/>
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
								{...rest}
							/>
						))
					}
				</div>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="success" onClick={onAddAuthorCreditRow}>
					<FontAwesomeIcon icon={faPlus}/>
					&nbsp;{translate('authorCreditEditor.addAuthor')}
				</Button>
				<Button variant="warning" onClick={onClose}>{translate('common:button.close')}</Button>
			</Modal.Footer>
		</Modal>
	);
};

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
