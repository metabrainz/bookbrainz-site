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

import * as React from 'react';
import {Action, updateType} from './actions';
import {AuthorCredit, updateAuthorCredit} from '../author-credit-editor/actions';
import {find as _find, isNil as _isNil} from 'lodash';
import type {Dispatch} from 'redux';
import EditionTable from '../../components/pages/entities/edition-table';
import type {Map} from 'immutable';
import MergeField from '../common/merge-field';
import {authorCreditToString} from '../../helpers/entity';
import {connect} from 'react-redux';
import {convertMapToObject} from '../../helpers/utils';


type StateProps = {
	authorCreditValue: Record<string, unknown>
	typeValue: Map<string, any>
};

type DispatchProps = {
	onAuthorCreditChange: (arg: AuthorCredit) => unknown,
	onTypeChange: (value: number | null) => unknown
};

type OwnProps = {
	mergingEntities: any[]
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
	authorCreditValue,
	typeValue,
	mergingEntities,
	onAuthorCreditChange,
	onTypeChange
}: Props) {
	const authorCreditOptions = [];
	const typeOptions = [];
	const editions = [];

	mergingEntities.forEach(entity => {
		const authorCredit = !_isNil(entity.authorCredit) && {label: authorCreditToString(entity.authorCredit), value: entity.authorCredit};
		if (authorCredit && !_find(authorCreditOptions, ['value.id', authorCredit.value.id])) {
			authorCreditOptions.push(authorCredit);
		}
		const typeOption = entity.editionGroupType && {label: entity.editionGroupType.label, value: entity.editionGroupType.id};
		if (typeOption && !_find(typeOptions, ['value', typeOption.value])) {
			typeOptions.push(typeOption);
		}
		editions.push(...entity.editions);
	});

	return (
		<div>
			<MergeField
				currentValue={authorCreditValue}
				label="Author Credit"
				options={authorCreditOptions}
				valueRenderer={authorCreditToString}
				onChange={onAuthorCreditChange}
			/>
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
		</div>
	);
}
EditionGroupSectionMerge.displayName = 'EditionGroupSectionMerge';

function mapStateToProps(rootState): StateProps {
	const state = rootState.get('editionGroupSection');
	const authorCredit: Map<string, any> = rootState.get('authorCredit');

	return {
		authorCreditValue: convertMapToObject(authorCredit),
		typeValue: state.get('type')
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onAuthorCreditChange: (selectedAuthorCredit:AuthorCredit) => {
			dispatch(updateAuthorCredit(selectedAuthorCredit));
		},
		onTypeChange: (value: number) => dispatch(updateType(value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(EditionGroupSectionMerge);
