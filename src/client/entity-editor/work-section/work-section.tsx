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
import Select, {components} from 'react-select';
import {faArrowTurnUp, faQuestionCircle} from '@fortawesome/free-solid-svg-icons';

import type {Dispatch} from 'redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import LanguageField from '../common/language-field';
import {connect} from 'react-redux';
import makeImmutable from '../common/make-immutable';


const ImmutableLanguageField = makeImmutable(LanguageField);

type WorkType = {
	label: string,
	id: number,
	description: string,
	parentId: number,
	childOrder: number,
	deprecated: boolean,
	// added for display
	depth?: number,
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
	isUnifiedForm?: boolean,
	languageOptions: Array<LanguageOption>,
	workTypes: Array<WorkType>
};

type StateProps = {
	languageValues: List<LanguageOption>,
	typeValue: number
};

type DispatchProps = {
	onLanguagesChange: (arg: Array<DisplayLanguageOption>) => unknown,
	onTypeChange: (arg: WorkType | null) => unknown
};

type Props = OwnProps & StateProps & DispatchProps;

function sortWorkTypes(
	workTypes: Array<WorkType>,
	parentId: number | null = null,
	depth = 0
) {
	const sortedArray = [];

	// Filter the array to get all the items with the specified parentId
	const children = workTypes.filter((item) => item.parentId === parentId);

	// Sort the children based on the childOrder property
	children.sort((a, b) => a.childOrder - b.childOrder);

	// Apply the current depth so we can indent them in the select
	children.forEach(type => type.depth = depth);

	// Recursively sort and append each child's descendants
	for (const child of children) {
		sortedArray.push(child);
		sortedArray.push(...sortWorkTypes(workTypes, child.id, depth + 1));
	}

	return sortedArray;
}

function workTypeSelectMenuOption(props: Select.OptionProps<WorkType, false>) {
	const {data, label} = props;
	const {depth, id, description} = data;
	let indentationClass;
	if (depth > 0) {
		indentationClass = `margin-left-d${10 * depth}`;
	}
	return (
		<components.Option {...props}>
			<OverlayTrigger
				flip delay={100}
				overlay={<Tooltip id={`tooltip-${id}`}>{description}</Tooltip>}
				placement="bottom"
			>
				<div aria-label={label} className={indentationClass} key={id}>
					{depth > 0 && <div className="hierarchy-arrow"/>}{label}
				</div>
			</OverlayTrigger>
		</components.Option>
	);
}

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
	isUnifiedForm,
	onLanguagesChange,
	onTypeChange
}: Props) {
	const languageOptionsForDisplay = languageOptions.map((language) => ({
		frequency: language.frequency,
		label: language.name,
		value: language.id
	}));
	const validWorkTypes = workTypes.filter(type => !type.deprecated);
	const workTypesForDisplay = sortWorkTypes(validWorkTypes);

	const selectedTypeOption:WorkType = workTypesForDisplay.find((el) => el.id === typeValue);
	const tooltip = (
		<Tooltip id="work-type-tooltip">
			Literary form or structure of the work
		</Tooltip>
	);
	const heading = <h2> What else do you know about the Work?</h2>;
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
							isClearable
							classNamePrefix="react-select"
							components={{Option: workTypeSelectMenuOption}}
							// eslint-disable-next-line react/jsx-no-bind
							getOptionValue={(type: WorkType) => type.id.toString()}
							instanceId="workType"
							options={workTypesForDisplay}
							value={selectedTypeOption}
							onChange={onTypeChange}
						/>
						{selectedTypeOption &&
							<Form.Text className="text-muted">
								<FontAwesomeIcon fixedWidth className="margin-right-0-3" icon={faArrowTurnUp} rotation={90}/>
								{selectedTypeOption.description}
							</Form.Text>
						}
					</Form.Group>
				</Col>
			</Row>
			<Row>
				<Col lg={lgCol}>
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
WorkSection.defaultProps = {
	isUnifiedForm: false
};
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
		onTypeChange: (value: WorkType | null) =>
			dispatch(updateType(value && value.id))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkSection);
