/*
 * Copyright (C) 2017  Ben Ockmore
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

import * as moment from 'moment';

import {
	type Action,
	debouncedUpdateBeginDate,
	debouncedUpdateEndDate,
	updateArea,
	updateEnded,
	updateType
} from './actions';
import {Checkbox, Col, Row} from 'react-bootstrap';
import {
	validatePublisherSectionBeginDate,
	validatePublisherSectionEndDate
} from '../validators/publisher';

import CustomInput from '../../input';
import DateField from '../common/date-field';
import EntitySearchField from '../common/entity-search-field';
import type {Map} from 'immutable';
import React from 'react';
import Select from 'react-select';
import {connect} from 'react-redux';

type PublisherType = {
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
	areaValue: Map<string, any>,
	beginDateValue: string,
	endDateValue: string,
	endedChecked: boolean,
	typeValue: number
};

type DispatchProps = {
	onAreaChange: (?Area) => mixed,
	onBeginDateChange: (SyntheticInputEvent<>) => mixed,
	onEndDateChange: (SyntheticInputEvent<>) => mixed,
	onEndedChange: (SyntheticInputEvent<>) => mixed,
	onTypeChange: ({value: number} | null) => mixed
};

type OwnProps = {
	publisherTypes: Array<PublisherType>
};

type Props = StateProps & DispatchProps & OwnProps;

/**
 * Container component. The CreatorSection component contains input fields
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
 * @param {Array} props.publisherTypes - The list of possible types for a
 *        publisher.
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
 *          PublisherSection.
 */
function PublisherSection({
	areaValue,
	beginDateValue,
	endDateValue,
	endedChecked,
	publisherTypes,
	typeValue,
	onAreaChange,
	onBeginDateChange,
	onEndDateChange,
	onEndedChange,
	onTypeChange
}: Props) {
	const publisherTypesForDisplay = publisherTypes.map((type) => ({
		label: type.label,
		value: type.id
	}));

	return (
		<form>
			<h2>
				What else do you know about the Publisher?
			</h2>
			<p className="text-muted">
				All fields optional — leave something blank if you don&rsquo;t
				know it
			</p>
			<Row>
				<Col md={6} mdOffset={3}>
					<CustomInput label="Type">
						<Select
							instanceId="publisherType"
							options={publisherTypesForDisplay}
							value={typeValue}
							onChange={onTypeChange}
						/>
					</CustomInput>
				</Col>
			</Row>
			<Row>
				<Col md={6} mdOffset={3}>
					<EntitySearchField
						instanceId="area"
						label="Area"
						tooltipText="Country or place the publisher is registered in"
						type="area"
						value={areaValue}
						onChange={onAreaChange}
					/>
				</Col>
			</Row>
			<Row>
				<Col md={6} mdOffset={3}>
					<DateField
						show
						defaultValue={beginDateValue}
						empty={!beginDateValue}
						error={
							!validatePublisherSectionBeginDate(beginDateValue)
						}
						label="Date Founded"
						placeholder="YYYY-MM-DD"
						onChange={onBeginDateChange}
					/>
				</Col>
			</Row>
			<div className="text-center">
				<Checkbox
					defaultChecked={endedChecked}
					onChange={onEndedChange}
				>
					Dissolved?
				</Checkbox>
			</div>
			{endedChecked &&
				<div>
					<Row>
						<Col md={6} mdOffset={3}>
							<DateField
								defaultValue={endDateValue}
								empty={!endDateValue}
								error={!validatePublisherSectionEndDate(
									beginDateValue, endDateValue
								)}
								label="Date Dissolved"
								placeholder="YYYY-MM-DD"
								onChange={onEndDateChange}
							/>
						</Col>
					</Row>
				</div>
			}
		</form>
	);
}
PublisherSection.displayName = 'PublisherSection';

function mapStateToProps(rootState): StateProps {
	const state = rootState.get('publisherSection');

	return {
		areaValue: state.get('area'),
		beginDateValue: state.get('beginDate'),
		endDateValue: state.get('endDate'),
		endedChecked: state.get('ended'),
		typeValue: state.get('type')
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onAreaChange: (value) => dispatch(updateArea(value)),
		onBeginDateChange: (momentDate: moment) => {
			dispatch(debouncedUpdateBeginDate(momentDate.format('YYYY-MM-DD')));
		},
		onEndDateChange: (momentDate: moment) =>
			dispatch(debouncedUpdateEndDate(momentDate.format('YYYY-MM-DD'))),
		onEndedChange: (event) =>
			dispatch(updateEnded(event.target.checked)),
		onTypeChange: (value) =>
			dispatch(updateType(value && value.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(PublisherSection);
