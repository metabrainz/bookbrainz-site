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
import React, {useCallback, useState} from 'react';
import type {EditorSearchResult} from '../../../../common/types/search';
import PrivilegeBadges from './privilege-badges';
import PrivsEditModal from './privs-edit-modal';
import type {SiteUser} from '../../../../common/types/site';
import {getPrivilegeShieldIcon} from '../../../../common/helpers/privileges-utils';


const {Button, Table} = bootstrap;

type Props = {
	results?: Array<EditorSearchResult | null>,
	updateResultsOnPrivsChange: () => void,
	user: SiteUser
};

export default function AdminPanelSearchResults({results = [], updateResultsOnPrivsChange, user}: Props) {
	const [selectedUser, setSelectedUser] = useState<EditorSearchResult>();
	const [showModal, setShowModal] = useState(false);

	const closeModal = useCallback(() => {
		setShowModal(false);
	}, []);

	if (results.length === 0) {
		return null;
	}

	const rows = results.map((result) => {
		if (!result) {
			return null;
		}
		const name = result.name ?? result.defaultAlias?.name;
		const link = name ? `/user/${name}` : `/editor/${result.id}`;

		return (
			<tr key={result.id}>
				<td>
					<a href={link}>
						<img alt="" className="margin-right-0-3" height="15" src={getPrivilegeShieldIcon(result.privs)}/>
						{name ?? '(unnamed)'}
					</a>
				</td>
				<td>
					<PrivilegeBadges privs={result.privs}/>
				</td>
				<td>
					<Button
						size="sm"
						variant="outline-info"
						// eslint-disable-next-line react/jsx-no-bind
						onClick={() => {
							setSelectedUser(result);
							setShowModal(true);
						}}
					>
						Edit
					</Button>
				</td>
			</tr>
		);
	});

	return (
		<div>
			{showModal && (
				<div>
					<PrivsEditModal
						adminId={user.id}
						handleCloseModal={closeModal}
						show={showModal}
						targetUser={selectedUser}
						updateResultsOnPrivsChange={updateResultsOnPrivsChange}
					/>
				</div>
			)}
			<h3 className="search-results-heading">
				Search Results
			</h3>
			<hr className="thin"/>
			<Table
				responsive
				className="table table-striped"
			>
				<thead>
					<tr>
						<th style={{width: '42%'}}>Name</th>
						<th style={{width: '42%'}}>Privileges</th>
						<th style={{width: '16%'}}/>
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
			</Table>
		</div>
	);
}
