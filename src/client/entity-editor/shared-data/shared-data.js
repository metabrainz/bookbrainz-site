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

import {Button, Col, Row} from 'react-bootstrap';
import {
	showAliasEditor, showIdentifierEditor, updateDisambiguationField,
	updateLanguageField, updateNameField, updateSortNameField
} from '../actions';
import AliasButton from './alias-button';
import DisambiguationField from './disambiguation-field';
import IdentifierButton from './identifier-button';
import LanguageField from '../common/language-field';
import NameField from '../common/name-field';
import React from 'react';
import SortNameField from '../common/sort-name-field';
import _debounce from 'lodash.debounce';
import {connect} from 'react-redux';
import {isAliasEmpty} from '../helpers';


function SharedData({
	disambiguationDefaultValue,
	disambiguationVisible,
	languageOptions,
	languageValue,
	nameValue,
	numAliases,
	numIdentifiers,
	sortNameValue,
	onAliasButtonClick,
	onDisambiguationButtonClick,
	onDisambiguationChange,
	onIdentifierButtonClick,
	onLanguageChange,
	onNameChange,
	onSortNameChange
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
				<Row className="margin-top-1">
					<Col className="text-center" md={4}>
						<AliasButton
							numAliases={numAliases}
							onClick={onAliasButtonClick}
						/>
					</Col>
					<Col className="text-center" md={4}>
						<Button
							bsStyle="link"
							disabled={disambiguationVisible}
							onClick={onDisambiguationButtonClick}
						>
							Add disambiguation…
						</Button>
					</Col>
					<Col className="text-center" md={4}>
						<IdentifierButton
							numIdentifiers={numIdentifiers}
							onClick={onIdentifierButtonClick}
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
SharedData.displayName = 'SharedData';
SharedData.propTypes = {
	disambiguationDefaultValue: React.PropTypes.string,
	disambiguationVisible: React.PropTypes.bool,
	languageOptions: React.PropTypes.array,
	languageValue: React.PropTypes.string,
	nameValue: React.PropTypes.string,
	numAliases: React.PropTypes.number,
	numIdentifiers: React.PropTypes.number,
	sortNameValue: React.PropTypes.string,
	onAliasButtonClick: React.PropTypes.func,
	onDisambiguationButtonClick: React.PropTypes.func,
	onDisambiguationChange: React.PropTypes.func,
	onIdentifierButtonClick: React.PropTypes.func,
	onLanguageChange: React.PropTypes.func,
	onNameChange: React.PropTypes.func,
	onSortNameChange: React.PropTypes.func
};

function mapStateToProps(rootState) {
	const state = rootState.get('sharedData');
	return {
		disambiguationDefaultValue: state.get('disambiguation'),
		languageValue: state.get('language'),
		nameValue: state.get('name'),
		numAliases: rootState.get('aliasEditor').size,
		numIdentifiers: rootState.get('identifierEditor').size,
		sortNameValue: state.get('sortName')
	};
}

const KEYSTROKE_DEBOUNCE_TIME = 250;
function mapDispatchToProps(dispatch) {
	const debouncedDispatch = _debounce(dispatch, KEYSTROKE_DEBOUNCE_TIME);
	return {
		onAliasButtonClick: () => dispatch(showAliasEditor()),
		onSortNameChange: (event) =>
			debouncedDispatch(updateSortNameField(event.target.value)),
		onNameChange: (event) =>
			debouncedDispatch(updateNameField(event.target.value)),
		onLanguageChange: (value) => dispatch(updateLanguageField(value.value)),
		onDisambiguationChange: (event) =>
			debouncedDispatch(updateDisambiguationField(event.target.value)),
		onDisambiguationButtonClick: () => dispatch({
			type: 'SHOW_DISAMBIGUATION'
		}),
		onIdentifierButtonClick: () => dispatch(showIdentifierEditor())
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(SharedData);
