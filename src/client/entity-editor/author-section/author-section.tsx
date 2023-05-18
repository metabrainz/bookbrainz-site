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


import * as React from 'react';

import {
	Action,
	debouncedUpdateBeginDate,
	debouncedUpdateEndDate,
	updateBeginArea,
	updateEndArea,
	updateEnded,
	updateGender,
	updateType
} from './actions';
import {Col, Form, Row} from 'react-bootstrap';
import {isNullDate, labelsForAuthor} from '../../helpers/utils';
import {
	validateAuthorSectionBeginDate,
	validateAuthorSectionEndDate
} from '../validators/author';

import DateField from '../common/new-date-field';
import type {Dispatch} from 'redux';

import EntitySearchFieldOption from '../common/entity-search-field-option';
import type {Map} from 'immutable';
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
	disambiguation: string | null | undefined,
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
	onBeginAreaChange: (arg: Area | null | undefined) => unknown,
	onBeginDateChange: (arg: string) => unknown,
	onEndAreaChange: (arg: Area | null | undefined) => unknown,
	onEndDateChange: (arg: string) => unknown,
	onEndedChange: (arg: React.FormEvent<any>) => unknown,
	onGenderChange: (obj: {value: number} | null) => unknown,
	onTypeChange: (obj: {value: number} | null) => unknown
};

type OwnProps = {
	authorTypes: Array<AuthorType>,
	genderOptions: Array<GenderOptions>,
	isUnifiedForm?: boolean
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
	isUnifiedForm,
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
	const genderOption = genderOptionsForDisplay.filter((el) => el.value === genderValue);
	const authorTypesForDisplay = authorTypes.map((type) => ({
		label: type.label,
		value: type.id
	}));
	const typeOption = authorTypesForDisplay.filter((el) => el.value === typeValue);
	const currentAuthorType = typeValue ? authorTypes.find(type => type.id === typeValue) : {id: 1, label: 'Person'};

	const {isValid: isValidDob, errorMessage: dobError} = validateAuthorSectionBeginDate(beginDateValue);
	const {isValid: isValidDod, errorMessage: dodError} = validateAuthorSectionEndDate(beginDateValue, endDateValue, currentAuthorType.label);
	const heading = <h2>What else do you know about the Author?</h2>;
	const lgCol = {offset: 3, span: 6};
	if (isUnifiedForm) {
		lgCol.offset = 0;
	}
	return (
		<div>
			{!isUnifiedForm && heading}
			<p className="text-muted">
				All fields optional — leave something blank if you don&rsquo;t
				know it
			</p>
			<Row>
				<Col lg={lgCol}>
					<Form.Group>
						<Form.Label>Type</Form.Label>
						<Select
							isClearable
							classNamePrefix="react-select"
							instanceId="authorType"
							options={authorTypesForDisplay}
							value={typeOption}
							onChange={onTypeChange}
						/>
					</Form.Group>
				</Col>
			</Row>
			<Row>
				<Col lg={lgCol}>
					<Form.Group className={genderShow ? null : 'd-none'}>
						<Form.Label>Gender</Form.Label>
						<Select
							classNamePrefix="react-select"
							instanceId="gender"
							isClearable="true"
							options={genderOptionsForDisplay}
							value={genderOption}
							onChange={onGenderChange}
						/>
					</Form.Group>
				</Col>
			</Row>
			<Row>
				<Col lg={lgCol}>
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
				<Col lg={lgCol}>
					<EntitySearchFieldOption
						instanceId="beginArea"
						label={beginAreaLabel}
						type="area"
						value={beginAreaValue}
						onChange={onBeginAreaChange}
					/>
				</Col>
			</Row>
			<div className={!isUnifiedForm && 'text-center'}>
				<Form.Check
					defaultChecked={endedChecked}
					label={endedLabel}
					type="checkbox"
					onChange={onEndedChange}
				/>
			</div>
			{endedChecked &&
				<div>
					<Row>
						<Col lg={lgCol}>
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
						<Col lg={lgCol}>
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
		</div>
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
			dispatch(updateEnded((event.target as any).checked)),
		onGenderChange: (value) =>
			dispatch(updateGender(value && value.value)),
		onTypeChange: (value) =>
			dispatch(updateType(value && value.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorSection);
