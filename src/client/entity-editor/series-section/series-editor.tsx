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
/* eslint-disable react/jsx-no-bind, @typescript-eslint/no-invalid-this */


import {Button, Col, Row} from 'react-bootstrap';
import type {
	Entity, EntityType, RelationshipForDisplay,
	RelationshipType
} from '../relationship-editor/types';
import React, {useState} from 'react';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import {faBars, faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import EntitySearchFieldOption from '../common/entity-search-field-option';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
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
	hideItemSelect: boolean
	baseEntity: Entity,
	onAdd: (_Relationship) => unknown,
    onEdit: (Attribute, string) => unknown,
    onRemove: (string) => unknown,
	onSort: (_setPosition) => unknown,
	orderType: number,
	isUnifiedForm?: boolean,
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
 * @param {boolean} props.isUnifiedForm - Whether the series section is render inside UF.
 *
 * @returns {ReactElement} React Component as a modular section within the entity editor.
 *
 */

const SeriesListItem = ({value, baseEntity, handleNumberAttributeChange, onRemove, dragHandler, isUnifiedForm}) => (
	<Row className={`margin-top-d5 ${isUnifiedForm ? 'w-100 align-items-center' : ''}`} key={value.rowID}>
		{(!isUnifiedForm || dragHandler) &&
		<Col className="text-right form-control-static padding-left-0" lg={1}>
			{dragHandler ? <><FontAwesomeIcon icon={faBars}/> &nbsp;&nbsp;</> : null}
		</Col>}
		<Col lg={2}>
			<input
				className="form-control"
				placeholder="Enter value..."
				type="text"
				value={_.find(value.attributes, {attributeType: 2})?.value.textValue || ''}
				onChange={handleNumberAttributeChange.bind(this, value.rowID)}
			/>
		</Col>
		<Col className="form-control-static" lg={7}>
			<Relationship
				link
				contextEntity={baseEntity}
				relationshipType={value.relationshipType}
				sourceEntity={value.sourceEntity}
				targetEntity={value.targetEntity}
			/>
		</Col>
		<Col lg={2}>
			<Button
				role="button"
				variant="danger"
				onClick={onRemove.bind(this, value.rowID)}
			>
				<FontAwesomeIcon icon={faTimes}/>
				<span>&nbsp;Remove</span>
			</Button>
		</Col>
	</Row>
);

SeriesListItem.displayName = 'SeriesListItem';
SeriesListItem.propTypes = {
	baseEntity: PropTypes.object.isRequired,
	dragHandler: PropTypes.bool.isRequired,
	handleNumberAttributeChange: PropTypes.func.isRequired,
	isUnifiedForm: PropTypes.bool.isRequired,
	onRemove: PropTypes.func.isRequired,
	value: PropTypes.any.isRequired
};

const SortableItem = SortableElement(({value, onRemove, baseEntity, handleNumberAttributeChange, isUnifiedForm}) => (
	<SeriesListItem
		dragHandler
		baseEntity={baseEntity}
		handleNumberAttributeChange={handleNumberAttributeChange}
		isUnifiedForm={isUnifiedForm}
		value={value}
		onRemove={onRemove}
	/>
));

const SortableList = SortableContainer(({children}) => <div>{children}</div>);
function SeriesEditor({baseEntity, relationshipTypes, seriesType, orderType, onRemove, hideItemSelect,
	onAdd, onEdit, onSort, seriesItemsArray, isUnifiedForm}:SeriesItemsProps) {
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
				onSort({newIndex: null, oldIndex: null});
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
		onEdit(attributeNumber, rowID);
		onSort({newIndex: null, oldIndex: null});
	};
	const heading = <h2>What {seriesType}s are part of this Series?</h2>;
	const alignText = isUnifiedForm ? 'text-left' : 'text-right';
	return (
		<div>
			{!isUnifiedForm && heading}
			{seriesItemsArray.length ?
				<> {
					orderType === 1 ?
						<>
							{seriesItemsArray.map((value) => !value.isRemoved && (
								<SeriesListItem
									baseEntity={baseEntity}
									dragHandler={false}
									handleNumberAttributeChange={handleNumberAttributeChange}
									isUnifiedForm={isUnifiedForm}
									key={value.rowID}
									value={value}
									onRemove={onRemove}
								/>
							))
							}
						</> :
						<SortableList distance={1} onSortEnd={onSort}>
							{seriesItemsArray.map((value, index) => !value.isRemoved && (
								<SortableItem
									baseEntity={baseEntity}
									handleNumberAttributeChange={handleNumberAttributeChange}
									index={index}
									isUnifiedForm={isUnifiedForm}
									key={value.rowID}
									value={value}
									onRemove={onRemove}
								/>
							))}
						</SortableList>
				}
				</> : null
			}
			{!hideItemSelect &&
			<Row className="margin-top-d8">
				<Col className={alignText} lg={isUnifiedForm ? 7 : 3}>
					<p className="margin-top-d5">Add an entity to the series:</p>
				</Col>
				<Col lg={isUnifiedForm ? 6 : 7} style={{marginTop: -22}}>
					<EntitySearchFieldOption
						className="series-editor-select"
						instanceId="entitySearchField"
						name="entity"
						type={[seriesType]}
						value={targetEntity}
						onChange={handleEntityChange}
					/>
				</Col>
				<Col lg={isUnifiedForm ? 7 : 2}>
					<Button variant="success" onClick={handleAdd}>
						<FontAwesomeIcon icon={faPlus}/>
						<span>&nbsp;Add {seriesType}</span>
					</Button>
				</Col>
			</Row>
					   }
		</div>
	);
}
SeriesEditor.displayName = 'SeriesEditor';
SeriesEditor.defaultProps = {
	isUnifiedForm: false
};

export default SeriesEditor;
