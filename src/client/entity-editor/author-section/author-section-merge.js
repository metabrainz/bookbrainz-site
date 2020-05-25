/* eslint-disable complexity */
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

// @flow
import * as _ from 'lodash';

import {
	type Action,
	debouncedUpdateBeginDate,
	debouncedUpdateEndDate,
	updateBeginArea,
	updateEndArea,
	updateEnded,
	updateGender,
	updateType
} from './actions';


import {convertMapToObject, labelsForAuthor} from '../../helpers/utils';
import {entityToOption, transformISODateForSelect} from '../../helpers/entity';
import Entity from '../common/entity';
import LinkedEntity from '../common/linked-entity';
import MergeField from '../common/merge-field';
import {Props} from './author-section';
import React from 'react';
import {connect} from 'react-redux';


type OwnProps = {
	mergingEntities: Array
};

/**
 * Container component. The AuthorSectionMerge component contains input fields
 * specific to the author entity. The intention is that this component is
 * rendered as a modular section within the entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.beginAreaLabel - The label to be used for the begin
 *        area input.
 * @param {string} props.beginDateLabel - The label to be used for the begin
 *        date input.
 * @param {string} props.beginDateValue - The begin date currently set for
 *        this author.
 * @param {string} props.beginAreaValue - The begin area currently set for
 *        this author.
 * @param {string} props.endAreaLabel - The label to be used for the end area
 *        input.
 * @param {string} props.endAreaValue - The end area currently set for this
 *        author.
 * @param {string} props.endDateLabel - The label to be used for the end date
 *        input.
 * @param {string} props.endDateValue - The end date currently set for this
 *        author.
 * @param {boolean} props.endedChecked - Whether or not the ended checkbox
 *        is checked.
 * @param {string} props.endedLabel - The label to be used for the ended
 *        checkbox input.
 * @param {Array} props.mergingEntities - The list of entities being merged
 * @param {number} props.genderValue - The ID of the gender currently selected.
 * @param {number} props.typeValue - The ID of the type currently selected for
 *        the author.
 * @param {Function} props.onBeginAreaChange - A function to be called when
 *        the begin area is changed.
 * @param {Function} props.onBeginDateChange - A function to be called when
 *        the begin date is changed.
 * @param {Function} props.onEndAreaChange - A function to be called when
 *        the end area is changed.
 * @param {Function} props.onEndDateChange - A function to be called when
 *        the end date is changed.
 * @param {Function} props.onEndedChange - A function to be called when
 *        the ended checkbox is toggled.
 * @param {Function} props.onGenderChange - A function to be called when
 *        a different gender is selected.
 * @param {Function} props.onTypeChange - A function to be called when
 *        a different author type is selected.
 * @returns {ReactElement} React element containing the rendered AuthorSectionMerge.
 */
