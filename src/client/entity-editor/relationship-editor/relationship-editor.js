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
	Button,
	Col,
	ControlLabel,
	FormGroup,
	Modal,
	ProgressBar,
	Row
} from 'react-bootstrap';
import type {
	Entity,
	EntityType,
	LanguageOption,
	RelationshipType,
	RelationshipWithLabel,
	Relationship as _Relationship
} from './types';

import EntitySearchFieldOption from '../common/entity-search-field-option';
import React from 'react';
import ReactSelect from 'react-select';
import Relationship from './relationship';
import _ from 'lodash';

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

function getValidOtherEntityTypes(
	relationshipTypes: Array<RelationshipType>,
	baseEntity: Entity
) {
	const validEntityTypes = relationshipTypes.map((relationshipType) => {
		if (relationshipType.sourceEntityType === baseEntity.type) {
			return relationshipType.targetEntityType;
		}
		if (relationshipType.targetEntityType === baseEntity.type) {
			return relationshipType.sourceEntityType;
		}
		return null;
	});

	return _.uniq(_.compact(validEntityTypes)).sort();
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
	languageOptions: Array<LanguageOption>,
	onCancel?: () => mixed,
	onClose?: () => mixed,
	onAdd?: (_Relationship) => mixed
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

// Disable valid-jsdoc because eslint is looking for a "value" parameter
/* eslint-disable valid-jsdoc */
/**
 * This is a simple React component. No Redux connection. Renders a modal
 * containing a form with two fields (entity and relationship) and two buttons
 * (cancel and add), allowing new relationships to be set up and added to the
 * entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Entity} props.baseEntity - The entity currently being edited in the
 *        entity editor
 * @param {?_Relationship} props.initRelationship - The relationship being
 *        edited, if not creating a new relationship.
 * @param {Array} props.languageOptions - The list of possible languages for an
 *        entity.
 * @param {Array<RelationshipType>} props.relationshipTypes - All the possible
 *        relationship types for any pair of entities.
 * @param {Function} props.onCancel - A function to be called when the cancel
 *        button is clicked.
 * @param {Function} props.onClose - A function to be called when the modal is
 *        closed.
 * @param {Function} props.onAdd - A function to be called when the add button
 *        is clicked.
 */
/* eslint-enable valid-jsdoc */
class RelationshipModal
	extends React.Component<RelationshipModalProps, RelationshipModalState> {
	static defaultProps = {
		onAdd: null,
		onCancel: null,
		onClose: null
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

	handleAdd = () => {
		const {onAdd} = this.props;
		if (onAdd) {
			if (this.state.relationship) {
				onAdd(this.state.relationship);
			}
		}
	};

	handleKeyPress = (event) => {
		if (event.keyCode === 13) {
			if (this.calculateProgressAmount() === 100) {
				event.preventDefault();
				this.handleAdd();
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
		const {baseEntity, relationshipTypes} = this.props;
		const types = getValidOtherEntityTypes(relationshipTypes, baseEntity);
		const typesForDisplay = types.map(_.startCase);
		const lastType = _.last(typesForDisplay);
		const otherTypes = _.join(typesForDisplay.slice(0, -1), ', ');
		const label =
			`Other Entity (${otherTypes.length ? `${otherTypes} or ` : ''}${lastType})`;

		return (
			<EntitySearchFieldOption
				cache={false}
				instanceId="relationshipEntitySearchField"
				label={label}
				languageOptions={this.props.languageOptions}
				name="entity"
				type={types}
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
			<Modal show bsSize="large" onHide={onClose} onKeyUp={this.handleKeyPress}>
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
						{' '}For example, you can link an author
						to a work, or a work to another work
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
						onClick={this.handleAdd}
					>
						Add
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}

export default RelationshipModal;
