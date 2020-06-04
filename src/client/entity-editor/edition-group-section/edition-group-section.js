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

import {type Action, updateType} from './actions';
import {Col, Row} from 'react-bootstrap';

import CustomInput from '../../input';
import type {Map} from 'immutable';
import React from 'react';
import Select from 'react-select';
import {connect} from 'react-redux';


type EditionGroupType = {
	label: string,
	id: number
};

type StateProps = {
	typeValue: Map<string, any>
};

type DispatchProps = {
	onTypeChange: ({value: number} | null) => mixed
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

	return (
		<form>
			<h2>
				What else do you know about the Edition Group?
			</h2>
			<p className="text-muted">
				All fields optional — leave something blank if you don&rsquo;t
				know it
			</p>
			<Row>
				<Col md={6} mdOffset={3}>
					<CustomInput
						label="Type"
						tooltipText="Physical format of the Edition Group"
					>
						<Select
							instanceId="editionGroupType"
							options={editionGroupTypesForDisplay}
							value={typeValue}
							onChange={onTypeChange}
						/>
					</CustomInput>
				</Col>
			</Row>
		</form>
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
