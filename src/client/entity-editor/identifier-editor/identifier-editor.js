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

import {Button, Modal, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {hideIdentifierEditor, removeEmptyIdentifiers} from './actions';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import IdentifierModalBody from './identifier-modal-body';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';


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
	identifierTypes,
	onClose,
	show
}) => {
	const helpText = `identity of the entity in other databases and services, such as ISBN, barcode, MusicBrainz ID, WikiData ID, OpenLibrary ID, etc.
	You can enter either the identifier only (Q2517049) or a full link (https://www.wikidata.org/wiki/Q2517049).`;

	const helpIconElement = (
		<OverlayTrigger
			delay={50}
			overlay={<Tooltip id="identifier-editor-tooltip">{helpText}</Tooltip>}
			placement="right"
		>
			<FontAwesomeIcon
				className="fa-sm"
				icon={faQuestionCircle}
			/>
		</OverlayTrigger>
	);

	return (
		<Modal show={show} size="lg" onHide={onClose}>
			<Modal.Header>
				<Modal.Title>
					Identifier Editor {helpIconElement}
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<IdentifierModalBody identifierTypes={identifierTypes}/>
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
	onClose: PropTypes.func.isRequired,
	show: PropTypes.bool
};
IdentifierEditor.defaultProps = {
	show: false
};

function mapDispatchToProps(dispatch) {
	return {
		onClose: () => {
			dispatch(hideIdentifierEditor());
			dispatch(removeEmptyIdentifiers());
		}
	};
}

export default connect(null, mapDispatchToProps)(IdentifierEditor);
