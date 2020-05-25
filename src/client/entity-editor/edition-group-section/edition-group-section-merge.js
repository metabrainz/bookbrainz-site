/*
 * Copyright (C) 2019  Nicolas Pelletier
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
import EditionTable from '../../components/pages/entities/edition-table';
import type {Map} from 'immutable';
import MergeField from '../common/merge-field';
import React from 'react';
import {find as _find} from 'lodash';
import {connect} from 'react-redux';


type StateProps = {
	typeValue: Map<string, any>
};

type DispatchProps = {
	onTypeChange: ({value: number} | null) => mixed
};

type OwnProps = {
	mergingEntities: Array
};

type Props = StateProps & DispatchProps & OwnProps;

/**
 * Container component. The EditionGroupSectionMerge component contains input fields
 * specific to merging editionGroup entities. The intention is that this component is
 * rendered as a modular section within the entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.typeValue - The type currently selected for the
 *        editionGroup.
 * @param {Array} props.mergingEntities - The list of entities being merged
 * @param {Function} props.onTypeChange - A function to be called when
 *        a different publisher type is selected.
 * @returns {ReactElement} React element containing the rendered
 *          EditionGroupSectionMerge.
 */
function EditionGroupSectionMerge({
	typeValue,
	mergingEntities,
	onTypeChange
}: Props) {
	const typeOptions = [];
	const editions = [];

	mergingEntities.forEach(entity => {
		const typeOption = entity.editionGroupType && {label: entity.editionGroupType.label, value: entity.editionGroupType.id};
		if (typeOption && !_find(typeOptions, ['value', typeOption.value])) {
			typeOptions.push(typeOption);
		}
		editions.push(...entity.editions);
	});

	return (
		<form>
			<MergeField
				currentValue={typeValue}
				label="Type"
				options={typeOptions}
				onChange={onTypeChange}
			/>
			<EditionTable
				editions={editions}
				entity={mergingEntities[0]}
				showAdd={false}
			/>
		</form>
	);
}
EditionGroupSectionMerge.displayName = 'EditionGroupSectionMerge';

function mapStateToProps(rootState): StateProps {
	const state = rootState.get('editionGroupSection');

	return {
		typeValue: state.get('type')
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onTypeChange: (value) => dispatch(updateType(value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(EditionGroupSectionMerge);
