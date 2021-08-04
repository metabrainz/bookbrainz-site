/*
 * Copyright (C) 2021  Akash Gupta
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
/* eslint-disable react/jsx-no-bind */


import type {
	Attribute, Entity, EntityType, RelationshipForDisplay,
	RelationshipType, Relationship as _Relationship
} from '../relationship-editor/types';
import {Button, Col, Row} from 'react-bootstrap';
import React, {useState} from 'react';
import {faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import EntitySearchFieldOption from '../common/entity-search-field-option';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Relationship from '../relationship-editor/relationship';
import _ from 'lodash';
import {generateRelationshipSelection} from '../relationship-editor/relationship-editor';


type EntitySearchResult = {
	text: string,
	id: string,
	value: string | number,
	type: EntityType
};

type SeriesItemsProps = {
	baseEntity: Entity,
	onAdd: (_Relationship) => unknown,
    onEdit: (Attribute, string) => unknown,
    onRemove: (string) => unknown,
    relationshipTypes: Array<RelationshipType>,
    seriesItemsArray: RelationshipForDisplay[],
    seriesType: string
};


/**
 * This is a simple React component. No Redux connection. Renders the
 * Entity Search Field and displays the list of series items. The Entity Search
 * Field is a simple search box that allows the user to search for entities, and the Add
 * Button allows the user to add the entity. The remove button allows to
 * remove a entity from the list.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Entity} props.baseEntity - The entity currently being edited in the
 *        entity editor
 * @param {Array<RelationshipType>} props.relationshipTypes - All the possible
 *        relationship types for any pair of entities.
 * @param {string} props.seriesType - Enity type of the series.
 * @param {Function} props.onRemove - A function to be called when the Remove
 *        button is clicked.
 * @param {Function} props.onEdit - A function to be called when attribute values is
 *        modified.
 * @param {Function} props.onAdd - A function to be called when the add button
 *        is clicked.
 * @param {Array} props.seriesItemsArray - The list of entities.
 *
 * @returns {ReactElement} React Component as a modular section within the entity editor.
 *
 */
function SeriesEditor({baseEntity, relationshipTypes, seriesType, onRemove, onAdd, onEdit, seriesItemsArray}:SeriesItemsProps) {
	const [seriesItem, setSeriesItem] = useState(null);
	const [targetEntity, setTargetEntity] = useState(null);

	const handleEntityChange = (value: EntitySearchResult) => {
		setTargetEntity(value);
		// Convert "value" of type EntitySearchResult to type Entity
		const otherEntity = {
			bbid: _.get(value, 'id'),
			defaultAlias: {
				name: _.get(value, 'text')
			},
			disambiguation: _.get(value, 'disambiguation'),
			type: _.get(value, 'type')
		};
		const relationships = generateRelationshipSelection(
			relationshipTypes, baseEntity, otherEntity
		);
		if (relationships.length) {
			// Filter out relationship type 70 - 74
			const filterRelationships = relationships.filter(relationship =>
				relationship.relationshipType.id > 69 && relationship.relationshipType.id < 75);
			setSeriesItem(filterRelationships[0]);
		}
	};

	const handleAdd = () => {
		if (onAdd && targetEntity) {
			// Set attributes value before adding the entity
			seriesItem.attributes = [{attributeType: 1, value: {textValue: null}}, {attributeType: 2, value: {textValue: null}}];
			if (seriesItem) {
				onAdd(seriesItem);
				// After adding the entity, clear the Entity Search Field by setting targetEntity to null.
				setTargetEntity(null);
			}
		}
	};

	const handleNumberAttributeChange = (rowID, {target}) => {
		const value = target.value === '' ? null : target.value;
		const attributeNumber = {
			attributeType: 2,
			value: {textValue: value}
		};
		const attributePosition = {
			attributeType: 1,
			value: {textValue: null}
		};
		onEdit([attributePosition, attributeNumber], rowID);
	};
	return (
		<div>
			<h2>What {seriesType}s are part of this Series?</h2>
			{seriesItemsArray.length ?
				<>
					{seriesItemsArray.map((value) => (
						<Row className="margin-top-d5" key={`${value.rowID}`}>
							<Col className="text-right" md={1}/>
							<Col md={2}>
								<input
									className="form-control"
									type="text"
									value={_.find(value.attributes, {attributeType: 2})?.value.textValue || ''}
									onChange={handleNumberAttributeChange.bind(this, value.rowID)}
								/>
							</Col>
							<Col md={7}>
								<Relationship
									link
									contextEntity={baseEntity}
									relationshipType={value.relationshipType}
									sourceEntity={value.sourceEntity}
									targetEntity={value.targetEntity}
								/>
							</Col>
							<Col md={2}>
								<Button
									bsStyle="danger"
									role="button"
									onClick={onRemove.bind(this, value.rowID)}
								>
									<FontAwesomeIcon icon={faTimes}/>
									<span>&nbsp;Remove</span>
								</Button>
							</Col>
						</Row>
					))
					}
				</> : null
			}
			<Row className="margin-top-d8">
				<Col className="text-right" md={3}>
					<p className="margin-top-d5">Add an entity to the series:</p>
				</Col>
				<Col md={7} style={{marginTop: -22}}>
					<EntitySearchFieldOption
						instanceId="entitySearchField"
						name="entity"
						type={[seriesType]}
						value={targetEntity}
						onChange={handleEntityChange}
					/>
				</Col>
				<Col md={2}>
					<Button bsStyle="success" onClick={handleAdd}>
						<FontAwesomeIcon icon={faPlus}/>
						<span>&nbsp;Add {seriesType}</span>
					</Button>
				</Col>
			</Row>
		</div>
	);
}
SeriesEditor.displayName = 'SeriesEditor';

export default SeriesEditor;

