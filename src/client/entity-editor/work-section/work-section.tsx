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
	updateLanguages,
	updateType
} from './actions';
import {Col, Form, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import type {List, Map} from 'immutable';

import type {Dispatch} from 'redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import LanguageField from '../common/language-field';
import Select from 'react-select';
import {connect} from 'react-redux';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';
import makeImmutable from '../common/make-immutable';


const ImmutableLanguageField = makeImmutable(LanguageField);

type WorkType = {
	label: string,
	id: number
};

type LanguageOption = {
	frequency: number,
	name: string,
	id: number
};

type DisplayLanguageOption = {
	label: string,
	value: number
};

type OwnProps = {
	languageOptions: Array<LanguageOption>,
	workTypes: Array<WorkType>
};

type StateProps = {
	languageValues: List<LanguageOption>,
	typeValue: number
};

type DispatchProps = {
	onLanguagesChange: (arg: Array<DisplayLanguageOption>) => unknown,
	onTypeChange: (arg: {value: number} | null) => unknown
};

type Props = OwnProps & StateProps & DispatchProps;

/**
 * Container component. The WorkSection component contains input fields
 * specific to the work entity. The intention is that this component is
 * rendered as a modular section within the entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.workTypes - The list of possible types for a work.
 * @param {number} props.typeValue - The ID of the type currently selected for
 *        the work.
 * @param {Function} props.onTypeChange - A function to be called when
 *        a different work type is selected.
 * @returns {ReactElement} React element containing the rendered WorkSection.
 */
function WorkSection({
	languageOptions,
	languageValues,
	typeValue,
	workTypes,
	onLanguagesChange,
	onTypeChange
}: Props) {
	const languageOptionsForDisplay = languageOptions.map((language) => ({
		frequency: language.frequency,
		label: language.name,
		value: language.id
	}));

	const workTypesForDisplay = workTypes.map((type) => ({
		label: type.label,
		value: type.id
	}));
	const typeOption = workTypesForDisplay.filter((el) => el.value === typeValue);

	const tooltip = (
		<Tooltip>
			Literary form or structure of the work
		</Tooltip>
	);

	return (
		<div>
			<h2>
				What else do you know about the Work?
			</h2>
			<p className="text-muted">
				All fields optional — leave something blank if you don&rsquo;t
				know it
			</p>
			<Row>
				<Col lg={{offset: 3, span: 6}}>
					<Form.Group>
						<Form.Label>
							Type
							<OverlayTrigger delay={50} overlay={tooltip}>
								<FontAwesomeIcon
									className="margin-left-0-5"
									icon={faQuestionCircle}
								/>
							</OverlayTrigger>
						</Form.Label>
						<Select
							classNamePrefix="react-select"
							instanceId="workType"
							options={workTypesForDisplay}
							value={typeOption}
							onChange={onTypeChange}
						/>
					</Form.Group>
				</Col>
			</Row>
			<Row>
				<Col lg={{offset: 3, span: 6}}>
					<ImmutableLanguageField
						empty
						isMulti
						instanceId="language"
						options={languageOptionsForDisplay}
						tooltipText="Main language used for the content of the work"
						value={languageValues}
						onChange={onLanguagesChange}
					/>
				</Col>
			</Row>
		</div>
	);
}
WorkSection.displayName = 'WorkSection';

type RootState = Map<string, Map<string, any>>;
function mapStateToProps(rootState: RootState): StateProps {
	const state: Map<string, any> = rootState.get('workSection');

	return {
		languageValues: state.get('languages'),
		typeValue: state.get('type')
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onLanguagesChange: (values: Array<DisplayLanguageOption>) =>
			dispatch(updateLanguages(values)),
		onTypeChange: (value: {value: number} | null) =>
			dispatch(updateType(value && value.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkSection);
