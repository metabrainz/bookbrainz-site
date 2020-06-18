/*
 * Copyright (C) 2019 Nicolas Pelletier
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

import {
	type Action,
	updateType
} from './actions';
import type {List, Map} from 'immutable';

import CustomInput from '../../input';
import MergeField from '../common/merge-field';
import React from 'react';
import Select from 'react-select';
import {find as _find} from 'lodash';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';


type LanguageOption = {
	name: string,
	id: number
};

type OwnProps = {
	mergingEntities: Array
};

type StateProps = {
	languageValues: List<LanguageOption>,
	typeValue: number
};

type DispatchProps = {
	onTypeChange: (?{value: number}) => mixed
};

type Props = OwnProps & StateProps & DispatchProps;

/**
 * Container component. The WorkSectionMerge component contains input fields
 * specific to the work entity. The intention is that this component is
 * rendered as a modular section within the entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.languageValues - An array of concatenated languages of the merging entities
 * @param {Array} props.mergingEntities - The list of entities being merged
 * @param {number} props.typeValue - The ID of the type currently selected for
 *        the work.
 * @param {Function} props.onTypeChange - A function to be called when
 *        a different work type is selected.
 * @returns {ReactElement} React element containing the rendered WorkSectionMerge.
 */
function WorkSectionMerge({
	languageValues,
	mergingEntities,
	typeValue,
	onTypeChange
}: Props) {
	const typeOptions = [];

	mergingEntities.forEach(entity => {
		const typeOption = entity.workType && {label: entity.workType.label, value: entity.workType.id};
		if (typeOption && !_find(typeOptions, ['value', typeOption.value])) {
			typeOptions.push(typeOption);
		}
	});

	return (
		<form>
			<MergeField
				currentValue={typeValue}
				label="Type"
				options={typeOptions}
				onChange={onTypeChange}
			/>
			<CustomInput label="Languages">
				<Select
					disabled
					multi
					instanceId="languages"
					value={languageValues}
				/>
			</CustomInput>
		</form>
	);
}
WorkSectionMerge.displayName = 'WorkSectionMerge';

type RootState = Map<string, Map<string, any>>;
function mapStateToProps(rootState: RootState): StateProps {
	const state: Map<string, any> = rootState.get('workSection');

	return {
		languageValues: convertMapToObject(state.get('languages')),
		typeValue: convertMapToObject(state.get('type'))
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onTypeChange: (value: ?{value: number}) =>
			dispatch(updateType(value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkSectionMerge);
