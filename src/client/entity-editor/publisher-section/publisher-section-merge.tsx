/*
 * Copyright (C) 2019  Nicolas Pelletier
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

import {
	Action,
	debouncedUpdateBeginDate,
	debouncedUpdateEndDate,
	updateArea,
	updateEnded,
	updateType
} from './actions';
import {entityToOption, transformISODateForSelect} from '../../helpers/entity';
import {
	validatePublisherSectionBeginDate,
	validatePublisherSectionEndDate
} from '../validators/publisher';

import type {Dispatch} from 'redux';
import EntitySelect from '../common/entity-select';
import LinkedEntitySelect from '../common/linked-entity-select';
import type {Map} from 'immutable';
import MergeField from '../common/merge-field';
import _ from 'lodash';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';


type Area = {
	disambiguation: string | null | undefined,
	id: string | number,
	text: string,
	type: string
};


type StateProps = {
	areaValue: Map<string, any>,
	beginDateValue: string,
	endDateValue: string,
	endedChecked: boolean,
	typeValue: number
};

type DispatchProps = {
	onAreaChange: (arg: Area | null | undefined) => unknown,
	onBeginDateChange: (arg: string) => unknown,
	onEndDateChange: (arg: string) => unknown,
	onEndedChange: (arg: boolean) => unknown,
	onTypeChange: (value: number | null) => unknown
};

type OwnProps = {
	mergingEntities: any[],
};

type Props = StateProps & DispatchProps & OwnProps;

/**
 * Container component. The PublisherSectionMerge component contains input fields
 * specific to the publisher entity. The intention is that this component is
 * rendered as a modular section within the entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Map<string, any>} props.areaValue - The area currently set for this
 *        publisher.
 * @param {string} props.beginDateValue - The begin date currently set for
 *        this publisher.
 * @param {string} props.endDateValue - The end date currently set for this
 *        publisher.
 * @param {boolean} props.endedChecked - Whether or not the ended checkbox
 *        is checked.
 * @param {Array} props.mergingEntities - The list of entities being merged
 * @param {number} props.typeValue - The ID of the type currently selected for
 *        the publisher.
 * @param {Function} props.onAreaChange - A function to be called when a
 *        different area is selected.
 * @param {Function} props.onBeginDateChange - A function to be called when
 *        the begin date is changed.
 * @param {Function} props.onEndDateChange - A function to be called when
 *        the end date is changed.
 * @param {Function} props.onEndedChange - A function to be called when
 *        the ended checkbox is toggled.
 * @param {Function} props.onTypeChange - A function to be called when
 *        a different publisher type is selected.
 * @returns {ReactElement} React element containing the rendered
 *          PublisherSectionMerge.
 */
function PublisherSectionMerge({
	areaValue,
	beginDateValue,
	endDateValue,
	endedChecked,
	mergingEntities,
	typeValue,
	onAreaChange,
	onBeginDateChange,
	onEndDateChange,
	onEndedChange,
	onTypeChange
}: Props) {
	const areaOptions = [];
	const typeOptions = [];
	const beginDateOptions = [];
	const endDateOptions = [];
	const endedOptions = [];

	mergingEntities.forEach(entity => {
		const typeOption = entity.publisherType && {label: entity.publisherType.label, value: entity.publisherType.id};
		if (typeOption && !_.find(typeOptions, ['value', typeOption.value])) {
			typeOptions.push(typeOption);
		}
		const area = !_.isNil(entity.area) && {label: entity.area.name, value: entityToOption(entity.area)};
		if (area && !_.find(areaOptions, ['value.id', area.value.id])) {
			areaOptions.push(area);
		}
		const beginDate = !_.isNil(entity.beginDate) && transformISODateForSelect(entity.beginDate);
		if (beginDate && !_.find(beginDateOptions, ['value', beginDate.value])) {
			beginDateOptions.push(beginDate);
		}
		const ended = !_.isNil(entity.ended) && {label: entity.ended ? 'Yes' : 'No', value: entity.ended};
		if (ended && !_.find(endedOptions, ['value', ended.value])) {
			endedOptions.push(ended);
		}
		const endDate = !_.isNil(entity.endDate) && transformISODateForSelect(entity.endDate);
		if (endDate && !_.find(endDateOptions, ['value', endDate.value])) {
			endDateOptions.push(endDate);
		}
	});

	const formattedBeginDateValue = transformISODateForSelect(beginDateValue);
	const formattedEndDateValue = endedChecked ? transformISODateForSelect(endDateValue) : '';

	const {isValid: isValidBeginDate, errorMessage: errorMessageBeginDate} = validatePublisherSectionBeginDate(beginDateValue);
	const {isValid: isValidEndDate, errorMessage: errorMessageEndDate} = validatePublisherSectionEndDate(beginDateValue, endDateValue, endedChecked);

	return (
		<div>
			<MergeField
				currentValue={typeValue}
				label="Type"
				options={typeOptions}
				onChange={onTypeChange}
			/>
			<MergeField
				components={{Option: LinkedEntitySelect, SingleValue: EntitySelect}}
				currentValue={areaValue}
				label="Area"
				options={areaOptions}
				onChange={onAreaChange}
			/>
			<MergeField
				currentValue={formattedBeginDateValue}
				error={!isValidBeginDate}
				errorMessage={errorMessageBeginDate}
				label="Date Founded"
				options={beginDateOptions}
				onChange={onBeginDateChange}
			/>
			<MergeField
				currentValue={endedChecked}
				label="Dissolved?"
				options={endedOptions}
				onChange={onEndedChange}
			/>
			{endedChecked &&
				<MergeField
					currentValue={formattedEndDateValue}
					error={!isValidEndDate}
					errorMessage={errorMessageEndDate}
					label="Date Dissolved"
					options={endDateOptions}
					onChange={onEndDateChange}
				/>
			}
		</div>
	);
}
PublisherSectionMerge.displayName = 'PublisherSectionMerge';

function mapStateToProps(rootState): StateProps {
	const state = rootState.get('publisherSection');

	return {
		areaValue: convertMapToObject(state.get('area')),
		beginDateValue: state.get('beginDate'),
		endDateValue: state.get('endDate'),
		endedChecked: state.get('ended'),
		typeValue: convertMapToObject(state.get('type'))
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onAreaChange: (value) => dispatch(updateArea(value)),
		onBeginDateChange: (beginDate) => {
			dispatch(debouncedUpdateBeginDate(beginDate));
		},
		onEndDateChange: (endDate) =>
			dispatch(debouncedUpdateEndDate(endDate)),
		onEndedChange: (value) =>
			dispatch(updateEnded(value)),
		onTypeChange: (value) =>
			dispatch(updateType(value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(PublisherSectionMerge);
