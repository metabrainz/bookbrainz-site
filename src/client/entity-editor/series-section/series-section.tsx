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
import {Action, addSeriesItem, editSeriesItem, removeSeriesItem, updateOrderType, updateSeriesType} from './actions';
import {Col, Row} from 'react-bootstrap';
import type {Entity, EntityType, RelationshipForDisplay, RelationshipType, Relationship as _Relationship} from '../relationship-editor/types';
import CustomInput from '../../input';
import type {Dispatch} from 'redux';
import Select from 'react-select';
import SeriesEditor from './series-editor';
import _ from 'lodash';
import {connect} from 'react-redux';


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


};

type OwnProps = {
	entity: Entity,
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
 * @param {Array} props.seriesOrderingTypes - The list of possible ordering
 * 		  types for a series.
 * @param {number} props.orderTypeValue - The ID of the ordering type currently selected for
 *        the series.
 * @param {string} props.seriesTypeValue - The value of the entity type currently selected for
 *        the series.
 * @param {Immutable.List<any>[]} props.relationships - The list of relationships conatined by
 * 		  the series.
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
	onEdit,
	onOrderTypeChange,
	onRemove,
	onSeriesItemAdd,
	onSeriesTypeChange,
	orderTypeValue,
	relationshipTypes,
	seriesItems,
	seriesOrderingTypes,
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

	const seriesOrderingTypesForDisplay = seriesOrderingTypes.map((type) => ({
		label: type.label,
		value: type.id
	}));
	const seriesTypesForDisplay = ['Author', 'Work', 'Edition', 'EditionGroup', 'Publisher'].map((type) => ({
		label: type,
		value: type
	}));
	return (
		<div>
			<h2>
				What else do you know about the Series?
			</h2>
			<p className="text-muted">
				All fields are mandatory — select the option from dropdown
			</p>
			<Row>
				<Col md={6} mdOffset={3}>
					<CustomInput
						label="Ordering Type"
						tooltipText="Ordering Type of the Series Entity"
					>
						<Select
							backspaceRemoves={false}
							clearable={false}
							deleteRemoves={false}
							instanceId="seriesOrderingType"
							options={seriesOrderingTypesForDisplay}
							value={orderTypeValue}
							onChange={onOrderTypeChange}
						/>
					</CustomInput>
					<CustomInput label="Series Type" tooltipText="Entity Type of the Series">
						<Select
							backspaceRemoves={false}
							clearable={false}
							deleteRemoves={false}
							disabled={Boolean(seriesItemsArray.length)}
							instanceId="SeriesType"
							options={seriesTypesForDisplay}
							value={seriesTypeValue}
							onChange={onSeriesTypeChange}
						/>
					</CustomInput>
				</Col>
			</Row>
			<SeriesEditor
				baseEntity={baseEntity}
				relationshipTypes={relationshipTypes}
				seriesItemsArray={seriesItemsArray}
				seriesType={seriesTypeValue}
				onAdd={onSeriesItemAdd}
				onEdit={onEdit}
				onRemove={onRemove}
			/>
		</div>
	);
}
SeriesSection.displayName = 'SeriesSection';

function mapStateToProps(rootState): StateProps {
	const state = rootState.get('seriesSection');

	return {
		entityName: rootState.getIn(['nameSection', 'name']),
		orderTypeValue: state.get('orderType'),
		seriesItems: state.get('seriesItems'),
		seriesTypeValue: state.get('seriesType')
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onEdit: (data, rowID) => dispatch(editSeriesItem(data, rowID)),
		onOrderTypeChange: (value) => dispatch(updateOrderType(value && value.value)),
		onRemove: (rowID) => dispatch(removeSeriesItem(rowID)),
		onSeriesItemAdd: (data) => dispatch(addSeriesItem(data)),
		onSeriesTypeChange: (value) => dispatch(updateSeriesType(value && value.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(SeriesSection);
