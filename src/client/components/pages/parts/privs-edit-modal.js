/*
 * Copyright (C) 2023 Shivam Awasthi
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

import * as bootstrap from 'react-bootstrap';
import {PrivilegeTypeBits, getPrivilegeShieldIcon, getPrivilegeTitleFromBit} from '../../../../common/helpers/privileges-utils';
import {faPencilAlt, faTimes} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PrivilegeBadges from './privilege-badges';
import PropTypes from 'prop-types';
import React from 'react';

const {Button, Form, Modal} = bootstrap;

class PrivsEditModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			privs: props.targetUser.privs ? props.targetUser.privs : null,
			submittable: false
		};

		this.handleBitChange = this.handleBitChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	async handleSubmit() {
		const {privs} = this.state;
		const oldPrivs = this.props.targetUser.privs;
		if (privs === oldPrivs) {
			return;
		}

		const data = {
			adminId: this.props.adminId,
			newPrivs: privs,
			oldPrivs,
			targetUserId: this.props.targetUser.id
		};

		try {
			const response = await fetch('/editor/privs/edit/handler', {
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json; charset=utf-8'
				},
				method: 'POST'
			});
			if (!response.ok) {
				const {error} = await response.json();
				throw new Error(error ?? response.statusText);
			}
			window.location.reload();
		}
		catch (err) {
			throw new Error(err);
		}
	}

	/* eslint-disable no-bitwise */
	handleBitChange(bit) {
		const newPrivs = this.state.privs ^ (1 << bit);
		if (this.props.targetUser.privs !== newPrivs) {
			this.setState({
				privs: newPrivs,
				submittable: true
			});
		}
		else {
			this.setState({
				privs: newPrivs,
				submittable: false
			});
		}
	}

	/* eslint-disable react/jsx-no-bind */
	render() {
		const link = `/editor/${this.props.targetUser.bbid}`;

		const switches = Object.values(PrivilegeTypeBits).map(bit => (
			<Form.Check
				checked={this.state.privs & (1 << bit)}
				id={`bit${bit}`}
				key={bit}
				label={getPrivilegeTitleFromBit(bit)}
				type="switch"
				onChange={() => this.handleBitChange(bit)}
			/>
		));

		return (
			<Modal
				scrollable
				show={this.props.show}
				onHide={this.props.handleCloseModal}
			>
				<Modal.Header closeButton>
					<Modal.Title>
						<img height="20" src={getPrivilegeShieldIcon(this.state.privs)}/> {' '}
						<a href={link}>
							{this.props.targetUser.defaultAlias.name}
						</a>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<PrivilegeBadges privs={this.state.privs}/>
					<hr/>
					<Form>
						{switches}
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button disabled={!this.state.submittable} variant="success" onClick={this.handleSubmit}>
						<FontAwesomeIcon icon={faPencilAlt}/> Save Privileges
					</Button>
					<Button variant="danger" onClick={this.props.handleCloseModal}>
						<FontAwesomeIcon icon={faTimes}/> Close
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}


PrivsEditModal.displayName = 'PrivsEditModal';
PrivsEditModal.propTypes = {
	adminId: PropTypes.number.isRequired,
	handleCloseModal: PropTypes.func.isRequired,
	show: PropTypes.bool.isRequired,
	targetUser: PropTypes.object.isRequired
};

export default PrivsEditModal;
