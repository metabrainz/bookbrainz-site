/*
 * Copyright (C) 2020 Prabal Singh
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
import * as utilsHelper from '../../../helpers/utils';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {genEntityIconHTMLElement} from '../../../helpers/entity';


const {Button, DropdownButton, MenuItem, Table} = bootstrap;
const {formatDate} = utilsHelper;


class CollectionsTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			type: ''
		};

		// React does not autobind non-React class methods
		this.handleEntitySelect = this.handleEntitySelect.bind(this);
	}

	handleEntitySelect(type) {
		this.setState({type});
		this.props.onTypeChange(type);
	}

	render() {
		const {showLastModified, showOwner, showIfOwnerOrCollaborator, showPrivacy, results, tableHeading} = this.props;
		const entityTypeSelect = (
			<DropdownButton
				bsStyle="primary"
				id="entity-type-select"
				title={_.startCase(this.state.type) || 'Entity Type'}
				onSelect={this.handleEntitySelect}
			>
				{this.props.entityTypes.map((entityType) => (
					<MenuItem
						eventKey={entityType}
						key={entityType}
					>
						{genEntityIconHTMLElement(entityType)}
						{_.startCase(entityType)}
					</MenuItem>
				))}
				<MenuItem divider/>
				<MenuItem
					eventKey={null}
					key="allTypes"
				>
					All Types
				</MenuItem>
			</DropdownButton>
		);
		const newCollectionButton = (
			<Button
				bsStyle="warning"
				href="/collection/create"
				type="button"
			>
				<FontAwesomeIcon icon="plus"/>
				&nbsp;Create Collection
			</Button>
		);
		return (
			<div>
				<div>
					<h1 className="text-center">
						{tableHeading}
					</h1>
					<div className="text-right">
						{newCollectionButton}
						{entityTypeSelect}
					</div>
				</div>
				<hr className="thin"/>
				{
					results.length > 0 ?
						<Table
							responsive
							className="table table-striped"
						>
							<thead>
								<tr>
									<th className="col-sm-2">Name</th>
									<th className="col-sm-4">Description</th>
									<th className="col-sm-2">Entity Type</th>
									{
										showPrivacy ?
											<th className="col-sm-2">Privacy</th> : null
									}
									{
										showIfOwnerOrCollaborator ?
											<th className="col-sm-2">Collaborator/Owner</th> : null
									}
									{
										showOwner ?
											<th className="col-sm-2">Owner</th> : null

									}
									{
										showLastModified ?
											<th className="col-sm-2">Last Modified</th> : null
									}
								</tr>
							</thead>

							<tbody>
								{
									results.map((collection) => (
										<tr key={collection.id}>
											<td>
												<a
													href={`/collection/${collection.id}`}
												>
													{collection.name}
												</a>
											</td>
											<td>{collection.description}</td>
											<td>{collection.entityType}</td>
											{
												showPrivacy ?
													<td>{collection.public ? 'Public' : 'Private'}</td> : null
											}
											{
												showIfOwnerOrCollaborator ?
													<td>{collection.isOwner ? 'Owner' : 'Collaborator'}</td> : null
											}
											{
												showOwner ?
													<td>{collection.owner.name}</td> : null

											}
											{
												showLastModified ?
													<td>{formatDate(new Date(collection.lastModified), true)}</td> : null
											}
										</tr>
									))
								}
							</tbody>
						</Table> :

						<div>
							<h4> No collections to show</h4>
							<hr className="wide"/>
						</div>
				}
			</div>

		);
	}
}

CollectionsTable.propTypes = {
	entityTypes: PropTypes.array.isRequired,
	onTypeChange: PropTypes.func.isRequired,
	results: PropTypes.array.isRequired,
	showIfOwnerOrCollaborator: PropTypes.bool,
	showLastModified: PropTypes.bool,
	showOwner: PropTypes.bool,
	showPrivacy: PropTypes.bool,
	tableHeading: PropTypes.node
};
CollectionsTable.defaultProps = {
	showIfOwnerOrCollaborator: false,
	showLastModified: false,
	showOwner: false,
	showPrivacy: false,
	tableHeading: 'Collections'
};


CollectionsTable.displayName = 'CollectionsTable';


export default CollectionsTable;
