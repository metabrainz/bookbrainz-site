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
import PrivilegeBadges from './privilege-badges';
import PrivsEditModal from './privs-edit-modal';
import PropTypes from 'prop-types';
import React from 'react';
import {getPrivilegeShieldIcon} from '../../../../common/helpers/privileges-utils';


const {Button, Table} = bootstrap;

type AdminPanelSearchResultsState = {
	selectedUser?: Record<string, unknown>,
	showModal: boolean
};
type AdminPanelSearchResultsProps = {
	results?: any[],
	updateResultsOnPrivsChange: () => void,
	user: Record<string, unknown>
};


/**
 * Renders the document and displays the 'AdminPanelSearchResults' page.
 * @returns {ReactElement} a HTML document which displays the AdminPanelSearchResults.
 * @param {object} props - Properties passed to the component.
 */
class AdminPanelSearchResults extends React.Component<AdminPanelSearchResultsProps, AdminPanelSearchResultsState> {
	static displayName = 'AdminPanelSearchResults';

	static propTypes = {
		results: PropTypes.array,
		updateResultsOnPrivsChange: PropTypes.func.isRequired,
		user: PropTypes.object.isRequired
	};

	static defaultProps = {
		results: null
	};

	constructor(props) {
		super(props);

		this.state = {
			selectedUser: null,
			showModal: false
		};
		this.onCloseModal = this.onCloseModal.bind(this);
	}

	onCloseModal() {
		this.setState({showModal: false});
	}

	openPrivsEditModal(user) {
		this.setState({
			selectedUser: user,
			showModal: true
		});
	}

	render() {
		const noResults = !this.props.results || this.props.results.length === 0;
		const results = this.props.results.map((result) => {
			if (!result) {
				return null;
			}
			const name = result.defaultAlias ? result.defaultAlias.name :
				'(unnamed)';
			const link = `/editor/${result.bbid}`;

			/* eslint-disable react/jsx-no-bind */
			return (
				<tr key={result.bbid}>
					<td>
						<a href={link}>
							<img className="margin-right-0-3" height="15" src={getPrivilegeShieldIcon(result.privs)}/>
							{name}
						</a>
					</td>
					<td>
						<PrivilegeBadges privs={result.privs}/>
					</td>
					<td>
						<Button
							className="btn btn-sm"
							variant="outline-info"
							onClick={() => this.openPrivsEditModal(result)}
						>
							Edit
						</Button>
					</td>
				</tr>
			);
		});
		const tableCssClasses = 'table table-striped';
		if (noResults) {
			return null;
		}
		return (
			<div>
				{
					this.state.showModal &&
					(
						<div>
							<PrivsEditModal
								adminId={this.props.user.id}
								handleCloseModal={this.onCloseModal}
								show={this.state.showModal}
								targetUser={this.state.selectedUser}
								updateResultsOnPrivsChange={this.props.updateResultsOnPrivsChange}
							/>
						</div>
					)
				}
				<h3 className="search-results-heading">
					Search Results
				</h3>
				<hr className="thin"/>
				<Table
					responsive
					className={tableCssClasses}
				>
					<thead>
						<tr>
							<th width="42%">Name</th>
							<th width="42%">Privileges</th>
							<th width="16%"/>
						</tr>
					</thead>
					<tbody>
						{results}
					</tbody>
				</Table>
			</div>
		);
	}
}

export default AdminPanelSearchResults;
