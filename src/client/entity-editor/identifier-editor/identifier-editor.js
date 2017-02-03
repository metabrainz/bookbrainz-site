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

import {Button, Col, Modal, Row} from 'react-bootstrap';
import {addIdentifierRow, hideIdentifierEditor} from './actions';
import IdentifierRow from './identifier-row';
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
 * @param {Array} props.typeOptions - The list of possible types for an
 *        identifier.
 * @param {Function} props.onAddIdentifier - A function to be called when the
 *        button to add an identifier is clicked.
 * @param {Function} props.onClose - A function to be called when the button to
 *        close the editor is clicked.
 * @param {boolean} props.show - Whether or not the editor modal should be
 *        visible.
 * @returns {ReactElement} React element containing the rendered
 *          IdentifierEditor.
 **/
const IdentifierEditor = ({
	identifiers,
	typeOptions,
	onAddIdentifier,
	onClose,
	show
}) => {
	const noIdentifiersTextClass =
		classNames('text-center', {hidden: identifiers.size});
	return (
		<Modal bsSize="large" show={show} onHide={onClose}>
			<Modal.Header>
				<Modal.Title>
					Identifier Editor
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<div className={noIdentifiersTextClass}>
					<p className="text-muted">This entity has no identifiers</p>
				</div>
				<div>
					{
						identifiers.map((identifier, rowId) =>
							<IdentifierRow
								index={rowId}
								key={rowId}
								typeOptions={typeOptions}
							/>
						).toArray()
					}
				</div>
				<Row>
					<Col className="text-right" md={3} mdOffset={9}>
						<Button bsStyle="success" onClick={onAddIdentifier}>
							Add identifier
						</Button>
					</Col>
				</Row>
			</Modal.Body>

			<Modal.Footer>
				<Button bsStyle="primary" onClick={onClose}>Close</Button>
			</Modal.Footer>
		</Modal>
	);
};
IdentifierEditor.displayName = 'IdentifierEditor';
IdentifierEditor.propTypes = {
	identifiers: React.PropTypes.object,
	onAddIdentifier: React.PropTypes.func,
	onClose: React.PropTypes.func,
	show: React.PropTypes.bool,
	typeOptions: React.PropTypes.array
};

function mapStateToProps(state) {
	return {
		identifiers: state.get('identifierEditor')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onAddIdentifier: () => dispatch(addIdentifierRow()),
		onClose: () => dispatch(hideIdentifierEditor())
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(IdentifierEditor);
