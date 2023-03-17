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

import * as React from 'react';
import {Action, updateOrderType, updateSeriesType} from './actions';
import {getEntityKey, getEntityTable} from '../../helpers/utils';
import type {Dispatch} from 'redux';
import type {Map} from 'immutable';
import MergeField from '../common/merge-field';
import {find as _find} from 'lodash';
import {connect} from 'react-redux';


type StateProps = {
	orderTypeValue: Map<string, any>,
	seriesTypeValue: string
};

type DispatchProps = {
	onOrderTypeChange: (value: number | null) => unknown,
    onSeriesTypeChange: (value: string) => unknown
};

type OwnProps = {
	mergingEntities: any[]
};

type Props = StateProps & DispatchProps & OwnProps;

/**
 * Container component. The SeriesSectionMerge component contains input fields
 * specific to merging series entities. The intention is that this component is
 * rendered as a modular section within the entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.orderTypeValue - The order type currently selected for
 * 		  the series.
 * @param {string} props.seriesTypeValue - The entity type currently selected for
 * 		  the series.
 * @param {Array} props.mergingEntities - The list of entities being merged
 * @param {Function} props.onOrderTypeChange - A function to be called when
 *        a different series order type is selected.
 * @param {Function} props.onSeriesTypeChange - A function to be called when
 *        a different series entity type is selected.
 * @returns {ReactElement} React element containing the rendered
 *        SeriesSectionMerge.
 */
function SeriesSectionMerge({
	orderTypeValue,
	seriesTypeValue,
	mergingEntities,
	onOrderTypeChange,
	onSeriesTypeChange
}: Props) {
	const seriesOrderingTypeOptions = [];
	const seriesTypeOptions = [];
	const relationships = [];

	mergingEntities.forEach(entity => {
		const seriesOrderingTypeOption = entity.seriesOrderingType && {label: entity.seriesOrderingType.label, value: entity.seriesOrderingType.id};
		if (seriesOrderingTypeOption && !_find(seriesOrderingTypeOptions, ['value', seriesOrderingTypeOption.value])) {
			seriesOrderingTypeOptions.push(seriesOrderingTypeOption);
		}
		const seriesTypeOption = entity.entityType;
		if (seriesTypeOption && !_find(seriesTypeOptions, ['value', seriesTypeOption])) {
			seriesTypeOptions.push({
				label: seriesTypeOption,
				value: seriesTypeOption
			});
		}
		relationships.push(...entity.relationships);
	});

	// Filter out series items from relationships
	const seriesItems = relationships.filter((relationship) => relationship.typeId > 69 && relationship.typeId < 75);
	const formattedSeriesItems = seriesItems.map((item) => (
		{...item.source, displayNumber: true,
			number: item.number,
			position: item.position}
	));
	const EntityTable = getEntityTable(seriesTypeValue);
	const entityKey = getEntityKey(seriesTypeValue);
	const propsForTable = {
		[entityKey]: formattedSeriesItems,
		showAdd: false,
		showAddedAtColumn: false,
		showCheckboxes: false
	};

	return (
		<div>
			<MergeField
				currentValue={orderTypeValue}
				label="Ordering Type"
				options={seriesOrderingTypeOptions}
				onChange={onOrderTypeChange}
			/>
			<MergeField
				currentValue={seriesTypeValue}
				label="Series Type"
				options={seriesTypeOptions}
				onChange={onSeriesTypeChange}
			/>
			<EntityTable {...propsForTable}/>
		</div>
	);
}
SeriesSectionMerge.displayName = 'SeriesSectionMerge';

function mapStateToProps(rootState): StateProps {
	const state = rootState.get('seriesSection');

	return {
		orderTypeValue: state.get('orderType'),
		seriesTypeValue: state.get('seriesType')
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onOrderTypeChange: (value: number) => dispatch(updateOrderType(value)),
		onSeriesTypeChange: (value: string) => dispatch(updateSeriesType(value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(SeriesSectionMerge);
