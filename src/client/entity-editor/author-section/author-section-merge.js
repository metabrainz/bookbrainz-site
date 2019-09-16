/* eslint-disable complexity */
/*
 * Copyright (C) 2016  Ben Ockmore
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
// import * as moment from 'moment';
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
import {Checkbox, Col, Row} from 'react-bootstrap';
import {
	validateAuthorSectionBeginDate,
	validateAuthorSectionEndDate
} from '../validators/author';

import CustomInput from '../../input';
import DateField from '../common/new-date-field';
import Entity from '../common/entity';
import type {Map} from 'immutable';
import MergeField from '../common/merge-field';
import React from 'react';
import Select from 'react-select';
import {connect} from 'react-redux';


type AuthorType = {
	label: string,
	id: number
};

type Area = {
	disambiguation: ?string,
	id: string | number,
	text: string,
	type: string
};


type StateProps = {
	beginAreaLabel: string,
	beginAreaValue: Map<string, any>,
	beginDateLabel: string,
	beginDateValue: string,
	endAreaLabel: string,
	endAreaValue: Map<string, any>,
	endDateLabel: string,
	endDateValue: string,
	endedChecked: boolean,
	endedLabel: string,
	entities: Array<Object>,
	genderShow: boolean,
	genderValue: number,
	typeValue: number
};

type DispatchProps = {
	onBeginAreaChange: (?Area) => mixed,
	onBeginDateChange: (SyntheticInputEvent<>) => mixed,
	onEndAreaChange: (?Area) => mixed,
	onEndDateChange: (SyntheticInputEvent<>) => mixed,
	onEndedChange: (SyntheticInputEvent<>) => mixed,
	onGenderChange: ({value: number} | null) => mixed,
	onTypeChange: ({value: number} | null) => mixed
};

type OwnProps = {
	authorTypes: Array<AuthorType>
};

type Props = StateProps & DispatchProps & OwnProps;


/**
 * Container component. The AuthorSectionMerge component contains input fields
 * specific to the author entity. The intention is that this component is
 * rendered as a modular section within the entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.beginDateLabel - The label to be used for the begin
 *        date input.
 * @param {string} props.beginDateValue - The begin date currently set for
 *        this author.
 * @param {Array} props.authorTypes - The list of possible types for a author.
 * @param {string} props.endDateLabel - The label to be used for the end date
 *        input.
 * @param {string} props.endDateValue - The end date currently set for this
 *        author.
 * @param {boolean} props.endedChecked - Whether or not the ended checkbox
 *        is checked.
 * @param {string} props.endedLabel - The label to be used for the ended
 *        checkbox input.
 * @param {Array} props.genderOptions - The list of possible genders.
 * @param {boolean} props.genderShow - Whether or not the gender field should
 *        be shown (only for authors which represent people).
 * @param {number} props.genderValue - The ID of the gender currently selected.
 * @param {number} props.typeValue - The ID of the type currently selected for
 *        the author.
 * @param {Function} props.onBeginDateChange - A function to be called when
 *        the begin date is changed.
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
	authorTypes,
	endAreaLabel,
	endAreaValue,
	endDateLabel,
	endDateValue,
	endedChecked,
	endedLabel,
	entities,
	genderShow,
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
	const authorTypesForDisplay = authorTypes.map((type) => ({
		label: type.label,
		value: type.id
	}));

	const typeOptions = [];
	const genderOptions = [];
	const beginDateOptions = [];
	const beginAreaOptions = [];
	const endDateOptions = [];
	const endAreaOptions = [];
	const endedOptions = [];

	entities.forEach(entity => {
		const matchingType = authorTypes
			.filter(type => type.id === entity.typeId);
		const typeOption = matchingType[0] && {label: matchingType[0].label, value: matchingType[0].id};
		if (typeOption && !_.find(typeOptions, ['value', typeOption.value])) {
			typeOptions.push(typeOption);
		}
		const gender = !_.isNil(entity.gender) && {label: entity.gender.name, value: entity.gender.id};
		if (gender && !_.find(genderOptions, ['value', gender.value])) {
			genderOptions.push(gender);
		}
		const beginDate = !_.isNil(entity.beginDate) && {label: entity.beginDate, value: entity.beginDate};
		if (beginDate && !_.find(beginDateOptions, ['value', beginDate.value])) {
			beginDateOptions.push(beginDate);
		}
		// const beginArea = !_.isNil(entity.beginArea) && {label: entity.beginArea.name,
		// value: Object.assign({}, entity.beginArea, {value: entity.beginArea.id})};
		// if (beginArea && !_.find(beginAreaOptions, ['value', beginArea.value])) {
		// 	beginAreaOptions.push(beginArea);
		// }
		if (entity.beginArea && !_.find(beginAreaOptions, ['id', entity.beginArea.id])) {
			beginAreaOptions.push(entity.beginArea);
		}

		const ended = !_.isNil(entity.ended) && {label: entity.ended ? 'Yes' : 'No', value: entity.ended};
		if (ended && !_.find(endedOptions, ['value', ended.value])) {
			endedOptions.push(ended);
		}
		const endDate = !_.isNil(entity.endDate) && {label: entity.endDate, value: entity.endDate};
		if (endDate && !_.find(endDateOptions, ['value', endDate.value])) {
			endDateOptions.push(endDate);
		}
		const endArea = !_.isNil(entity.endArea) && {label: entity.endArea.name, value: entity.endArea};
		if (endArea && !_.find(endAreaOptions, ['value', endArea.value])) {
			endAreaOptions.push(endArea);
		}
	});

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
				currentValue={beginDateValue}
				label={beginDateLabel}
				options={beginDateOptions}
				onChange={onBeginDateChange}
			/>
			<MergeField
				currentValue={beginAreaValue}
				label={beginAreaLabel}
				options={beginAreaOptions}
				valueProperty="name"
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
						currentValue={endDateValue}
						label={endDateLabel}
						options={endDateOptions}
						onChange={onEndDateChange}
					/>
					<MergeField
						currentValue={endAreaValue}
						label={endAreaLabel}
						options={endAreaOptions}
						onChange={onEndAreaChange}
					/>
				</React.Fragment>
			}
		</form>
	);
}
AuthorSectionMerge.displayName = 'AuthorSectionMerge';

function mapStateToProps(rootState, {authorTypes}: OwnProps): StateProps {
	const state = rootState.get('authorSection');

	const typeValue = state.get('type');
	const personType = authorTypes.find((type) => type.label === 'Person');
	if (!personType) {
		throw new Error('there should be a person with label "Person"');
	}
	const singular = typeValue === personType.id;

	const beginDateLabel = !singular ? 'Date founded' : 'Date of birth';
	const beginAreaLabel = !singular ? 'Place founded' : 'Place of birth';
	const endedLabel = !singular ? 'Dissolved?' : 'Died?';
	const endDateLabel = !singular ? 'Date of dissolution' : 'Date of death';
	const endAreaLabel = !singular ? 'Place of dissolution' : 'Place of death';

	return {
		beginAreaLabel,
		beginAreaValue: state.get('beginArea'),
		beginDateLabel,
		beginDateValue: state.get('beginDate'),
		endAreaLabel,
		endAreaValue: state.get('endArea'),
		endDateLabel,
		endDateValue: state.get('endDate'),
		endedChecked: state.get('ended'),
		endedLabel,
		genderShow: singular,
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
		onEndDateChange: (dateString: moment) =>
			dispatch(debouncedUpdateEndDate(dateString)),
		onEndedChange: (event) =>
			dispatch(updateEnded(event.value)),
		onGenderChange: (value) =>
			dispatch(updateGender(value && value.value)),
		onTypeChange: (value) =>
			dispatch(updateType(value && value.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorSectionMerge);
