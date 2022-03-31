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

import {
	debouncedUpdateDisambiguationField,
	debouncedUpdateNameField,
	debouncedUpdateSortNameField,
	updateLanguageField
} from './actions';

import MergeField from '../common/merge-field';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {connect} from 'react-redux';
import {entityTypeProperty} from '../../helpers/react-validators';

/**
 * Container component. The NameSectionMerge component contains input fields for
 * setting the name of an entity. It also allows setting of the entity's
 * disambiguation. The intention is that this component is rendered as a
 * modular section within the entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.disambiguationDefaultValue - The default value for the
 *        disambiguation field.
 * @param {Array} props.languageOptions - The list of possible languages for the
 *        entity name.
 * @param {string} props.languageValue - The ID of the language currently
 *        selected for the entity name.
 * @param {string} props.nameValue - The name currently set for this entity.
 * @param {string} props.sortNameValue - The sort name currently set for this
 *        entity.
 * @param {Function} props.onLanguageChange - A function to be called when a
 *        different language type is selected.
 * @param {Function} props.onNameChange - A function to be called when the name
 *        is changed.
 * @param {Function} props.onSortNameChange - A function to be called when the
 *        sort name is changed.
 * @param {Function} props.onDisambiguationChange - A function to be called when
 *        the disambiguation is changed.
 * @returns {ReactElement} React element containing the rendered NameSectionMerge.
 */

function NameSectionMerge({
	disambiguationDefaultValue,
	mergingEntities,
	entityType,
	languageOptions,
	languageValue,
	nameValue,
	sortNameValue,
	onLanguageChange,
	onNameChange,
	onSortNameChange,
	onDisambiguationChange
}) {
	const nameOptions = [];
	const sortNameOptions = [];
	const languageSelectOptions = [];
	const disambiguationOptions = [];

	mergingEntities.forEach(entity => {
		if (_.findIndex(nameOptions, ['label', entity.defaultAlias.name]) === -1) {
			nameOptions.push({label: entity.defaultAlias.name, value: entity.defaultAlias.name});
		}
		if (_.findIndex(sortNameOptions, ['label', entity.defaultAlias.sortName]) === -1) {
			sortNameOptions.push({label: entity.defaultAlias.sortName, value: entity.defaultAlias.sortName});
		}
		const matchingLanguage = languageOptions
			.filter(language => language.id === entity.defaultAlias.languageId)
			.map((language) => ({
				label: language.name,
				value: language.id
			}));
		if (_.findIndex(languageSelectOptions, ['value', matchingLanguage[0].value]) === -1) {
			languageSelectOptions.push(matchingLanguage[0]);
		}
		if (!_.isNil(entity.disambiguation) &&
			disambiguationOptions.indexOf(entity.disambiguation) === -1) {
			disambiguationOptions.push({label: entity.disambiguation.comment, value: entity.disambiguation.comment});
		}
	});

	return (
		<div>
			<MergeField
				currentValue={nameValue}
				label="Name"
				options={nameOptions}
				tooltipText={`Prefered name of the ${_.capitalize(entityType)} in their original language.
				Other names (full name, name in another language) are added as 'aliases'.`}
				valueProperty="value"
				onChange={onNameChange}
			/>
			<MergeField
				currentValue={sortNameValue}
				label="Sort Name"
				options={sortNameOptions}
				tooltipText="Alphabetical sort name for the above name."
				valueProperty="value"
				onChange={onSortNameChange}
			/>
			<MergeField
				currentValue={languageValue}
				label="Language"
				options={languageSelectOptions}
				tooltipText="Language the above name is in"
				onChange={onLanguageChange}
			/>
			<MergeField
				currentValue={disambiguationDefaultValue}
				label="Disambiguation"
				options={disambiguationOptions}
				tooltipText="In case there is another distinct entity with the same name"
				onChange={onDisambiguationChange}
			/>
		</div>
	);
}

NameSectionMerge.displayName = 'NameSectionMerge';
NameSectionMerge.propTypes = {
	disambiguationDefaultValue: PropTypes.string,
	entityType: entityTypeProperty.isRequired,
	languageOptions: PropTypes.array.isRequired,
	languageValue: PropTypes.number,
	mergingEntities: PropTypes.array.isRequired,
	nameValue: PropTypes.string.isRequired,
	onDisambiguationChange: PropTypes.func.isRequired,
	onLanguageChange: PropTypes.func.isRequired,
	onNameChange: PropTypes.func.isRequired,
	onSortNameChange: PropTypes.func.isRequired,
	sortNameValue: PropTypes.string.isRequired
};
NameSectionMerge.defaultProps = {
	disambiguationDefaultValue: null,
	languageValue: null
};

function mapStateToProps(rootState) {
	const state = rootState.get('nameSection');
	return {
		disambiguationDefaultValue: state.get('disambiguation'),
		languageValue: state.get('language'),
		nameValue: state.get('name'),
		sortNameValue: state.get('sortName')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onDisambiguationChange: (option) => {
			dispatch(debouncedUpdateDisambiguationField(option));
		},
		onLanguageChange: (option) =>
			dispatch(updateLanguageField(option)),
		onNameChange: (option) =>
			dispatch(debouncedUpdateNameField(option)),
		onSortNameChange: (option) =>
			dispatch(debouncedUpdateSortNameField(option))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(NameSectionMerge);
