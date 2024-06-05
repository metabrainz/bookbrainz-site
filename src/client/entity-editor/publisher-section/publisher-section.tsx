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

import * as React from 'react';

import {
	Action,
	debouncedUpdateBeginDate,
	debouncedUpdateEndDate,
	updateArea,
	updateEnded,
	updateType
} from './actions';
import {Col, Form, Row} from 'react-bootstrap';
import {
	validatePublisherSectionBeginDate,
	validatePublisherSectionEndDate
} from '../validators/publisher';

import DateField from '../common/new-date-field';
import type {Dispatch} from 'redux';
import EntitySearchFieldOption from '../common/entity-search-field-option';
import type {Map} from 'immutable';
import Select from 'react-select';
import {connect} from 'react-redux';
import {isNullDate} from '../../helpers/utils';


type PublisherType = {
	label: string,
	id: number
};

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
	onEndedChange: (arg: React.FormEvent<any>) => unknown,
	onTypeChange: (obj: {value: number} | null) => unknown
};

type OwnProps = {
	publisherTypes: Array<PublisherType>,
	isUnifiedForm?: boolean
};

type Props = StateProps & DispatchProps & OwnProps;

/**
 * Container component. The PublisherSection component contains input fields
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
	isUnifiedForm,
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
	const typeOption = publisherTypesForDisplay.filter((el) => el.value === typeValue);
	const {isValid: isValidBeginDate, errorMessage: errorMessageBeginDate} = validatePublisherSectionBeginDate(beginDateValue);
	const {isValid: isValidEndDate, errorMessage: errorMessageEndDate} = validatePublisherSectionEndDate(beginDateValue, endDateValue, endedChecked);
	const heading = <h2>What else do you know about the Publisher?</h2>;
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
							instanceId="publisherType"
							options={publisherTypesForDisplay}
							value={typeOption}
							onChange={onTypeChange}
						/>
					</Form.Group>
				</Col>
			</Row>
			<Row>
				<Col lg={lgCol}>
					<EntitySearchFieldOption
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
				<Col lg={lgCol}>
					<DateField
						show
						defaultValue={beginDateValue}
						empty={isNullDate(beginDateValue)}
						error={!isValidBeginDate}
						errorMessage={errorMessageBeginDate}
						label="Date Founded"
						placeholder="YYYY-MM-DD"
						onChangeDate={onBeginDateChange}
					/>
				</Col>
			</Row>
			<div className={`${!isUnifiedForm && 'text-center'}`}>
				<Form.Check
					defaultChecked={endedChecked}
					label="Dissolved?"
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
								error={!isValidEndDate}
								errorMessage={errorMessageEndDate}
								label="Date Dissolved"
								placeholder="YYYY-MM-DD"
								onChangeDate={onEndDateChange}
							/>
						</Col>
					</Row>
				</div>
			}
		</div>
	);
}
PublisherSection.displayName = 'PublisherSection';
PublisherSection.defaultProps = {
	isUnifiedForm: false
};

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
		onBeginDateChange: (beginDate) => {
			dispatch(debouncedUpdateBeginDate(beginDate));
		},
		onEndDateChange: (endDate) =>
			dispatch(debouncedUpdateEndDate(endDate)),
		onEndedChange: (event) =>
			dispatch(updateEnded((event.target as any).checked)),
		onTypeChange: (value) =>
			dispatch(updateType(value && value.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(PublisherSection);
