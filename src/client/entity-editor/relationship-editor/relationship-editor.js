/*
 * Copyright (C) 2018  Ben Ockmore
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

// @flow

import {
	Button, Col, ControlLabel, FormGroup, Modal, ProgressBar, Row
} from 'react-bootstrap';
import type {
	Entity, EntityType, RelationshipType,
	RelationshipWithLabel, Relationship as _Relationship
} from './types';
import EntitySearchField from '../common/entity-search-field';
import React from 'react';
import ReactSelect from 'react-select';
import Relationship from './relationship';
import _ from 'lodash';

/*
 * This is a simple React component. No Redux connection. Has an onSubmit
 * action, which allows the rest of the app to
 */

const ENTITY_TYPE_VALUES = [
	{id: 'creator', label: 'Creator'},
	{id: 'edition', label: 'Edition'},
	{id: 'publication', label: 'Publication'},
	{id: 'publisher', label: 'Publisher'},
	{id: 'work', label: 'Work'}
];

function isValidRelationship(relationship: _Relationship) {
	const {relationshipType, sourceEntity, targetEntity} = relationship;

	return (
		(relationshipType.sourceEntityType === sourceEntity.type) &&
		(relationshipType.targetEntityType === targetEntity.type)
	);
}

function generateRelationshipSelection(
	relationshipTypes: Array<RelationshipType>,
	entityA: Entity,
	entityB: Entity
): Array<RelationshipWithLabel> {
	const forwardRelationships = relationshipTypes.map(
		(relationshipType) => ({
			label: relationshipType.linkPhrase,
			relationshipType,
			sourceEntity: entityA,
			targetEntity: entityB
		})
	);
	const reverseRelationships = relationshipTypes.map(
		(relationshipType) => ({
			label: relationshipType.linkPhrase,
			relationshipType,
			sourceEntity: entityB,
			targetEntity: entityA
		})
	);

	const candidateRelationships = [
		...forwardRelationships,
		...reverseRelationships
	];

	return candidateRelationships.filter(isValidRelationship);
}

type EntitySearchResult = {
	text: string,
	id: string | number,
	value: string | number,
	type: EntityType
};

type RelationshipModalProps = {
	relationshipTypes: Array<RelationshipType>,
	baseEntity: Entity,
	initRelationship: ?_Relationship,
	onCancel?: () => mixed,
	onClose?: () => mixed,
	onSave?: (_Relationship) => mixed
};

type RelationshipModalState = {
	relationshipType?: ?RelationshipType,
	relationship?: ?_Relationship,
	targetEntity?: ?EntitySearchResult
};

function getInitState(
	baseEntity: Entity, initRelationship: ?_Relationship
): RelationshipModalState {
	if (_.isNull(initRelationship)) {
		return {
			relationship: null,
			relationshipType: null,
			targetEntity: null
		};
	}

	const sourceEntity = _.get(initRelationship, ['sourceEntity']);
	const targetEntity = _.get(initRelationship, ['targetEntity']);

	const baseEntityBBID = _.get(baseEntity, ['bbid']);

	const sourceEntityBBID = _.get(sourceEntity, ['bbid']);
	const otherEntity = baseEntityBBID === sourceEntityBBID ?
		targetEntity : sourceEntity;

	const searchFormatOtherEntity = otherEntity && {
		id: _.get(otherEntity, ['bbid']),
		text: _.get(
			otherEntity, ['defaultAlias', 'name'], '(unnamed)'
		),
		type: _.get(otherEntity, ['type']),
		value: _.get(otherEntity, ['bbid'])
	};

	return {
		relationship: initRelationship,
		relationshipType: _.get(initRelationship, ['relationshipType']),
		targetEntity: searchFormatOtherEntity
	};
}

class RelationshipModal
	extends React.Component<RelationshipModalProps, RelationshipModalState> {
	static defaultProps = {
		onCancel: null,
		onClose: null,
		onSave: null
	};

	constructor(props: RelationshipModalProps) {
		super(props);

		this.state = getInitState(props.baseEntity, props.initRelationship);
	}

	handleEntityChange = (value: EntitySearchResult) => {
		this.setState({
			relationship: null,
			relationshipType: null,
			targetEntity: value
		});
	};

	handleRelationshipTypeChange = (value: _Relationship) => {
		this.setState({
			relationship: value,
			relationshipType: value.relationshipType
		});
	};

	handleSave = () => {
		const {onSave} = this.props;
		if (onSave) {
			if (this.state.relationship) {
				onSave(this.state.relationship);
			}
		}
	};

	calculateProgressAmount() {
		if (!this.state.targetEntity) {
			return 1;
		}

		if (!this.state.relationshipType) {
			return 50;
		}

		return 100;
	}

	renderEntitySelect() {
		return (
			<EntitySearchField
				cache={false}
				instanceId="publication"
				label="Entity"
				name="entity"
				value={this.state.targetEntity}
				onChange={this.handleEntityChange}
			/>
		);
	}

	renderRelationshipSelect() {
		const {baseEntity, relationshipTypes} = this.props;

		const otherEntity = {
			bbid: _.get(this.state, ['targetEntity', 'id']),
			defaultAlias: {
				name: _.get(this.state, ['targetEntity', 'text'])
			},
			type: _.get(this.state, ['targetEntity', 'type'])
		};

		const relationships = generateRelationshipSelection(
			relationshipTypes, baseEntity, otherEntity
		);

		return (
			<FormGroup>
				<ControlLabel>Relationship</ControlLabel>
				<ReactSelect
					disabled={!this.state.targetEntity}
					name="relationshipType"
					optionRenderer={Relationship}
					options={relationships}
					value={this.state.relationship}
					valueKey="selectId"
					valueRenderer={Relationship}
					onChange={this.handleRelationshipTypeChange}
				/>
			</FormGroup>
		);
	}

	render() {
		const {onCancel, onClose, baseEntity} = this.props;

		const submitDisabled = this.calculateProgressAmount() < 100;

		return (
			<Modal show bsSize="large" onHide={onClose}>
				<Modal.Header>
					<Modal.Title>Add a relationship</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>
						<strong>
							Use this form to add links between this{' '}
							{baseEntity.type}
							{' '}and other entities.
						</strong>
						{' '}For example, you can link a creator
						to a work as an author, or a work to another work
						to show translation or derivation.
					</p>
					<hr/>
					<Row>
						<Col md={10} mdOffset={1}>
							<form>
								<div>
									{this.renderEntitySelect()}
								</div>
								<div>
									{this.renderRelationshipSelect()}
								</div>
							</form>
						</Col>
					</Row>
				</Modal.Body>
				<Modal.Footer>
					<Row>
						<Col md={10} mdOffset={1}>
							<ProgressBar
								bsStyle="success"
								now={this.calculateProgressAmount()}
							/>
						</Col>
					</Row>
					<Button bsStyle="danger" onClick={onCancel}>Cancel</Button>
					<Button
						bsStyle="success"
						disabled={submitDisabled}
						onClick={this.handleSave}
					>
						Save
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}

export default RelationshipModal;