function AuthorSectionMerge({
	beginAreaLabel,
	beginDateLabel,
	beginDateValue,
	beginAreaValue,
	endAreaLabel,
	endAreaValue,
	endDateLabel,
	endDateValue,
	endedChecked,
	endedLabel,
	mergingEntities,
	genderValue,
	typeValue,
	onBeginAreaChange,
	onBeginDateChange,
	onEndAreaChange,
	onEndDateChange,
	onEndedChange,
	onGenderChange,
	onTypeChange
}: Props) {
	const beginAreaOptions = [];
	const beginDateOptions = [];
	const endAreaOptions = [];
	const endDateOptions = [];
	const endedOptions = [];
	const genderOptions = [];
	const typeOptions = [];

	mergingEntities.forEach(entity => {
		const typeOption = !_.isNil(entity.authorType) && {label: entity.authorType.label, value: entity.authorType.id};
		if (typeOption && !_.find(typeOptions, ['value', typeOption.value])) {
			typeOptions.push(typeOption);
		}
		const gender = !_.isNil(entity.gender) && {label: entity.gender.name, value: entity.gender.id};
		if (gender && !_.find(genderOptions, ['value', gender.value])) {
			genderOptions.push(gender);
		}
		const beginDate = !_.isNil(entity.beginDate) && transformISODateForSelect(entity.beginDate);
		if (beginDate && !_.find(beginDateOptions, ['value', beginDate.value])) {
			beginDateOptions.push(beginDate);
		}
		const beginArea = !_.isNil(entity.beginArea) && {label: entity.beginArea.name, value: entityToOption(entity.beginArea)};
		if (beginArea && !_.find(beginAreaOptions, ['value.id', beginArea.value.id])) {
			beginAreaOptions.push(beginArea);
		}

		const ended = !_.isNil(entity.ended) && {label: entity.ended ? 'Yes' : 'No', value: entity.ended};
		if (ended && !_.find(endedOptions, ['value', ended.value])) {
			endedOptions.push(ended);
		}
		const endDate = !_.isNil(entity.endDate) && transformISODateForSelect(entity.endDate);
		if (endDate && !_.find(endDateOptions, ['value', endDate.value])) {
			endDateOptions.push(endDate);
		}
		const endArea = !_.isNil(entity.endArea) && {label: entity.endArea.name, value: entityToOption(entity.endArea)};
		if (endArea && !_.find(endAreaOptions, ['value.id', endArea.value.id])) {
			endAreaOptions.push(endArea);
		}
	});

	const formattedBeginDateValue = transformISODateForSelect(beginDateValue);
	const formattedEndDateValue = transformISODateForSelect(endDateValue);

	return (
		<form>
			<MergeField
				currentValue={typeValue}
				label="Type"
				options={typeOptions}
				onChange={onTypeChange}
			/>
			<MergeField
				currentValue={genderValue}
				label="Gender"
				options={genderOptions}
				onChange={onGenderChange}
			/>
			<MergeField
				currentValue={formattedBeginDateValue}
				label={beginDateLabel}
				options={beginDateOptions}
				onChange={onBeginDateChange}
			/>
			<MergeField
				currentValue={beginAreaValue}
				label={beginAreaLabel}
				optionComponent={LinkedEntity}
				options={beginAreaOptions}
				valueRenderer={Entity}
				onChange={onBeginAreaChange}
			/>
			<MergeField
				currentValue={endedChecked}
				label={endedLabel}
				options={endedOptions}
				onChange={onEndedChange}
			/>
			{endedChecked &&
				<React.Fragment>
					<MergeField
						currentValue={formattedEndDateValue}
						label={endDateLabel}
						options={endDateOptions}
						onChange={onEndDateChange}
					/>
					<MergeField
						currentValue={endAreaValue}
						label={endAreaLabel}
						optionComponent={LinkedEntity}
						options={endAreaOptions}
						valueRenderer={Entity}
						onChange={onEndAreaChange}
					/>
				</React.Fragment>
			}
		</form>
	);
}
AuthorSectionMerge.displayName = 'AuthorSectionMerge';

export function mapStateToProps(rootState, {mergingEntities}: OwnProps): StateProps {
	const state = rootState.get('authorSection');

	const typeValue = state.get('type');

	const authorTypes = mergingEntities.map(entity => entity.authorType);

	const isGroup = _.uniqBy(authorTypes, 'id').find((type) => type && type.label === 'Group');

	const {
		beginDateLabel,
		beginAreaLabel,
		endedLabel,
		endDateLabel,
		endAreaLabel
	} = labelsForAuthor(Boolean(isGroup));

	return {
		beginAreaLabel,
		beginAreaValue: convertMapToObject(state.get('beginArea')),
		beginDateLabel,
		beginDateValue: state.get('beginDate'),
		endAreaLabel,
		endAreaValue: convertMapToObject(state.get('endArea')),
		endDateLabel,
		endDateValue: state.get('endDate'),
		endedChecked: state.get('ended'),
		endedLabel,
		genderValue: state.get('gender'),
		typeValue
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onBeginAreaChange: (value) => dispatch(updateBeginArea(value)),
		onBeginDateChange: (dateString) =>
			dispatch(debouncedUpdateBeginDate(dateString)),
		onEndAreaChange: (value) => dispatch(updateEndArea(value)),
		onEndDateChange: (dateString) =>
			dispatch(debouncedUpdateEndDate(dateString)),
		onEndedChange: (value) =>
			dispatch(updateEnded(value)),
		onGenderChange: (value) =>
			dispatch(updateGender(value)),
		onTypeChange: (value) =>
			dispatch(updateType(value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorSectionMerge);
