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

import {Button, Checkbox, Col, Row} from 'react-bootstrap';
import {
	debouncedUpdateAliasName, debouncedUpdateAliasSortName, removeAliasRow,
	updateAliasLanguage, updateAliasPrimary
} from './actions';
import {
	validateAliasLanguage, validateAliasName, validateAliasSortName
} from '../validators/common';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import LanguageField from '../common/language-field';
import NameField from '../common/name-field';
import PropTypes from 'prop-types';
import React from 'react';
import SortNameField from '../common/sort-name-field';
import {connect} from 'react-redux';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import {isAliasEmpty} from '../helpers';


/**
 * Container component. The AliasRow component renders a single Row containing
 * several input fields, allowing the user to set the name, sort name, language
 * and primary flag for an alias in the AliasEditor. A button is also included
 * to remove the alias from the editor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.languageValue - The ID of the language currently
 *        selected.
 * @param {Array} props.languageOptions - The list of possible languages for an
 *        alias.
 * @param {string} props.nameValue - The name currently set for this alias.
 * @param {string} props.sortNameValue - The sort name currently set for this
 *        alias.
 * @param {string} props.primaryChecked - Whether or not the primary checkbox
 *        is checked.
 * @param {Function} props.onLanguageChange - A function to be called when a
 *        new alias language is selected.
 * @param {Function} props.onNameChange - A function to be called when the
 *        name for the alias is changed.
 * @param {Function} props.onSortNameChange - A function to be called when the
 *        sort name for the alias is changed.
 * @param {Function} props.onRemoveButtonClick - A function to be called when
 *        the button to remove the alias is clicked.
 * @param {Function} props.onPrimaryClick - A function to be called when
 *        the primary checkbox is clicked.
 * @returns {ReactElement} React element containing the rendered AliasRow.
 */
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
					autoFocus
					defaultValue={nameValue}
					empty={
						isAliasEmpty(nameValue, sortNameValue, languageValue)
					}
					error={!validateAliasName(nameValue)}
					onChange={onNameChange}
				/>
			</Col>
			<Col md={4}>
				<SortNameField
					defaultValue={sortNameValue}
					empty={
						isAliasEmpty(nameValue, sortNameValue, languageValue)
					}
					error={!validateAliasSortName(sortNameValue)}
					storedNameValue={nameValue}
					onChange={onSortNameChange}
				/>
			</Col>
			<Col md={4}>
				<LanguageField
					empty={
						isAliasEmpty(nameValue, sortNameValue, languageValue)
					}
					error={!validateAliasLanguage(languageValue)}
					instanceId="language"
					options={languageOptions}
					value={languageValue}
					onChange={onLanguageChange}
				/>
			</Col>
		</Row>
		<Row>
			<Col md={2} mdOffset={5}>
				<Checkbox
					defaultChecked={primaryChecked}
					onChange={onPrimaryClick}
				>
					Primary
				</Checkbox>
			</Col>
			<Col className="text-right" md={3} mdOffset={2}>
				<Button
					block
					className="margin-top-d5"
					variant="danger"
					onClick={onRemoveButtonClick}
				>
					<FontAwesomeIcon icon={faTimes}/>
					<span>&nbsp;Remove</span>
				</Button>
			</Col>
		</Row>
		<hr/>
	</div>
);
AliasRow.displayName = 'AliasEditor.AliasRow';
AliasRow.propTypes = {
	languageOptions: PropTypes.array.isRequired,
	languageValue: PropTypes.number,
	nameValue: PropTypes.string.isRequired,
	onLanguageChange: PropTypes.func.isRequired,
	onNameChange: PropTypes.func.isRequired,
	onPrimaryClick: PropTypes.func.isRequired,
	onRemoveButtonClick: PropTypes.func.isRequired,
	onSortNameChange: PropTypes.func.isRequired,
	primaryChecked: PropTypes.bool.isRequired,
	sortNameValue: PropTypes.string.isRequired
};
AliasRow.defaultProps = {
	languageValue: null
};

function mapDispatchToProps(dispatch, {index}) {
	return {
		onLanguageChange: (value) =>
			dispatch(updateAliasLanguage(index, value && value.value)),
		onNameChange: (event) =>
			dispatch(debouncedUpdateAliasName(index, event.target.value)),
		onPrimaryClick: (event) =>
			dispatch(updateAliasPrimary(index, event.target.checked)),
		onRemoveButtonClick: () =>
			dispatch(removeAliasRow(index)),
		onSortNameChange: (event) =>
			dispatch(debouncedUpdateAliasSortName(index, event.target.value))
	};
}

function mapStateToProps(rootState, {index}) {
	const state = rootState.get('aliasEditor');
	return {
		languageValue: state.getIn([index, 'language']),
		nameValue: state.getIn([index, 'name']),
		primaryChecked: state.getIn([index, 'primary']),
		sortNameValue: state.getIn([index, 'sortName'])
	};
}


export default connect(mapStateToProps, mapDispatchToProps)(AliasRow);
