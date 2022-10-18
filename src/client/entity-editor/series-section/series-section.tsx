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


import * as Immutable from 'immutable';
import * as React from 'react';
import {Action, addSeriesItem, editSeriesItem, removeSeriesItem, sortSeriesItems, updateOrderType, updateSeriesType} from './actions';
import {Col, Form, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import type {Entity, EntityType, RelationshipForDisplay, RelationshipType} from '../relationship-editor/types';
import type {Dispatch} from 'redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import SeriesEditor from './series-editor';
import _ from 'lodash';
import {attachAttribToRelForDisplay} from '../helpers';
import {connect} from 'react-redux';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';
import {sortRelationshipOrdinal} from '../../../common/helpers/utils';


type SeriesOrderingType = {
	label: string,
	id: number
};

type StateProps = {
	entityName: string
	orderTypeValue: number,
	seriesItems: Immutable.List<any>,
	seriesTypeValue: string
};


type DispatchProps = {
	onEdit: (obj, number) => unknown,
	onRemove: (number) => unknown,
	onOrderTypeChange: (obj: {value: number}) => unknown,
	onSeriesTypeChange: (obj: {value: string}) => unknown,
	onSeriesItemAdd: (_Relationship) => unknown,
	onSortSeriesItems: (_setPosition) => unknown

};

type OwnProps = {
	hideItemSelect?:boolean,
	entity: Entity,
	isUnifiedForm?: boolean,
	entityType: EntityType,
	seriesOrderingTypes: Array<SeriesOrderingType>,
	relationshipTypes: Array<RelationshipType>,
};

type Props = StateProps & DispatchProps & OwnProps;

/**
 * Container component. The SeriesSection component contains input fields
 * specific to the series entity. The intention is that this component is
 * rendered as a modular section within the entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.entity - The entity being edited.
 * @param {string} props.entityName - The name of the entity being edited.
 * @param {string} props.entityType - The type of the entity being edited.
 * @param {Function} props.onEdit - The function to call when the user clicks
 * 		  on the edit button.
 * @param {Function} props.onRemove - The function to call when the user clicks
 * 		  on the remove button.
 * @param {Function} props.onSeriesItemAdd - The function to call when the user clicks
 * 		  on the add button.
 * @param {number} props.orderTypeValue - The ID of the ordering type currently selected for
 *        the series.
 * @param {Array} props.seriesOrderingTypes - The list of possible ordering
 * 		  types for a series.
 * @param {Object} props.seriesItems - The list of series items currently in the series.
 * @param {Object} props.relationshipTypes - The list of possible relationship types.
 * @param {string} props.seriesTypeValue - The value of the entity type currently selected for
 *        the series.
 * @param {Function} props.onOrderTypeChange - A function to be called when
 *        a different ordering type is selected.
 * @param {Function} props.onSeriesTypeChange - A function to be called when
 *        a different series type is selected.
 * @returns {ReactElement} React element containing the rendered
 *        SeriesSection.
 */
function SeriesSection({
	entity,
	entityName,
	entityType,
	hideItemSelect,
	onEdit,
	onOrderTypeChange,
	onRemove,
	onSeriesItemAdd,
	onSeriesTypeChange,
	onSortSeriesItems,
	orderTypeValue,
	relationshipTypes,
	seriesItems,
	seriesOrderingTypes,
	isUnifiedForm,
	seriesTypeValue
}: Props) {
	const baseEntity = {
		bbid: _.get(entity, 'bbid'),
		defaultAlias: {
			name: entityName
		},
		disambiguation: _.get(entity, ['disambiguation', 'comment']),
		type: _.upperFirst(entityType)
	};
	const seriesItemsObject = seriesItems.toJS();

	/* If one of the relationships is to a new entity (in creation),
	update that new entity's name to replace "New Entity" */
	if (typeof baseEntity.bbid === 'undefined') {
		_.forEach(seriesItemsObject, relationship => {
			const {sourceEntity, targetEntity} = relationship;
			const defaultAliasPath = ['defaultAlias', 'name'];
			const newEntity = [sourceEntity, targetEntity].find(({bbid}) => bbid === baseEntity.bbid);
			const newRelationshipName = newEntity && _.get(newEntity, defaultAliasPath);
			const baseEntityName = _.get(baseEntity, defaultAliasPath);
			if (newRelationshipName !== baseEntityName) {
				_.set(newEntity, defaultAliasPath, baseEntityName);
			}
		});
	}
	const seriesItemsArray: Array<RelationshipForDisplay> = Object.values(seriesItemsObject);
	attachAttribToRelForDisplay(seriesItemsArray);
	// Sort the series items according to the ordering type before displaying
	if (orderTypeValue === 2) {
		seriesItemsArray.sort(sortRelationshipOrdinal('position'));
	}
	else {
		seriesItemsArray.sort(sortRelationshipOrdinal('number'));
	}
	const seriesOrderingTypesForDisplay = seriesOrderingTypes.map((type) => ({
		label: type.label,
		value: type.id
	}));
	const orderTypeOption = seriesOrderingTypesForDisplay.filter((el) => el.value === orderTypeValue);

	const seriesTypesForDisplay = ['Author', 'Work', 'Edition', 'EditionGroup', 'Publisher'].map((type) => ({
		label: type,
		value: type
	}));
	const seriesTypeOption = seriesTypesForDisplay.filter((el) => el.value === seriesTypeValue);
	const orderingTooltip = (
		<Tooltip>
		Ordering Type of the Series Entity
		</Tooltip>
	);
	const seriesTypeTooltip = (
		<Tooltip>
		Entity Type of the Series
		</Tooltip>
	);
	const heading = <h2>What else do you know about the Series?</h2>;
	const lgCol = {offset: 3, span: 6};
	if (isUnifiedForm) {
		lgCol.offset = 0;
	}
	return (
		<div>
			{!isUnifiedForm && heading}
			{!hideItemSelect &&
			<p className="text-muted">
				All fields are mandatory — select the option from dropdown
			</p>}
			<Row>
				<Col lg={lgCol}>
					<Form.Group>
						<Form.Label>
							Ordering Type
							<OverlayTrigger delay={50} overlay={orderingTooltip}>
								<FontAwesomeIcon
									className="margin-left-0-5"
									icon={faQuestionCircle}
								/>
							</OverlayTrigger>
						</Form.Label>
						<Select
							backspaceRemovesValue={false}
							classNamePrefix="react-select"
							instanceId="seriesOrderingType"
							isClearable={false}
							options={seriesOrderingTypesForDisplay}
							value={orderTypeOption}
							onChange={onOrderTypeChange}
						/>
					</Form.Group>
					{!isUnifiedForm &&
					<Form.Group>
						<Form.Label>
							Series Type
							<OverlayTrigger delay={50} overlay={seriesTypeTooltip}>
								<FontAwesomeIcon
									className="margin-left-0-5"
									icon={faQuestionCircle}
								/>
							</OverlayTrigger>
						</Form.Label>
						<Select
							backspaceRemovesValue={false}
							classNamePrefix="react-select"
							instanceId="SeriesType"
							isClearable={false}
							isDisabled={Boolean(seriesItemsArray.length)}
							options={seriesTypesForDisplay}
							value={seriesTypeOption}
							onChange={onSeriesTypeChange}
						/>
					</Form.Group>}
				</Col>
			</Row>
			<SeriesEditor
				baseEntity={baseEntity}
				hideItemSelect={hideItemSelect}
				isUnifiedForm={isUnifiedForm}
				orderType={orderTypeValue}
				relationshipTypes={relationshipTypes}
				seriesItemsArray={seriesItemsArray}
				seriesType={seriesTypeValue}
				onAdd={onSeriesItemAdd}
				onEdit={onEdit}
				onRemove={onRemove}
				onSort={onSortSeriesItems}
			/>
		</div>
	);
}
SeriesSection.displayName = 'SeriesSection';
SeriesSection.defaultProps = {
	hideItemSelect: false,
	isUnifiedForm: false
};

function mapStateToProps(rootState, {isUnifiedForm}): StateProps {
	const state = rootState.get('seriesSection');
	const seriesTypeValue = state.get('seriesType');
	const entityPath = isUnifiedForm ? ['Series', 's0', 'text'] : ['nameSection', 'name'];

	return {
		entityName: rootState.getIn(entityPath),
		orderTypeValue: state.get('orderType'),
		seriesItems: state.get('seriesItems'),
		seriesTypeValue
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onEdit: (data, rowID) => dispatch(editSeriesItem(data, rowID)),
		onOrderTypeChange: (value) => {
			dispatch(updateOrderType(value && value.value));
			if (value && value.value === 1) {
				dispatch(sortSeriesItems(null, null));
			}
		},
		onRemove: (rowID) => dispatch(removeSeriesItem(rowID)),
		onSeriesItemAdd: (data) => dispatch(addSeriesItem(data)),
		onSeriesTypeChange: (value) => dispatch(updateSeriesType(value && value.value)),
		onSortSeriesItems: ({oldIndex, newIndex}) => dispatch(sortSeriesItems(oldIndex, newIndex))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(SeriesSection);
