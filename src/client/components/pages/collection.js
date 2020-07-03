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
import {ENTITY_TYPE_ICONS} from '../../helpers/entity';
import EditionTable from './entities/edition-table';
import EntityImage from './entities/image';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import WorkTable from './entities/work-table';
import {formatDate} from '../../helpers/utils';
import request from 'superagent';


const {Alert, Button, Col, Row} = bootstrap;

function getEntityTable(entityType) {
	const tables = {
		Edition: EditionTable,
		Work: WorkTable
	};
	return tables[entityType];
}

function getEntityKey(entityType) {
	const keys = {
		Edition: 'editions',
		Work: 'works'
	};
	return keys[entityType];
}

function CollectionAttributes({collection}) {
	return (
		<div>
			<Row>
				<Col md={3}>
					<dl>
						<dt>Description</dt>
						<dd>{collection.description}</dd>
					</dl>
				</Col>
				<Col md={3}>
					<dl>
						<dt>Owner</dt>
						<dd>{collection.owner.name}</dd>
						<dt>Collaborators</dt>
						<dd>{collection.collaborators.map((collaborator) => `${collaborator.text} `)}</dd>
					</dl>
				</Col>
				<Col md={3}>
					<dl>
						<dt>Last Modified</dt>
						<dd>{formatDate(new Date(collection.lastModified), true)}</dd>
						<dt>Created At</dt>
						<dd>{formatDate(new Date(collection.createdAt), true)}</dd>
					</dl>
				</Col>
				<Col md={3}>
					<dt>Privacy</dt>
					<dd>{collection.public ? 'Public' : 'Private'}</dd>
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
			error: null,
			selectedEntities: []
		};

		this.toggleRow = this.toggleRow.bind(this);
		this.handleRemoveEntities = this.handleRemoveEntities.bind(this);
	}

	entityKey = getEntityKey(this.props.collection.entityType);

	toggleRow(bbid) {
		// eslint-disable-next-line react/no-access-state-in-setstate
		const oldSelected = this.state.selectedEntities;
		let newSelected;
		if (oldSelected.find(selectedBBID => selectedBBID === bbid)) {
			newSelected = oldSelected.filter(selectedBBID => selectedBBID !== bbid);
		}
		else {
			newSelected = oldSelected.push(bbid) && oldSelected;
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
					window.location.href = `/collection/${this.props.collection.id}`;
				}, (error) => {
					this.setState({error: 'Internal Error'});
				});
		}
		else {
			this.setState({error: `No ${this.entityKey} selected`});
		}
	}

	render() {
		const errorComponent = this.state.error ?
			<Alert bsStyle="danger">{this.state.error}</Alert> : null;
		const EntityTable = getEntityTable(this.props.collection.entityType);
		const propsForTable = {
			[this.entityKey]: this.props.entities,
			selectedEntities: this.state.selectedEntities,
			showAdd: false,
			showCheckboxes: this.props.showCheckboxes,
			toggleRow: this.toggleRow
		};
		return (
			<div>
				<Row className="entity-display-background">
					<Col className="entity-display-image-box text-center" md={2}>
						<EntityImage
							backupIcon={ENTITY_TYPE_ICONS[this.props.collection.entityType]}
						/>
					</Col>
					<Col md={10}>
						<h1><strong>{this.props.collection.name}</strong></h1>
						<CollectionAttributes collection={this.props.collection}/>
					</Col>
				</Row>
				<EntityTable{...propsForTable}/>
				{errorComponent}
				<div className="margin-top-1 text-center">
					{
						this.props.showCheckboxes ?
							<Button
								bsStyle="danger"
								onClick={this.handleRemoveEntities}
							>
								<FontAwesomeIcon icon="times"/>
								&nbsp;Remove selected {this.entityKey}
							</Button> : null
					}
					{
						this.props.isOwner ?
							<Button
								bsStyle="warning"
								href={`/collection/${this.props.collection.id}/edit`}
								title="Edit Collection"
							>
								<FontAwesomeIcon icon="pencil-alt"/>&nbsp;Edit collection
							</Button> : null
					}
					{
						this.props.isOwner ?
							<Button
								bsStyle="danger"
								title="Delete Collection"
							>
								<FontAwesomeIcon icon="trash-alt"/>&nbsp;Delete collection
							</Button> : null
					}
				</div>
			</div>
		);
	}
}


CollectionPage.displayName = 'CollectionsPage';
CollectionPage.propTypes = {
	collection: PropTypes.object.isRequired,
	entities: PropTypes.array,
	isOwner: PropTypes.bool,
	showCheckboxes: PropTypes.bool
};
CollectionPage.defaultProps = {
	entities: [],
	isOwner: false,
	showCheckboxes: false
};

export default CollectionPage;
