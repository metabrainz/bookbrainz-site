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
	updateDisambiguationField, updateLanguageField, updateNameField,
	updateSortNameField
} from './actions';
import DisambiguationField from './disambiguation-field';
import LanguageField from '../common/language-field';
import NameField from '../common/name-field';
import React from 'react';
import SortNameField from '../common/sort-name-field';
import _debounce from 'lodash.debounce';
import {connect} from 'react-redux';
import {isAliasEmpty} from '../helpers';


function NameSection({
	disambiguationDefaultValue,
	disambiguationVisible,
	languageOptions,
	languageValue,
	nameValue,
	sortNameValue,
	onLanguageChange,
	onNameChange,
	onSortNameChange,
	onDisambiguationChange
}) {
	return (
		<div>
			<h2>
				What is the Creator called?
			</h2>
			<form>
				<Row>
					<Col md={6} mdOffset={3}>
						<NameField
							defaultValue={nameValue}
							empty={isAliasEmpty(nameValue, sortNameValue)}
							error={!nameValue}
							onChange={onNameChange}
						/>
					</Col>
				</Row>
				<Row>
					<Col md={6} mdOffset={3}>
						<SortNameField
							defaultValue={sortNameValue}
							empty={isAliasEmpty(nameValue, sortNameValue)}
							error={!sortNameValue}
							storedNameValue={nameValue}
							onChange={onSortNameChange}
						/>
					</Col>
				</Row>
				<Row>
					<Col md={6} mdOffset={3}>
						<LanguageField
							options={languageOptions}
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
	disambiguationDefaultValue: React.PropTypes.string,
	disambiguationVisible: React.PropTypes.bool,
	languageOptions: React.PropTypes.array,
	languageValue: React.PropTypes.string,
	nameValue: React.PropTypes.string,
	sortNameValue: React.PropTypes.string,
	onDisambiguationChange: React.PropTypes.func,
	onLanguageChange: React.PropTypes.func,
	onNameChange: React.PropTypes.func,
	onSortNameChange: React.PropTypes.func
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

const KEYSTROKE_DEBOUNCE_TIME = 250;
function mapDispatchToProps(dispatch) {
	const debouncedDispatch = _debounce(dispatch, KEYSTROKE_DEBOUNCE_TIME);
	return {
		onSortNameChange: (event) =>
			debouncedDispatch(updateSortNameField(event.target.value)),
		onNameChange: (event) =>
			debouncedDispatch(updateNameField(event.target.value)),
		onLanguageChange: (value) => dispatch(updateLanguageField(value.value)),
		onDisambiguationChange: (event) =>
			debouncedDispatch(updateDisambiguationField(event.target.value)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(NameSection);
