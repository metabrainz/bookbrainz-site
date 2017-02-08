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
	debouncedUpdateBeginDate, debouncedUpdateEndDate, updateEnded,
	updateGender, updateType
} from './actions';
import DateField from './date-field';
import React from 'react';
import Select from 'react-select';
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

/**
 * Container component. The CreatorSection component contains input fields
 * specific to the creator entity. The intention is that this component is
 * rendered as a modular section within the entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.beginDateLabel - The label to be used for the begin
 *        date input.
 * @param {string} props.beginDateValue - The begin date currently set for
 *        this creator.
 * @param {Array} props.creatorTypes - The list of possible types for a creator.
 * @param {string} props.endDateLabel - The label to be used for the end date
 *        input.
 * @param {string} props.endDateValue - The end date currently set for this
 *        creator.
 * @param {boolean} props.endedChecked - Whether or not the ended checkbox
 *        is checked.
 * @param {string} props.endedLabel - The label to be used for the ended
 *        checkbox input.
 * @param {Array} props.genderOptions - The list of possible genders.
 * @param {boolean} props.genderShow - Whether or not the gender field should
 *        be shown (only for creators which represent people).
 * @param {number} props.genderValue - The ID of the gender currently selected.
 * @param {number} props.typeValue - The ID of the type currently selected for
 *        the creator.
 * @param {Function} props.onBeginDateChange - A function to be called when
 *        the begin date is changed.
 * @param {Function} props.onEndDateChange - A function to be called when
 *        the end date is changed.
 * @param {Function} props.onEndedChange - A function to be called when
 *        the ended checkbox is toggled.
 * @param {Function} props.onGenderChange - A function to be called when
 *        a different gender is selected.
 * @param {Function} props.onTypeChange - A function to be called when
 *        a different creator type is selected.
 * @returns {ReactElement} React element containing the rendered CreatorSection.
 */
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
		</form>
	);
}
CreatorSection.displayName = 'CreatorSection';
CreatorSection.propTypes = {
	beginDateLabel: React.PropTypes.string.isRequired,
	beginDateValue: React.PropTypes.string.isRequired,
	creatorTypes: React.PropTypes.array.isRequired,
	endDateLabel: React.PropTypes.string.isRequired,
	endDateValue: React.PropTypes.string.isRequired,
	endedChecked: React.PropTypes.bool.isRequired,
	endedLabel: React.PropTypes.string.isRequired,
	genderOptions: React.PropTypes.array.isRequired,
	genderShow: React.PropTypes.bool.isRequired,
	genderValue: React.PropTypes.number.isRequired,
	onBeginDateChange: React.PropTypes.func.isRequired,
	onEndDateChange: React.PropTypes.func.isRequired,
	onEndedChange: React.PropTypes.func.isRequired,
	onGenderChange: React.PropTypes.func.isRequired,
	onTypeChange: React.PropTypes.func.isRequired,
	typeValue: React.PropTypes.number.isRequired
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
		endDateValue: state.get('endDate'),
		endedChecked: state.get('ended'),
		endedLabel,
		genderShow: singular,
		genderValue: state.get('gender'),
		typeValue
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onBeginDateChange: (event) =>
			dispatch(debouncedUpdateBeginDate(event.target.value)),
		onEndDateChange: (event) =>
			dispatch(debouncedUpdateEndDate(event.target.value)),
		onEndedChange: (event) =>
			dispatch(updateEnded(event.target.checked)),
		onGenderChange: (value) =>
			dispatch(updateGender(value && value.value)),
		onTypeChange: (value) =>
			dispatch(updateType(value && value.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatorSection);
