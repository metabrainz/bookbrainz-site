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

import {Col, Row} from 'react-bootstrap';
import {
	debouncedUpdateDisambiguationField, debouncedUpdateNameField,
	debouncedUpdateSortNameField, updateLanguageField
} from './actions';
import {
	validateNameSectionLanguage, validateNameSectionName,
	validateNameSectionSortName
} from '../validators/common';
import DisambiguationField from './disambiguation-field';
import LanguageField from '../common/language-field';
import NameField from '../common/name-field';
import PropTypes from 'prop-types';
import React from 'react';
import SortNameField from '../common/sort-name-field';
import _ from 'lodash';
import {connect} from 'react-redux';
import {entityTypeProperty} from '../../helpers/react-validators';
import {isAliasEmpty} from '../helpers';

/**
 * Container component. The NameSection component contains input fields for
 * setting the name of an entity. It also allows setting of the entity's
 * disambiguation. The intention is that this component is rendered as a
 * modular section within the entity editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.disambiguationDefaultValue - The default value for the
 *        disambiguation field.
 * @param {boolean} props.disambiguationVisible - Whether or not the
 *        disambiguation field should be visible.
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
 * @returns {ReactElement} React element containing the rendered NameSection.
 */
function NameSection({
	disambiguationDefaultValue,
	disambiguationVisible,
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
	const languageOptionsForDisplay = languageOptions.map((language) => ({
		label: language.name,
		value: language.id
	}));

	return (
		<div>
			<h2>{`What is the ${_.capitalize(entityType)} called?`}</h2>
			<form>
				<Row>
					<Col md={6} mdOffset={3}>
						<NameField
							defaultValue={nameValue}
							empty={isAliasEmpty(
								nameValue, sortNameValue, languageValue
							)}
							error={!validateNameSectionName(nameValue)}
							onChange={onNameChange}
						/>
					</Col>
				</Row>
				<Row>
					<Col md={6} mdOffset={3}>
						<SortNameField
							defaultValue={sortNameValue}
							empty={isAliasEmpty(
								nameValue, sortNameValue, languageValue
							)}
							error={!validateNameSectionSortName(sortNameValue)}
							storedNameValue={nameValue}
							onChange={onSortNameChange}
						/>
					</Col>
				</Row>
				<Row>
					<Col md={6} mdOffset={3}>
						<LanguageField
							empty={isAliasEmpty(
								nameValue, sortNameValue, languageValue
							)}
							error={!validateNameSectionLanguage(languageValue)}
							instanceId="language"
							options={languageOptionsForDisplay}
							value={languageValue}
							onChange={onLanguageChange}
						/>
					</Col>
				</Row>
				<Row>
					<Col md={6} mdOffset={3}>
						{
							disambiguationVisible &&
							<DisambiguationField
								defaultValue={disambiguationDefaultValue}
								onChange={onDisambiguationChange}
							/>
						}
					</Col>
				</Row>
			</form>
		</div>
	);
}
NameSection.displayName = 'NameSection';
NameSection.propTypes = {
	disambiguationDefaultValue: PropTypes.string,
	disambiguationVisible: PropTypes.bool.isRequired,
	entityType: entityTypeProperty.isRequired, // eslint-disable-line react/no-typos, max-len
	languageOptions: PropTypes.array.isRequired,
	languageValue: PropTypes.number,
	nameValue: PropTypes.string.isRequired,
	onDisambiguationChange: PropTypes.func.isRequired,
	onLanguageChange: PropTypes.func.isRequired,
	onNameChange: PropTypes.func.isRequired,
	onSortNameChange: PropTypes.func.isRequired,
	sortNameValue: PropTypes.string.isRequired
};
NameSection.defaultProps = {
	disambiguationDefaultValue: null,
	languageValue: null
};


function mapStateToProps(rootState) {
	const state = rootState.get('nameSection');
	return {
		disambiguationDefaultValue: state.get('disambiguation'),
		disambiguationVisible:
			rootState.getIn(['buttonBar', 'disambiguationVisible']),
		languageValue: state.get('language'),
		nameValue: state.get('name'),
		sortNameValue: state.get('sortName')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onDisambiguationChange: (event) =>
			dispatch(debouncedUpdateDisambiguationField(event.target.value)),
		onLanguageChange: (value) =>
			dispatch(updateLanguageField(value && value.value)),
		onNameChange: (event) =>
			dispatch(debouncedUpdateNameField(event.target.value)),
		onSortNameChange: (event) =>
			dispatch(debouncedUpdateSortNameField(event.target.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(NameSection);
