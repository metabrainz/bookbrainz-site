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

import {Alert, Button, Form, Modal} from 'react-bootstrap';
import {PrivilegeTypes, getPrivilegeShieldIcon, getPrivilegeTitleFromBit} from '../../../../common/helpers/privileges-utils';
import React, {useCallback, useState} from 'react';
import {faPencilAlt, faTimes} from '@fortawesome/free-solid-svg-icons';
import type {EditorSearchResult} from '../../../../common/types/search';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PrivilegeBadges from './privilege-badges';
import {postJSON} from '../../../helpers/post-json';


type Props = {
	adminId: number,
	handleCloseModal: () => void,
	targetUser: EditorSearchResult,
	updateResultsOnPrivsChange: () => void
};

export default function PrivsEditModal({adminId, handleCloseModal, targetUser, updateResultsOnPrivsChange}: Props) {
	const [note, setNote] = useState('');
	const [privs, setPrivs] = useState(targetUser.privs);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	// The privileges are saved with a reason, once they have changed
	const submittable = privs !== targetUser.privs && note.length > 0 && !saving;

	const handleSubmit = useCallback(async () => {
		setSaving(true);
		setError(null);
		const result = await postJSON('/editor/privs/edit/handler', {
			adminId,
			newPrivs: privs,
			note,
			oldPrivs: targetUser.privs,
			targetUserId: targetUser.id
		});
		setSaving(false);
		if (result.ok) {
			updateResultsOnPrivsChange();
			handleCloseModal();
		}
		else {
			setError(result.error ?? 'The privileges could not be saved. Please try again.');
		}
	}, [adminId, handleCloseModal, note, privs, targetUser, updateResultsOnPrivsChange]);

	const handleNoteChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
		setNote(event.target.value);
	}, []);

	const switches = Object.values(PrivilegeTypes).map(priv => (
		<Form.Check
			// eslint-disable-next-line no-bitwise
			checked={Boolean(privs & priv.value)}
			id={`bit${priv.bit}`}
			key={priv.bit}
			label={getPrivilegeTitleFromBit(priv.bit)}
			type="switch"
			// eslint-disable-next-line no-bitwise, react/jsx-no-bind
			onChange={() => setPrivs((current) => current ^ (1 << priv.bit))}
		/>
	));

	return (
		<Modal
			scrollable
			show
			onHide={handleCloseModal}
		>
			<Modal.Header closeButton>
				<Modal.Title>
					<img alt="" className="margin-right-0-3" height="20" src={getPrivilegeShieldIcon(privs)}/>
					{targetUser.name ?? targetUser.defaultAlias?.name}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<PrivilegeBadges privs={privs}/>
				<hr/>
				<Form>
					{switches}
					<hr/>
					<Form.Group>
						<Form.Label>
							Note/Reason:
						</Form.Label>
						<Form.Control
							required
							as="textarea"
							rows={2}
							value={note}
							onChange={handleNoteChange}
						/>
					</Form.Group>
				</Form>
				{error && <Alert variant="danger">{error}</Alert>}
			</Modal.Body>
			<Modal.Footer>
				<Button disabled={!submittable} variant="success" onClick={handleSubmit}>
					<FontAwesomeIcon icon={faPencilAlt}/> Save Privileges
				</Button>
				<Button variant="danger" onClick={handleCloseModal}>
					<FontAwesomeIcon icon={faTimes}/> Close
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
