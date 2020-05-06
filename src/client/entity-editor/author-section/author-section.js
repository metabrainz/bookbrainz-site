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
import {isNullDate, labelsForAuthor} from '../../helpers/utils';
import {
	validateAuthorSectionBeginDate,
	validateAuthorSectionEndDate
} from '../validators/author';

import CustomInput from '../../input';
import DateField from '../common/new-date-field';

import EntitySearchFieldOption from '../common/entity-search-field-option';
import type {Map} from 'immutable';
import React from 'react';
import Select from 'react-select';
import {connect} from 'react-redux';


type AuthorType = {
	label: string,
	id: number
};

type GenderOptions = {
	name: string,
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
	authorTypes: Array<AuthorType>,
	genderOptions: Array<GenderOptions>
};

export type Props = StateProps & DispatchProps & OwnProps;

/**
 * Container component. The AuthorSection component contains input fields
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
 * @returns {ReactElement} React element containing the rendered AuthorSection.
 */
function AuthorSection({
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
	genderOptions,
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
	const genderOptionsForDisplay = genderOptions.map((gender) => ({
		label: gender.name,
		value: gender.id
	}));

	const authorTypesForDisplay = authorTypes.map((type) => ({
		label: type.label,
		value: type.id
	}));

	const currentAuthorType = typeValue ? authorTypes.find(type => type.id === typeValue) : {id: 1, label: 'Person'};

	const {isValid: isValidDob, errorMessage: dobError} = validateAuthorSectionBeginDate(beginDateValue);
	const {isValid: isValidDod, errorMessage: dodError} = validateAuthorSectionEndDate(beginDateValue, endDateValue, currentAuthorType.label);


	return (
		<form>
			<h2>
				What else do you know about the Author?
			</h2>
			<p className="text-muted">
				All fields optional — leave something blank if you don&rsquo;t
				know it
			</p>
			<Row>
				<Col md={6} mdOffset={3}>
					<CustomInput label="Type">
						<Select
							instanceId="authorType"
							options={authorTypesForDisplay}
							value={typeValue}
							onChange={onTypeChange}
						/>
					</CustomInput>
				</Col>
			</Row>
			<Row>
				<Col md={6} mdOffset={3}>
					<CustomInput
						groupClassName={genderShow || 'hidden'}
						label="Gender"
					>
						<Select
							instanceId="gender"
							options={genderOptionsForDisplay}
							value={genderValue}
							onChange={onGenderChange}
						/>
					</CustomInput>
				</Col>
			</Row>
			<Row>
				<Col md={6} mdOffset={3}>
					<DateField
						show
						defaultValue={beginDateValue}
						empty={isNullDate(beginDateValue)}
						error={!isValidDob}
						errorMessage={dobError}
						label={beginDateLabel}
						onChangeDate={onBeginDateChange}
					/>
				</Col>
			</Row>
			<Row>
				<Col md={6} mdOffset={3}>
					<EntitySearchFieldOption
						instanceId="beginArea"
						label={beginAreaLabel}
						type="area"
						value={beginAreaValue}
						onChange={onBeginAreaChange}
					/>
				</Col>
			</Row>
			<div className="text-center">
				<Checkbox
					defaultChecked={endedChecked}
					onChange={onEndedChange}
				>
					{endedLabel}
				</Checkbox>
			</div>
			{endedChecked &&
				<div>
					<Row>
						<Col md={6} mdOffset={3}>
							<DateField
								show
								defaultValue={endDateValue}
								empty={isNullDate(endDateValue)}
								error={!isValidDod}
								errorMessage={dodError}
								label={endDateLabel}
								onChangeDate={onEndDateChange}
							/>
						</Col>
					</Row>
					<Row>
						<Col md={6} mdOffset={3}>
							<EntitySearchFieldOption
								instanceId="endArea"
								label={endAreaLabel}
								type="area"
								value={endAreaValue}
								onChange={onEndAreaChange}
							/>
						</Col>
					</Row>
				</div>
			}
		</form>
	);
}
AuthorSection.displayName = 'AuthorSection';

function mapStateToProps(rootState, {authorTypes}: OwnProps): StateProps {
	const state = rootState.get('authorSection');

	const typeValue = state.get('type');
	const personType = authorTypes.find((type) => type.label === 'Person');
	const groupType = authorTypes.find((type) => type.label === 'Group');
	if (!personType) {
		throw new Error('there should be an author type with label "Person"');
	}
	if (!groupType) {
		throw new Error('there should be an author type with label "Group"');
	}
	const isGroup = typeValue === groupType.id;

	const {
		beginDateLabel,
		beginAreaLabel,
		endedLabel,
		endDateLabel,
		endAreaLabel
	} = labelsForAuthor(isGroup);

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
		genderShow: !isGroup,
		genderValue: state.get('gender'),
		typeValue
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onBeginAreaChange: (value) => dispatch(updateBeginArea(value)),
		onBeginDateChange: (beginDate) =>
			dispatch(debouncedUpdateBeginDate(beginDate)),
		onEndAreaChange: (value) => dispatch(updateEndArea(value)),
		onEndDateChange: (endDate) =>
			dispatch(debouncedUpdateEndDate(endDate)),
		onEndedChange: (event) =>
			dispatch(updateEnded(event.target.checked)),
		onGenderChange: (value) =>
			dispatch(updateGender(value && value.value)),
		onTypeChange: (value) =>
			dispatch(updateType(value && value.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorSection);
