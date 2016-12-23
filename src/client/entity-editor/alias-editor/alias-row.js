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


import {Button, Col, Input, Row} from 'react-bootstrap';
import {
	removeAlias, updateAliasLanguage, updateAliasName,
	updateAliasPrimary, updateAliasSortName
} from './actions';
import LanguageField from '../common/language-field';
import NameField from '../common/name-field';
import React from 'react';
import SortNameField from '../common/sort-name-field';
import _debounce from 'lodash.debounce';
import {connect} from 'react-redux';

function isAliasEmpty(nameValue, sortNameValue) {
	return nameValue.length === 0 && sortNameValue.length === 0;
}

/* Presentational component */
const AliasRow = ({
	languageOptions,
	languageValue,
	nameValue,
	sortNameValue,
	primaryChecked,
	onLanguageChange,
	onNameChange,
	onSortNameChange,
	onRemoveButtonClick,
	onPrimaryClick
}) => (
	<div>
		<Row>
			<Col md={4}>
				<NameField
					defaultValue={nameValue}
					empty={isAliasEmpty(nameValue, sortNameValue)}
					error={!nameValue}
					onChange={onNameChange}
				/>
			</Col>
			<Col md={4}>
				<SortNameField
					defaultValue={sortNameValue}
					empty={isAliasEmpty(nameValue, sortNameValue)}
					error={!sortNameValue}
					storedNameValue={nameValue}
					onChange={onSortNameChange}
				/>
			</Col>
			<Col md={4}>
				<LanguageField
					options={languageOptions}
					value={languageValue}
					onChange={onLanguageChange}
				/>
			</Col>
		</Row>
		<Row>
			<Col md={2} mdOffset={5}>
				<Input
					defaultChecked={primaryChecked}
					label="Primary"
					type="checkbox"
					onClick={onPrimaryClick}
				/>
			</Col>
			<Col className="text-right" md={3} mdOffset={2}>
				<Button
					block
					bsStyle="danger"
					className="margin-top-d5"
					onClick={onRemoveButtonClick}
				>
					Remove
				</Button>
			</Col>
		</Row>
		<hr/>
	</div>
);
AliasRow.displayName = 'AliasEditor.AliasRow';
AliasRow.propTypes = {
	languageOptions: React.PropTypes.array,
	languageValue: React.PropTypes.number,
	nameValue: React.PropTypes.string,
	primaryChecked: React.PropTypes.bool,
	sortNameValue: React.PropTypes.string,
	onLanguageChange: React.PropTypes.func,
	onNameChange: React.PropTypes.func,
	onPrimaryClick: React.PropTypes.func,
	onRemoveButtonClick: React.PropTypes.func,
	onSortNameChange: React.PropTypes.func
};

const KEYSTROKE_DEBOUNCE_TIME = 250;
function mapDispatchToProps(dispatch, {index}) {
	const debouncedDispatch = _debounce(dispatch, KEYSTROKE_DEBOUNCE_TIME);
	return {
		onLanguageChange: (value) =>
			dispatch(updateAliasLanguage(index, value.value)),
		onNameChange: (event) =>
			debouncedDispatch(updateAliasName(index, event.target.value)),
		onPrimaryClick: (event) =>
			dispatch(updateAliasPrimary(index, event.target.checked)),
		onRemoveButtonClick: () =>
			dispatch(removeAlias(index)),
		onSortNameChange: (event) =>
			debouncedDispatch(updateAliasSortName(index, event.target.value))
	};
}

function mapStateToProps(rootState, {index}) {
	const state = rootState.get('aliasEditor');
	return {
		nameValue: state.getIn([index, 'name']),
		languageValue: state.getIn([index, 'language']),
		primaryChecked: state.getIn([index, 'primary']),
		sortNameValue: state.getIn([index, 'sortName'])
	};
}


export default connect(mapStateToProps, mapDispatchToProps)(AliasRow);
