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
import {Action, updateType} from './actions';
import {Col, Form, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import AuthorCreditSection from '../author-credit-editor/author-credit-section';

import type {Dispatch} from 'redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import {connect} from 'react-redux';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';


type EditionGroupType = {
	label: string,
	id: number
};

type StateProps = {
	typeValue: Map<string, any>
};

type DispatchProps = {
	onTypeChange: (obj: {value: number} | null) => unknown
};

type OwnProps = {
	editionGroupTypes: Array<EditionGroupType>,
	isUnifiedForm?: boolean,
	isLeftAlign?:boolean
};

type Props = StateProps & DispatchProps & OwnProps;

/**
 * Container component. The EditionGroupSection component contains input fields
 * specific to the editionGroup entity. The intention is that this component is
 * rendered as a modular section within the entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.editionGroupTypes - The list of possible types for a
 *        editionGroup.
 * @param {number} props.typeValue - The type currently selected for the
 *        editionGroup.
 * @param {Function} props.onTypeChange - A function to be called when
 *        a different publisher type is selected.
 * @returns {ReactElement} React element containing the rendered
 *          EditionGroupSection.
 */
function EditionGroupSection({
	editionGroupTypes,
	typeValue,
	isUnifiedForm,
	isLeftAlign,
	onTypeChange
}: Props) {
	const editionGroupTypesForDisplay = editionGroupTypes.map((type) => ({
		label: type.label,
		value: type.id
	}));
	const typeOption = editionGroupTypesForDisplay.filter((el) => el.value === typeValue);
	const tooltip = <Tooltip>Physical format of the Edition Group</Tooltip>;
	const heading = <h2>What else do you know about the Edition Group?</h2>;
	const lgCol = {offset: 3, span: 6};
	if (isUnifiedForm) {
		lgCol.offset = 0;
	}
	return (
		<div>
			{!isUnifiedForm && heading}
			<AuthorCreditSection isLeftAlign={isLeftAlign} type="editionGroup"/>
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
							instanceId="editionGroupType"
							options={editionGroupTypesForDisplay}
							value={typeOption}
							onChange={onTypeChange}
						/>
					</Form.Group>
				</Col>
			</Row>
		</div>
	);
}
EditionGroupSection.displayName = 'EditionGroupSection';
EditionGroupSection.defaultProps = {
	isLeftAlign: false,
	isUnifiedForm: false
};

function mapStateToProps(rootState): StateProps {
	const state = rootState.get('editionGroupSection');

	return {
		typeValue: state.get('type')
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onTypeChange: (value) => dispatch(updateType(value && value.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(EditionGroupSection);
