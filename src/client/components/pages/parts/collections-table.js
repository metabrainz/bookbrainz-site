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
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {genEntityIconHTMLElement} from '../../../helpers/entity';
import {withTranslation} from 'react-i18next';


const {Button, ButtonGroup, Dropdown, DropdownButton, Table} = bootstrap;
const {formatDate} = utilsHelper;


class CollectionsTable extends React.Component {
	constructor(props) {
		super(props);
		// React does not autobind non-React class methods
		this.handleEntitySelect = this.handleEntitySelect.bind(this);
	}

	handleEntitySelect(type) {
		this.props.onTypeChange(type);
	}

	render() {
		// eslint-disable-next-line id-length
		const {t: translate} = this.props;
		const {showLastModified, showOwner, showIfOwnerOrCollaborator, showPrivacy, results, tableHeading, user, ownerId} = this.props;
		const entityTypeSelect = (
			<DropdownButton
				className="margin-bottom-d5"
				id="entity-type-select"
				title={this.props.type ? translate(`common:entityType.${_.camelCase(this.props.type)}`) : translate('common:type')}
				variant="primary"
				onSelect={this.handleEntitySelect}
			>
				{this.props.entityTypes.map((entityType) => (
					<Dropdown.Item
						eventKey={entityType}
						key={entityType}
					>
						{genEntityIconHTMLElement(entityType)}
						{translate(`common:entityType.${_.camelCase(entityType)}`)}
					</Dropdown.Item>
				))}
				<Dropdown.Divider/>
				<Dropdown.Item
					eventKey={null}
					key="allTypes"
				>
					{translate('pages:collections.allTypes')}
				</Dropdown.Item>
			</DropdownButton>
		);

		let newCollectionButton;
		// 1.Check if user is logged In if so checks the page ownerId with users id
		// OR
		// 2.Check if user is logged In if so checks the page is central public collections page or not
		if (user && (user.id === ownerId || !ownerId)) {
			newCollectionButton = (
				<Button
					className="margin-bottom-d5"
					href="/collection/create"
					type="button"
					variant="warning"
				>
					<FontAwesomeIcon icon={faPlus}/>
					&nbsp;{translate('pages:collections.createButton')}
				</Button>
			);
		}

		let myCollectionButton;
		// Display "My collections" button when
		// 1.the user is logged in and not viewing the user's collections
		// 2.the user is logged in and viewing public collections
		if (user && (!ownerId || user.id !== ownerId)) {
			myCollectionButton = (
				<Button
					className="margin-bottom-d5"
					href={`/editor/${user.id}/collections`}
					type="button"
					variant="success"
				>
					{translate('pages:collections.myCollectionsButton')}
				</Button>
			);
		}

		return (
			<div>
				<div>
					<h1 className="text-center">
						{tableHeading}
					</h1>
					<div className="collection-page-buttons">
						<ButtonGroup>
							{myCollectionButton}
							{newCollectionButton}
							{entityTypeSelect}
						</ButtonGroup>
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
									<th width="16%">{translate('pages:collections.headerName')}</th>
									<th width="33%">{translate('pages:collections.headerDescription')}</th>
									<th width="16%">{translate('pages:collections.headerEntityType')}</th>
									<th width="16%">{translate('pages:collections.headerEntities')}</th>
									{
										showPrivacy ?
											<th width="16%">{translate('pages:collections.headerPrivacy')}</th> : null
									}
									{
										showIfOwnerOrCollaborator ?
											<th width="16%">{translate('pages:collections.headerRole')}</th> : null
									}
									{
										showOwner ?
											<th width="16%">{translate('pages:collections.headerOwner')}</th> : null

									}
									{
										showLastModified ?
											<th width="16%">{translate('pages:collections.headerLastModified')}</th> : null
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
											<td>{translate(`common:entityType.${_.camelCase(collection.entityType)}`)}</td>
											<td>{collection.itemCount}</td>
											{
												showPrivacy ?
													<td>{collection.public ? translate('pages:collections.public') : translate('pages:collections.private')}</td> : null
											}
											{
												showIfOwnerOrCollaborator ?
													<td>{collection.isOwner ? translate('pages:collections.owner') : translate('pages:collections.collaborator')}</td> : null
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
							<h4> {translate('pages:collections.noCollections')}</h4>
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
	ownerId: PropTypes.number,
	results: PropTypes.array.isRequired,
	showIfOwnerOrCollaborator: PropTypes.bool,
	showLastModified: PropTypes.bool,
	showOwner: PropTypes.bool,
	showPrivacy: PropTypes.bool,
	// eslint-disable-next-line id-length
	t: PropTypes.func.isRequired,
	tableHeading: PropTypes.node,
	type: PropTypes.string,
	user: PropTypes.object
};
CollectionsTable.defaultProps = {
	ownerId: null,
	showIfOwnerOrCollaborator: false,
	showLastModified: false,
	showOwner: false,
	showPrivacy: false,
	tableHeading: 'Collections',
	type: '',
	user: null
};


CollectionsTable.displayName = 'CollectionsTable';


export default withTranslation(['pages', 'common'])(CollectionsTable);
