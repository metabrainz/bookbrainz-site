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


type PublicationType = {
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
	publicationTypes: Array<PublicationType>
};

type Props = StateProps & DispatchProps & OwnProps;

/**
 * Container component. The PublicationSection component contains input fields
 * specific to the publication entity. The intention is that this component is
 * rendered as a modular section within the entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.publicationTypes - The list of possible types for a
 *        publication.
 * @param {number} props.typeValue - The type currently selected for the
 *        publication.
 * @param {Function} props.onTypeChange - A function to be called when
 *        a different publisher type is selected.
 * @returns {ReactElement} React element containing the rendered
 *          PublicationSection.
 */
function PublicationSection({
	publicationTypes,
	typeValue,
	onTypeChange
}: Props) {
	const publicationTypesForDisplay = publicationTypes.map((type) => ({
		label: type.label,
		value: type.id
	}));

	return (
		<form>
			<h2>
				What else do you know about the Publication?
			</h2>
			<p className="text-muted">
				All fields optional — leave something blank if you don&rsquo;t
				know it
			</p>
			<Row>
				<Col md={6} mdOffset={3}>
					<CustomInput
						label="Type"
						tooltipText="Physical format of the Publication"
					>
						<Select
							instanceId="publicationType"
							options={publicationTypesForDisplay}
							value={typeValue}
							onChange={onTypeChange}
						/>
					</CustomInput>
				</Col>
			</Row>
		</form>
	);
}
PublicationSection.displayName = 'PublicationSection';

function mapStateToProps(rootState): StateProps {
	const state = rootState.get('publicationSection');

	return {
		typeValue: state.get('type')
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onTypeChange: (value) => dispatch(updateType(value && value.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicationSection);
