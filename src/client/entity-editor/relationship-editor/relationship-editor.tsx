/*
 * Copyright (C) 2018  Ben Ockmore
 *				 2021  Akash Gupta
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


import * as React from 'react';

import {
	Button,
	Col,
	Container,
	Form,
	Modal,
	ProgressBar,
	Row
} from 'react-bootstrap';
import type {
	Entity,
	EntityType,
	RelationshipType,
	RelationshipWithLabel,
	Attribute as _Attribute,
	Relationship as _Relationship
} from './types';
import {faExternalLinkAlt, faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import {getInitAttribute, setAttribute} from './helper';

import EntitySearchFieldOption from '../common/entity-search-field-option';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {NumberAttribute} from './attributes';
import ReactSelect from 'react-select';
import RelationshipSelect from './relationship-select';
import _ from 'lodash';
import {getEntityLink} from '../../../common/helpers/utils';


function isValidRelationship(relationship: _Relationship) {
	const {relationshipType, sourceEntity, targetEntity} = relationship;

	return (
		relationshipType.deprecated !== true &&
		(relationshipType.sourceEntityType === sourceEntity.type) &&
		(relationshipType.targetEntityType === targetEntity.type)
	);
}

export function generateRelationshipSelection(
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

	const validRels = candidateRelationships.filter(isValidRelationship);
	if (!validRels.length) {
		return validRels;
	}
	// Sort by parentId childOrder then group by parentId
	const groupBy = _.groupBy(
		_.sortBy(validRels, [
			'relationshipType.parentId',
			'relationshipType.childOrder',
			'relationshipType.id'
		]),
		'relationshipType.parentId'
	);

	// Make level 0 (parentId = null) the base of a new sortedArray
	const sortedRelationships = _.get(groupBy, 'null');
	sortedRelationships.forEach(rootRel => rootRel.relationshipType.depth = 0);
	delete groupBy.null;

	// Iterate over the remaining elements to place after their parent and set their depth accordingly
	_.forEach(groupBy, (group, parentId) => {
		// Find the parent root in the sortedArray and insert its children after it
		const parentIndex = _.findIndex(sortedRelationships, ['relationshipType.id', Number(parentId)]);
		group.forEach(rel => rel.relationshipType.depth = sortedRelationships[parentIndex].relationshipType.depth + 1);
		// Insert the group after its parent
		sortedRelationships.splice(parentIndex + 1, 0, ...group);
	});

	return sortedRelationships;
}

function getValidOtherEntityTypes(
	relTypes: Array<RelationshipType>,
	baseEntity: Entity
) {
	let relationshipTypes = relTypes;
	if (baseEntity.type === 'Series') {
		// When the base entity is Series, remove relationship type 70 - 74.
		// We don't want to generate entity types corresponding to these relationship type.
		relationshipTypes = relationshipTypes.filter(relationshipType => !(relationshipType.id > 69 && relationshipType.id < 75));
	}
	const validEntityTypes = relationshipTypes.map((relationshipType) => {
		if (relationshipType.deprecated === true) {
			return null;
		}
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
	id: string,
	value: string | number,
	type: EntityType
};

type RelationshipModalProps = {
	relationshipTypes: Array<RelationshipType>,
	baseEntity: Entity,
	initRelationship: _Relationship | null | undefined,
	languageOptions: Array<{label: string, value: number}>,
	onCancel?: () => unknown,
	onClose?: () => unknown,
	onAdd?: (_Relationship) => unknown
};


type RelationshipModalState = {
	attributeSetId: number | null,
	isAdded: boolean,
	isRemoved: boolean,
	relationshipType?: RelationshipType | null | undefined,
	relationship?: _Relationship | null | undefined,
	targetEntity?: EntitySearchResult | null | undefined,
	attributePosition?: _Attribute,
	attributeNumber?: _Attribute
	attributes?: _Attribute[]
};

function getInitState(
	baseEntity: Entity, initRelationship: _Relationship | null | undefined
): RelationshipModalState {
	if (_.isNull(initRelationship)) {
		return {
			attributeNumber: {attributeType: 2, value: {textValue: null}},
			attributePosition: {attributeType: 1, value: {textValue: null}},
			attributeSetId: null,
			attributes: [],
			isAdded: true,
			isRemoved: false,
			relationship: null,
			relationshipType: null,
			targetEntity: null
		};
	}

	const sourceEntity = _.get(initRelationship, ['sourceEntity']);
	const targetEntity = _.get(initRelationship, ['targetEntity']);

	const baseEntityBBID = _.get(baseEntity, ['bbid']);
	const sourceEntityBBID = _.get(sourceEntity, ['bbid']);

	const [otherEntity, thisEntity] = baseEntityBBID === sourceEntityBBID ?
		[targetEntity, sourceEntity] : [sourceEntity, targetEntity];

	/* If one of the entities is being created,
	update that new entity's name to replace "New Entity" */
	if (typeof baseEntityBBID === 'undefined') {
		const defaultAliasPath = ['defaultAlias', 'name'];
		const thisEntityName = _.get(thisEntity, defaultAliasPath);
		const baseEntityName = _.get(baseEntity, defaultAliasPath);
		if (thisEntityName !== baseEntityName) {
			_.set(thisEntity, defaultAliasPath, baseEntityName);
		}
	}
	const attributes = _.get(initRelationship, ['attributes']);
	const attributePosition = getInitAttribute(attributes, 1);
	const attributeNumber = getInitAttribute(attributes, 2);

	const searchFormatOtherEntity = otherEntity && {
		id: _.get(otherEntity, ['bbid']),
		text: _.get(
			otherEntity, ['defaultAlias', 'name'], '(unnamed)'
		),
		type: _.get(otherEntity, ['type']),
		value: _.get(otherEntity, ['bbid'])
	};

	return {
		attributeNumber,
		attributePosition,
		attributeSetId: _.get(initRelationship, ['attributeSetId']),
		attributes,
		isAdded: true,
		isRemoved: false,
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

	handleNumberAttributeChange = ({target}) => {
		const value = target.value === '' ? null : target.value;
		const attributeNumber = {
			attributeType: 2,
			value: {textValue: value}
		};
		this.setState({
			attributeNumber
		});
	};

	handleAdd = () => {
		const {onAdd} = this.props;
		if (onAdd) {
			if (this.state.relationship) {
				const {relationship} = this.state;
				// Before adding a relationship, set all the attributes state value
				// (ex: number, position etc) to attributes property of the relationship object.
				relationship.attributes = setAttribute(this.state, this.state.relationshipType.attributeTypes);
				onAdd(relationship);
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
		const {targetEntity} = this.state;
		const types = getValidOtherEntityTypes(relationshipTypes, baseEntity);
		if (!types.length) {
			return null;
		}
		const typesForDisplay = types.map(_.startCase);
		const lastType = _.last(typesForDisplay);
		const otherTypes = _.join(typesForDisplay.slice(0, -1), ', ');
		const label =
			`Other Entity (${otherTypes.length ? `${otherTypes} or ` : ''}${lastType})`;

		const link = targetEntity ? getEntityLink({bbid: targetEntity.id, type: targetEntity.type}) : '';
		const openButton = (
			<Button
				disabled={!targetEntity}
				href={link}
				rel="noreferrer noopener"
				target="_blank"
				title="Open in a new tab"
				variant="info"
			>
				<FontAwesomeIcon icon={faExternalLinkAlt}/>
			</Button>
		);
		const bbid = this.props.baseEntity?.bbid;
		// Filter out Series of a different entityType than the current entity.
		// This ensures we don't add an entity of type X to a Series of entityType Y.
		// For Example, a Work cannot be added to an Author Series.
		const filterDifferentTypeSeries = (entity) => (entity.type === 'Series' ? baseEntity.type === entity.entityType : true);
		const additionalFilters = [filterDifferentTypeSeries];
		return (
			<EntitySearchFieldOption
				bbid={bbid}
				buttonAfter={openButton}
				cache={false}
				className="Select"
				filters={additionalFilters}
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

	getOptionValue(option) {
		return option.selectedId;
	}

	renderRelationshipSelect() {
		const {baseEntity, relationshipTypes} = this.props;

		const otherEntity = {
			bbid: _.get(this.state, ['targetEntity', 'id']),
			defaultAlias: {
				name: _.get(this.state, ['targetEntity', 'text'])
			},
			disambiguation: _.get(this.state, ['targetEntity', 'disambiguation']),
			type: _.get(this.state, ['targetEntity', 'type'])
		};

		const relationships:_Relationship[] = generateRelationshipSelection(
			relationshipTypes, baseEntity, otherEntity
		);
		if (baseEntity.type === 'Series') {
			// When the base entity is Series, we need to remove relationshipType 70 - 74.
			// As these relationships will be added via the series editor,
			// we don't want to show them in the relationship modal.
			_.remove(relationships, (relationship) => relationship.relationshipType.id > 69 && relationship.relationshipType.id < 75);
		}

		// The attribute types belonging to the relationship type
		const attributeTypes = this.state.relationshipType ? this.state.relationshipType.attributeTypes : null;
		let attributes = [];
		if (attributeTypes) {
			// Name of the attribute type belonging to the relationship type. EX: ['position', 'number]
			attributes = attributeTypes.map(attribute => attribute.name);
		}
		return (
			<Form.Group>
				<Form.Label>Relationship</Form.Label>
				<ReactSelect
					classNamePrefix="react-select"
					components={{Option: RelationshipSelect, SingleValue: RelationshipSelect}}
					getOptionValue={this.getOptionValue}
					isDisabled={!this.state.targetEntity}
					name="relationshipType"
					options={relationships}
					value={this.state.relationship}
					onChange={this.handleRelationshipTypeChange}
				/>
				{this.state.relationshipType &&
					<Form.Text muted>
						{this.state.relationshipType.description}
					</Form.Text>
				}
				{
					attributes.includes('number') ?
						<NumberAttribute
							value={this.state.attributeNumber?.value?.textValue}
							onHandleChange={this.handleNumberAttributeChange}
						/> :
						null
				}
			</Form.Group>
		);
	}

	render() {
		const {onCancel, onClose, baseEntity} = this.props;
		const baseEntityTypeForDisplay = _.startCase(baseEntity.type);
		const submitDisabled = this.calculateProgressAmount() < 100;
		const entitySelect = this.renderEntitySelect();

		// If there are no possible relationships for this entity type,
		// display a helpful message instead of empty selects
		if (entitySelect === null) {
			return (
				<Modal show size="lg" onHide={onClose}>
					<Modal.Header>
						<Modal.Title>Add a relationship</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<p>
							<strong>
								{baseEntityTypeForDisplay}s have no possible relationships with other entities at the moment.
							</strong>
						</p>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="danger" onClick={onCancel}>Cancel</Button>
					</Modal.Footer>
				</Modal>
			);
		}

		return (
			<Modal show size="lg" onHide={onClose} onKeyUp={this.handleKeyPress}>
				<Modal.Header>
					<Modal.Title>Add a relationship</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>
						<strong>
							Use this form to add links between this{' '}
							{baseEntityTypeForDisplay}
							{' '}and other entities.
						</strong>
						{' '}For example, you can link an author
						to a work, or a work to another work
						to show translation or derivation.
					</p>
					<hr/>
					<Row>
						<Col lg={{offset: 1, span: 10}}>
							<div>
								<div>
									{entitySelect}
								</div>
								<div>
									{this.renderRelationshipSelect()}
								</div>
							</div>
						</Col>
					</Row>
				</Modal.Body>
				<Modal.Footer>
					<Container fluid>
						<Row>
							<Col lg={{offset: 1, span: 10}}>
								<ProgressBar
									now={this.calculateProgressAmount()}
									variant="success"
								/>
							</Col>
						</Row>
					</Container>
					<Button variant="danger" onClick={onCancel}>
						<FontAwesomeIcon icon={faTimes}/>
						<span>&nbsp;Cancel</span>
					</Button>
					<Button
						disabled={submitDisabled}
						variant="success"
						onClick={this.handleAdd}
					>
						<FontAwesomeIcon icon={faPlus}/>
						<span>&nbsp;Add</span>
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}

export default RelationshipModal;
