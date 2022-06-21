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
import AuthorCreditSection from '../author-credit-editor/author-credit-section';
import {Action, updateType} from './actions';
import {Col, Form, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';

import type {Dispatch} from 'redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import type {Map} from 'immutable';
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
	editionGroupTypes: Array<EditionGroupType>
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
	onTypeChange
}: Props) {
	const editionGroupTypesForDisplay = editionGroupTypes.map((type) => ({
		label: type.label,
		value: type.id
	}));
	const typeOption = editionGroupTypesForDisplay.filter((el) => el.value === typeValue);
	const tooltip = <Tooltip>Physical format of the Edition Group</Tooltip>;

	return (
		<div>
			<h2>
				What else do you know about the Edition Group?
			</h2>
			<AuthorCreditSection/>
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
