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
import EditionTable from './entities/edition-table';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import WorkTable from './entities/work-table';
import request from 'superagent';


const {Alert, Button, ButtonGroup, Row} = bootstrap;

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
					<div>
						<h1><strong>{this.props.collection.name}</strong></h1>
						<h4>{this.props.collection.description}</h4>
						<hr/>
						{
							this.props.isOwner ?
								<ButtonGroup className="pull-right margin-bottom-1">
									<Button
										bsStyle="warning"
										className="margin-right-d2"
										href={`/collection/${this.props.collection.id}/edit`}
										title="Edit Collection"
									>
										<FontAwesomeIcon icon="pencil-alt"/>&nbsp;Edit
									</Button>
									<Button
										bsStyle="danger"
										className="margin-right-1"
										title="Delete this Collection"
									>
										<FontAwesomeIcon icon="trash-alt"/> Delete
									</Button>
								</ButtonGroup> : null
						}
					</div>
				</Row>
				<EntityTable{...propsForTable}/>
				{errorComponent}
				{
					this.props.showCheckboxes ?
						<Button
							bsStyle="danger"
							className="pull-left margin-top-1"
							onClick={this.handleRemoveEntities}
						>
							<FontAwesomeIcon icon="times"/>
							&nbsp;Remove selected {this.entityKey}
						</Button> : null
				}
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
