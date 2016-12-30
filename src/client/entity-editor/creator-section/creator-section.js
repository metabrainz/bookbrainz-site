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

import {Col, Input, Row} from 'react-bootstrap';
import {
	updateBeginDate, updateEndDate, updateEnded, updateGender, updateType
} from './actions';
import DateField from './date-field';
import ErrorText from '../common/error-text';
import React from 'react';
import Select from 'react-select';
import SubmitButton from '../common/submit-button';
import _debounce from 'lodash.debounce';
import {connect} from 'react-redux';


function isPartialDateValid(value) {
	const ymdRegex = /^\d{4}-\d{2}-\d{2}$/;
	const ymRegex = /^\d{4}-\d{2}$/;
	const yRegex = /^\d{4}$/;

	const validSyntax = Boolean(
		ymdRegex.test(value) ||
		ymRegex.test(value) ||
		yRegex.test(value)
	);
	const validValue = !isNaN(Date.parse(value));

	return validSyntax && validValue;
}

function CreatorSection({
	beginDateLabel,
	beginDateValue,
	creatorTypes,
	endDateLabel,
	endDateValue,
	endedChecked,
	endedLabel,
	genderOptions,
	genderShow,
	genderValue,
	submissionUrl,
	typeValue,
	onBeginDateChange,
	onEndDateChange,
	onEndedChange,
	onGenderChange,
	onTypeChange
}) {
	return (
		<form>
			<h2>
				What else do you know about the Creator?
			</h2>
			<p className="text-muted">
				All fields optional — leave something blank if you don&rsquo;t
				know it
			</p>
			<Row>
				<Col md={6} mdOffset={3}>
					<Input label="Type">
						<Select
							options={creatorTypes}
							value={typeValue}
							onChange={onTypeChange}
						/>
					</Input>
				</Col>
			</Row>
			<Row>
				<Col md={6} mdOffset={3}>
					<Input
						groupClassName={genderShow || 'hidden'}
						label="Gender"
					>
						<Select
							options={genderOptions}
							value={genderValue}
							onChange={onGenderChange}
						/>
					</Input>
				</Col>
			</Row>
			<Row>
				<Col md={6} mdOffset={3}>
					<DateField
						show
						defaultValue={beginDateValue}
						empty={!beginDateValue}
						error={!isPartialDateValid(beginDateValue)}
						label={beginDateLabel}
						onChange={onBeginDateChange}
					/>
				</Col>
			</Row>
			<div className="text-center">
				<Input
					defaultChecked={endedChecked}
					label={endedLabel}
					type="checkbox"
					wrapperClassName="margin-top-0"
					onChange={onEndedChange}
				/>
			</div>
			<Row>
				<Col md={6} mdOffset={3}>
					<DateField
						defaultValue={endDateValue}
						empty={!endDateValue}
						error={!isPartialDateValid(endDateValue)}
						label={endDateLabel}
						show={endedChecked}
						onChange={onEndDateChange}
					/>
				</Col>
			</Row>
			<div className="text-center margin-top-1">
				<SubmitButton url={submissionUrl}/>
			</div>
			<div className="text-center margin-top-1">
				<ErrorText/>
			</div>
		</form>
	);
}
CreatorSection.displayName = 'CreatorSection';
CreatorSection.propTypes = {
	beginDateLabel: React.PropTypes.string,
	beginDateValue: React.PropTypes.string,
	creatorTypes: React.PropTypes.array,
	endDateLabel: React.PropTypes.string,
	endDateValue: React.PropTypes.string,
	endedChecked: React.PropTypes.bool,
	endedLabel: React.PropTypes.string,
	genderOptions: React.PropTypes.array,
	genderShow: React.PropTypes.bool,
	genderValue: React.PropTypes.number,
	submissionUrl: React.PropTypes.string,
	typeValue: React.PropTypes.number,
	onBeginDateChange: React.PropTypes.func,
	onEndDateChange: React.PropTypes.func,
	onEndedChange: React.PropTypes.func,
	onGenderChange: React.PropTypes.func,
	onTypeChange: React.PropTypes.func
};

function mapStateToProps(rootState, {creatorTypes}) {
	const state = rootState.get('creatorSection');

	const typeValue = state.get('type');
	const personType = creatorTypes.find((type) => type.label === 'Person');
	const singular = typeValue === personType.value;

	const endDateLabel = singular ? 'Date of Death' : 'Date Dissolved';
	const endedLabel = singular ? 'Died?' : 'Dissolved?';
	const beginDateLabel = singular ? 'Date of Birth' : 'Date Founded';

	return {
		beginDateLabel,
		beginDateValue: state.get('beginDate'),
		endDateLabel,
		endedLabel,
		endedChecked: state.get('ended'),
		endDateValue: state.get('endDate'),
		genderValue: state.get('gender'),
		genderShow: singular,
		typeValue
	};
}

const KEYSTROKE_DEBOUNCE_TIME = 250;
function mapDispatchToProps(dispatch, {creatorTypes}) {
	const debouncedDispatch = _debounce(dispatch, KEYSTROKE_DEBOUNCE_TIME);
	return {
		onBeginDateChange: (event) =>
			debouncedDispatch(updateBeginDate(event.target.value)),
		onEndDateChange: (event) =>
			debouncedDispatch(updateEndDate(event.target.value)),
		onEndedChange: (event) =>
			dispatch(updateEnded(event.target.checked)),
		onGenderChange: (value) =>
			dispatch(updateGender(value && value.value)),
		onTypeChange: (value) =>
			dispatch(updateType(value && value.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatorSection);
