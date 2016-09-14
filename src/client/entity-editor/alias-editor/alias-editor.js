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

import AliasRow from './alias-row';
import AddAliasButton from './add-alias-button';
import React from 'react';
import {connect} from 'react-redux';
import {hideAliasEditor} from '../actions';

const AliasEditor = ({
	languageOptions,
	onClose,
	show
}) => (
	<Modal bsSize="large" show={show} onHide={onClose}>
		<Modal.Header>
			<Modal.Title>
				Alias Editor
			</Modal.Title>
		</Modal.Header>

		<Modal.Body>
			<div className="text-center">
				<p className="text-muted">This entity has no aliases</p>
			</div>
			<AliasRow languageOptions={languageOptions}/>
			<Row>
				<Col className="text-right" md={3} mdOffset={9}>
					<AddAliasButton/>
				</Col>
			</Row>
		</Modal.Body>

		<Modal.Footer>
			<Button bsStyle="primary" onClick={onClose}>Close</Button>
		</Modal.Footer>
	</Modal>
);
AliasEditor.displayName = 'AliasEditor';
AliasEditor.propTypes = {
	languageOptions: React.PropTypes.array,
	show: React.PropTypes.bool,
	onClose: React.PropTypes.func
};

function mapDispatchToProps(dispatch) {
	return {
		onClose: () => dispatch(hideAliasEditor())
	};
}

export default connect(null, mapDispatchToProps)(AliasEditor);
