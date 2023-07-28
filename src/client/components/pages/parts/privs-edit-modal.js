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

import {Button, Form, Modal} from 'react-bootstrap';
import {PrivilegeTypes, getPrivilegeShieldIcon, getPrivilegeTitleFromBit} from '../../../../common/helpers/privileges-utils';
import {faPencilAlt, faTimes} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PrivilegeBadges from './privilege-badges';
import PropTypes from 'prop-types';
import React from 'react';


class PrivsEditModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			note: '',
			privs: props.targetUser.privs,
			submittable: false
		};

		this.handleBitChange = this.handleBitChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleNoteChange = this.handleNoteChange.bind(this);
	}

	async handleSubmit() {
		const {privs, note} = this.state;
		const oldPrivs = this.props.targetUser.privs;
		if (privs === oldPrivs) {
			return;
		}

		const data = {
			adminId: this.props.adminId,
			newPrivs: privs,
			note,
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
				if (response.status === 403) {
					throw new Error(response.statusText);
				}
				const {error} = await response.json();
				throw new Error(error ?? response.statusText);
			}
			this.props.updateResultsOnPrivsChange();
			this.props.handleCloseModal();
		}
		catch (err) {
			throw new Error(err);
		}
	}

	/* eslint-disable no-bitwise */
	handleBitChange(bit) {
		const newPrivs = this.state.privs ^ (1 << bit);
		if (this.props.targetUser.privs !== newPrivs) {
			// If we have also added a note, then set submittable also true
			this.setState(prevState => ({
				privs: newPrivs,
				submittable: Boolean(prevState.note.length)
			}));
		}
		else {
			this.setState({
				privs: newPrivs,
				submittable: false
			});
		}
	}

	handleNoteChange(event) {
		const newPrivs = this.state.privs;
		if (event.target.value.length) {
			// If the privs have also been changed, then set submittable to true
			this.setState({
				note: event.target.value,
				submittable: Boolean(this.props.targetUser.privs !== newPrivs)
			});
		}
		else {
			this.setState({
				note: event.target.value,
				submittable: false
			});
		}
	}

	/* eslint-disable react/jsx-no-bind */
	render() {
		const switches = Object.values(PrivilegeTypes).map(priv => (
			<Form.Check
				checked={this.state.privs & priv.value}
				id={`bit${priv.bit}`}
				key={priv.bit}
				label={getPrivilegeTitleFromBit(priv.bit)}
				type="switch"
				onChange={() => this.handleBitChange(priv.bit)}
			/>
		));

		const noteField = (
			<Form.Group>
				<Form.Label>
					Note/Reason:
				</Form.Label>
				<Form.Control
					required
					as="textarea"
					rows="2"
					value={this.state.note}
					onChange={this.handleNoteChange}
				/>
			</Form.Group>
		);

		return (
			<Modal
				scrollable
				show={this.props.show}
				onHide={this.props.handleCloseModal}
			>
				<Modal.Header closeButton>
					<Modal.Title>
						<img className="margin-right-0-3" height="20" src={getPrivilegeShieldIcon(this.state.privs)}/>
						{this.props.targetUser.defaultAlias.name}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<PrivilegeBadges privs={this.state.privs}/>
					<hr/>
					<Form>
						{switches}
						<hr/>
						{noteField}
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
	targetUser: PropTypes.object.isRequired,
	updateResultsOnPrivsChange: PropTypes.func.isRequired
};

export default PrivsEditModal;
