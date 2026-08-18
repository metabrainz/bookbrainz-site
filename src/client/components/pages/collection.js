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
import {Trans, withTranslation} from 'react-i18next';
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

function CollectionAttributes({collection, t: translate}) {
	return (
		<div>
			{
				collection.description.length ?
					<Row>
						<Col lg={12}>
							<dt>{translate('common.description')}</dt>
							<dd>{collection.description}</dd>
						</Col>
					</Row> : null
			}
			<Row>
				<Col lg={3}>
					<dt>{translate('common.owner')}</dt>
					<dd><a href={`/editor/${collection.ownerId}`}>{collection.owner.name}</a></dd>
				</Col>
				{
					collection.collaborators.length ?
						<Col lg={3}>
							<dt>{translate('common.collaborator', {count: collection.collaborators.length})}</dt>
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
				<Col lg={3}>
					<dt>{translate('common.Privacy')}</dt>
					<dd>{collection.public ? translate('common.public') : translate('common.private')}</dd>
				</Col>
				<Col lg={3}>
					<dt>{translate('pages.collection.collectionType')}</dt>
					<dd>{translate(`common.entityType.${_.camelCase(collection.entityType)}`)}</dd>
				</Col>
				<Col lg={3}>
					<dt>{translate('pages.collection.numberOfEntities', {type: translate(`common.entityType.${_.camelCase(collection.entityType)}_plural`)})}</dt>
					<dd>{collection.items.length}</dd>
				</Col>
				<Col lg={3}>
					<dt>{translate('pages.collection.createdAt')}</dt>
					<dd>{formatDate(new Date(collection.createdAt), true)}</dd>
				</Col>
				<Col lg={3}>
					<dt>{translate('common.lastModified')}</dt>
					<dd>{formatDate(new Date(collection.lastModified), true)}</dd>
				</Col>
			</Row>
		</div>
	);
}
CollectionAttributes.displayName = 'CollectionAttributes';
CollectionAttributes.propTypes = {
	collection: PropTypes.object.isRequired,
	// eslint-disable-next-line id-length
	t: PropTypes.func.isRequired
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
		const {t: translate} = this.props;
		if (this.state.selectedEntities.length) {
			const bbids = this.state.selectedEntities;
			const submissionUrl = `/collection/${this.props.collection.id}/remove`;
			request.post(submissionUrl)
				.send({bbids})
				.then(() => {
					this.setState({
						message: {
							text: translate('pages.collection.removedEntities', {count: bbids.length, type: translate(`common.entityType.${_.camelCase(this.props.collection.entityType)}${bbids.length === 1 ? '' : '_plural'}`)}),
							type: 'success'
						},
						selectedEntities: []
					}, this.pagerElementRef.triggerSearch);
				}, () => {
					this.setState({
						message: {
							text: translate('common.error'),
							type: 'danger'
						}
					});
				});
		}
		else {
			this.setState({
				message: {
					text: translate('common.noEntitySelected', {type: translate(`common.entityType.${_.camelCase(this.props.collection.entityType)}`)}),
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
		const {t: translate} = this.props;
		const messageComponent =
			this.state.message.text ? (
				<Alert
					className="margin-top-1"
					variant={this.state.message.type}
					onDismiss={this.handleAlertDismiss}
				>
					 {this.state.message.text}
				</Alert>
			) : null;
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
					<Col className="entity-display-image-box text-center" lg={2}>
						<EntityImage
							backupIcon={ENTITY_TYPE_ICONS[this.props.collection.entityType]}
						/>
					</Col>
					<Col lg={10}>
						<h1>{this.props.collection.name}</h1>
						<hr/>
						<CollectionAttributes collection={this.props.collection} t={translate}/>
					</Col>
				</Row>
				<EntityTable {...propsForTable}/>
				{messageComponent}
				<div className="margin-top-1 text-left">
					{
						this.props.isCollaborator || this.props.isOwner ?
							<Button
								className="margin-bottom-d5"
								size="sm"
								title={translate('pages.collection.addEntity', {type: translate(`common.entityType.${_.camelCase(this.props.collection.entityType)}`)})}
								variant="success"
								onClick={this.handleShowAddEntityModal}
							>
								<FontAwesomeIcon icon={faPlus}/>
								&nbsp;{translate('pages.collection.addEntity', {type: translate(`common.entityType.${_.camelCase(this.props.collection.entityType)}`)})}
							</Button> : null
					}
					{
						(this.props.isCollaborator || this.props.isOwner) && this.state.entities.length ?
							<Button
								className="margin-bottom-d5"
								disabled={!this.state.selectedEntities.length}
								size="sm"
								title={translate('pages.collection.removeSelectedTooltip', {type: translate(`common.entityType.${_.camelCase(this.props.collection.entityType)}_plural`)})}
								variant="danger"
								onClick={this.handleRemoveEntities}
							>
								<FontAwesomeIcon icon={faTimesCircle}/>
								&nbsp;
								<Trans
									components={{
										badge: <Badge pill/>
									}}
									i18nKey="pages.collection.removeSelected"
									values={{
										count: this.state.selectedEntities.length,
										type: translate(`common.entityType.${_.camelCase(this.props.collection.entityType)}${this.state.selectedEntities.length === 1 ? '' : '_plural'}`)
									}}
								/>
							</Button> : null
					}
					{
						this.props.isOwner ?
							<Button
								className="margin-bottom-d5"
								href={`/collection/${this.props.collection.id}/edit`}
								size="sm"
								title={translate('pages.collection.editCollection')}
								variant="warning"
							>
								<FontAwesomeIcon icon={faPencilAlt}/>&nbsp;{translate('pages.collection.editCollection')}
							</Button> : null
					}
					{
						this.props.isOwner ?
							<Button
								className="margin-bottom-d5"
								size="sm"
								title={translate('pages.collection.deleteCollection')}
								variant="danger"
								onClick={this.handleShowDeleteModal}
							>
								<FontAwesomeIcon icon={faTrashAlt}/>&nbsp;{translate('pages.collection.deleteCollection')}
							</Button> : null
					}
					{
						this.props.isCollaborator ?
							<Button
								className="margin-bottom-d5"
								size="sm"
								title={translate('pages.collection.stopCollaborationTooltip')}
								variant="warning"
								onClick={this.handleShowDeleteModal}
							>
								<FontAwesomeIcon icon={faTimesCircle}/>&nbsp;{translate('pages.collection.stopCollaboration')}
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
	// eslint-disable-next-line id-length
	t: PropTypes.func.isRequired,
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

export default withTranslation()(CollectionPage);
