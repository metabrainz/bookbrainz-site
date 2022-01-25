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
import {faPencilAlt, faPlus, faTimesCircle, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {formatDate, getEntityKey, getEntityTable} from '../../helpers/utils';
import AddEntityToCollectionModal from './parts/add-entity-to-collection-modal';
import DeleteOrRemoveCollaborationModal from './parts/delete-or-remove-collaboration-modal';
import {ENTITY_TYPE_ICONS} from '../../helpers/entity';
import EntityImage from './entities/image';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PagerElement from './parts/pager';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import request from 'superagent';


const {Alert, Badge, Button, Col, Row} = bootstrap;

function CollectionAttributes({collection}) {
	return (
		<div>
			{
				collection.description.length ?
					<Row>
						<Col md={12}>
							<dt>Description</dt>
							<dd>{collection.description}</dd>
						</Col>
					</Row> : null
			}
			<Row>
				<Col md={3}>
					<dt>Owner</dt>
					<dd><a href={`/editor/${collection.ownerId}`}>{collection.owner.name}</a></dd>
				</Col>
				{
					collection.collaborators.length ?
						<Col md={3}>
							<dt>Collaborator{collection.collaborators.length > 1 ? 's' : null}</dt>
							<dd>
								{
									collection.collaborators.map((collaborator, id) =>
										(
											<a href={`/editor/${collaborator.id}`} key={collaborator.id}>
												{collaborator.text}{id === collection.collaborators.length - 1 ? null : ', '}
											</a>
										))
								}
							</dd>
						</Col> : null
				}
				<Col md={3}>
					<dt>Privacy</dt>
					<dd>{collection.public ? 'Public' : 'Private'}</dd>
				</Col>
				<Col md={3}>
					<dt>Collection type</dt>
					<dd>{collection.entityType}</dd>
				</Col>
				<Col md={3}>
					<dt>Number of entities</dt>
					<dd>{collection.items.length}</dd>
				</Col>
				<Col md={3}>
					<dt>Created At</dt>
					<dd>{formatDate(new Date(collection.createdAt), true)}</dd>
				</Col>
				<Col md={3}>
					<dt>Last Modified</dt>
					<dd>{formatDate(new Date(collection.lastModified), true)}</dd>
				</Col>
			</Row>
		</div>
	);
}
CollectionAttributes.displayName = 'CollectionAttributes';
CollectionAttributes.propTypes = {
	collection: PropTypes.object.isRequired
};

class CollectionPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			entities: this.props.entities,
			message: {
				text: null,
				type: null
			},
			selectedEntities: [],
			showAddEntityModal: false,
			showDeleteModal: false
		};

		this.entityKey = getEntityKey(this.props.collection.entityType);
		this.paginationUrl = `/collection/${this.props.collection.id}/paginate`;
		this.toggleRow = this.toggleRow.bind(this);
		this.handleRemoveEntities = this.handleRemoveEntities.bind(this);
		this.handleShowDeleteModal = this.handleShowDeleteModal.bind(this);
		this.handleCloseDeleteModal = this.handleCloseDeleteModal.bind(this);
		this.handleShowAddEntityModal = this.handleShowAddEntityModal.bind(this);
		this.handleCloseAddEntityModal = this.handleCloseAddEntityModal.bind(this);
		this.handleAlertDismiss = this.handleAlertDismiss.bind(this);
		this.searchResultsCallback = this.searchResultsCallback.bind(this);
		this.closeAddEntityModalShowMessageAndRefreshTable = this.closeAddEntityModalShowMessageAndRefreshTable.bind(this);
	}

	searchResultsCallback(newResults) {
		this.setState({entities: newResults});
	}

	toggleRow(bbid) {
		// eslint-disable-next-line react/no-access-state-in-setstate
		const oldSelected = this.state.selectedEntities;
		let newSelected;
		if (oldSelected.find(selectedBBID => selectedBBID === bbid)) {
			newSelected = oldSelected.filter(selectedBBID => selectedBBID !== bbid);
		}
		else {
			newSelected = [...oldSelected, bbid];
		}
		this.setState({
			selectedEntities: newSelected
		});
	}

	handleRemoveEntities() {
		if (this.state.selectedEntities.length) {
			const bbids = this.state.selectedEntities;
			const submissionUrl = `/collection/${this.props.collection.id}/remove`;
			request.post(submissionUrl)
				.send({bbids})
				.then((res) => {
					this.setState({
						message: {
							text: `Removed ${bbids.length} ${_.kebabCase(this.props.collection.entityType)}${bbids.length > 1 ? 's' : ''}`,
							type: 'success'
						},
						selectedEntities: []
					}, this.pagerElementRef.triggerSearch);
				}, (error) => {
					this.setState({
						message: {
							text: 'Something went wrong! Please try again later',
							type: 'danger'
						}
					});
				});
		}
		else {
			this.setState({
				message: {
					text: `No ${_.kebabCase(this.props.collection.entityType)} selected`,
					type: 'danger'
				}
			});
		}
	}

	handleShowDeleteModal() {
		this.setState({showDeleteModal: true});
	}

	handleCloseDeleteModal() {
		this.setState({showDeleteModal: false});
	}

	handleShowAddEntityModal() {
		this.setState({showAddEntityModal: true});
	}

	handleCloseAddEntityModal() {
		this.setState({showAddEntityModal: false});
	}

	handleAlertDismiss() {
		this.setState({message: {}});
	}

	closeAddEntityModalShowMessageAndRefreshTable(message) {
		this.setState({
			message,
			showAddEntityModal: false
		}, this.pagerElementRef.triggerSearch);
	}

	render() {
		const messageComponent = this.state.message.text ? <Alert bsStyle={this.state.message.type} className="margin-top-1" onDismiss={this.handleAlertDismiss}>{this.state.message.text}</Alert> : null;
		const EntityTable = getEntityTable(this.props.collection.entityType);
		const propsForTable = {
			[this.entityKey]: this.state.entities,
			onToggleRow: this.toggleRow,
			selectedEntities: this.state.selectedEntities,
			showAdd: false,
			showAddedAtColumn: true,
			showCheckboxes: Boolean(this.props.isOwner) || Boolean(this.props.isCollaborator)
		};
		return (
			<div>
				<DeleteOrRemoveCollaborationModal
					collection={this.props.collection}
					isDelete={this.props.isOwner}
					show={this.state.showDeleteModal}
					userId={this.props.userId}
					onCloseModal={this.handleCloseDeleteModal}
				/>
				<AddEntityToCollectionModal
					closeModalAndShowMessage={this.closeAddEntityModalShowMessageAndRefreshTable}
					collectionId={this.props.collection.id}
					collectionType={this.props.collection.entityType}
					show={this.state.showAddEntityModal}
					onCloseModal={this.handleCloseAddEntityModal}
				/>
				<Row className="entity-display-background">
					<Col className="entity-display-image-box text-center" md={2}>
						<EntityImage
							backupIcon={ENTITY_TYPE_ICONS[this.props.collection.entityType]}
						/>
					</Col>
					<Col md={10}>
						<h1>{this.props.collection.name}</h1>
						<CollectionAttributes collection={this.props.collection}/>
					</Col>
				</Row>
				<EntityTable {...propsForTable}/>
				{messageComponent}
				<div className="margin-top-1 text-left">
					{
						this.props.isCollaborator || this.props.isOwner ?
							<Button
								bsSize="small"
								bsStyle="success"
								className="margin-bottom-d5"
								title={`Add ${this.props.collection.entityType}`}
								onClick={this.handleShowAddEntityModal}
							>
								<FontAwesomeIcon icon={faPlus}/>
								&nbsp;Add {_.lowerCase(this.props.collection.entityType)}
							</Button> : null
					}
					{
						(this.props.isCollaborator || this.props.isOwner) && this.state.entities.length ?
							<Button
								bsSize="small"
								bsStyle="danger"
								className="margin-bottom-d5"
								disabled={!this.state.selectedEntities.length}
								title={`Remove selected ${_.kebabCase(this.props.collection.entityType)}s`}
								onClick={this.handleRemoveEntities}
							>
								<FontAwesomeIcon icon={faTimesCircle}/>
								&nbsp;Remove <Badge>{this.state.selectedEntities.length}</Badge> selected&nbsp;
								{_.kebabCase(this.props.collection.entityType)}{this.state.selectedEntities.length > 1 ? 's' : null}
							</Button> : null
					}
					{
						this.props.isOwner ?
							<Button
								bsSize="small"
								bsStyle="warning"
								className="margin-bottom-d5"
								href={`/collection/${this.props.collection.id}/edit`}
								title="Edit Collection"
							>
								<FontAwesomeIcon icon={faPencilAlt}/>&nbsp;Edit collection
							</Button> : null
					}
					{
						this.props.isOwner ?
							<Button
								bsSize="small"
								bsStyle="danger"
								className="margin-bottom-d5"
								title="Delete Collection"
								onClick={this.handleShowDeleteModal}
							>
								<FontAwesomeIcon icon={faTrashAlt}/>&nbsp;Delete collection
							</Button> : null
					}
					{
						this.props.isCollaborator ?
							<Button
								bsSize="small"
								bsStyle="warning"
								className="margin-bottom-d5"
								title="Remove yourself as a collaborator"
								onClick={this.handleShowDeleteModal}
							>
								<FontAwesomeIcon icon={faTimesCircle}/>&nbsp;Stop collaboration
							</Button> : null
					}
				</div>
				<div id="pageWithPagination">
					<PagerElement
						from={this.props.from}
						nextEnabled={this.props.nextEnabled}
						paginationUrl={this.paginationUrl}
						ref={(ref) => this.pagerElementRef = ref}
						results={this.state.entities}
						searchResultsCallback={this.searchResultsCallback}
						size={this.props.size}
					/>
				</div>
			</div>
		);
	}
}


CollectionPage.displayName = 'CollectionPage';
CollectionPage.propTypes = {
	collection: PropTypes.object.isRequired,
	entities: PropTypes.array,
	from: PropTypes.number,
	isCollaborator: PropTypes.bool,
	isOwner: PropTypes.bool,
	nextEnabled: PropTypes.bool.isRequired,
	showCheckboxes: PropTypes.bool,
	size: PropTypes.number,
	userId: PropTypes.number
};
CollectionPage.defaultProps = {
	entities: [],
	from: 0,
	isCollaborator: false,
	isOwner: false,
	showCheckboxes: false,
	size: 20,
	userId: null
};

export default CollectionPage;
