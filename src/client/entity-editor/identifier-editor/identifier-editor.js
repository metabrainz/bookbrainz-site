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

import {Button, Col, Modal, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import {addIdentifierRow, hideIdentifierEditor, removeEmptyIdentifiers} from './actions';
import {faPlus, faQuestionCircle} from '@fortawesome/free-solid-svg-icons';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import IdentifierRow from './identifier-row';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';


/**
 * Container component. The IdentifierEditor component contains a number of
 * IdentifierRow elements, and renders these inside a modal, which appears when
 * the show property of the component is set.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.identifiers - The list of identifiers to be rendered in
 *        the editor.
 * @param {Array} props.identifierTypes - The list of possible types for an
 *        identifier.
 * @param {Function} props.onAddIdentifier - A function to be called when the
 *        button to add an identifier is clicked.
 * @param {Function} props.onClose - A function to be called when the button to
 *        close the editor is clicked.
 * @param {boolean} props.show - Whether or not the editor modal should be
 *        visible.
 * @returns {ReactElement} React element containing the rendered
 *          IdentifierEditor.
 */
const IdentifierEditor = ({
	identifiers,
	identifierTypes,
	onAddIdentifier,
	onClose,
	show
}) => {
	const noIdentifiersTextClass =
		classNames('text-center', {hidden: identifiers.size});

	const helpText = `identity of the entity in other databases and services, such as ISBN, barcode, MusicBrainz ID, WikiData ID, OpenLibrary ID, etc.
	You can enter either the identifier only (Q2517049) or a full link (https://www.wikidata.org/wiki/Q2517049).`;

	const helpIconElement = (
		<OverlayTrigger
			delayShow={50}
			overlay={<Tooltip id="identifier-editor-tooltip">{helpText}</Tooltip>}
		>
			<FontAwesomeIcon
				className="fa-sm"
				icon={faQuestionCircle}
			/>
		</OverlayTrigger>
	);

	return (
		<Modal bsSize="large" show={show} onHide={onClose}>
			<Modal.Header>
				<Modal.Title>
					Identifier Editor {helpIconElement}
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<div className={noIdentifiersTextClass}>
					<p className="text-muted">This entity has no identifiers</p>
				</div>
				<div>
					{
						identifiers.map((identifier, rowId) => (
							<IdentifierRow
								index={rowId}
								// eslint-disable-next-line react/no-array-index-key
								key={rowId}
								typeOptions={identifierTypes}
							/>
						)).toArray()
					}
				</div>
				<Row>
					<Col className="text-right" md={3} mdOffset={9}>
						<Button variant="success" onClick={onAddIdentifier}>
							<FontAwesomeIcon icon={faPlus}/>
							<span>&nbsp;Add identifier</span>
						</Button>
					</Col>
				</Row>
			</Modal.Body>

			<Modal.Footer>
				<Button variant="primary" onClick={onClose}>Close</Button>
			</Modal.Footer>
		</Modal>
	);
};
IdentifierEditor.displayName = 'IdentifierEditor';
IdentifierEditor.propTypes = {
	identifierTypes: PropTypes.array.isRequired,
	identifiers: PropTypes.object.isRequired,
	onAddIdentifier: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	show: PropTypes.bool
};
IdentifierEditor.defaultProps = {
	show: false
};

function mapStateToProps(state) {
	return {
		identifiers: state.get('identifierEditor')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onAddIdentifier: () => dispatch(addIdentifierRow()),
		onClose: () => {
			dispatch(hideIdentifierEditor());
			dispatch(removeEmptyIdentifiers());
		}
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(IdentifierEditor);
