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
	debouncedUpdateAliasName, debouncedUpdateAliasSortName, removeAliasRow,
	removeEmptyAliases,
	updateAliasLanguage, updateAliasPrimary
} from './actions';
import {faPencilAlt, faTrash} from '@fortawesome/free-solid-svg-icons';
import AliasEditor from './alias-editor';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';


/**
 * Container component. The AliasRow component renders a single Row containing
 * alias data of the entity, which displays name, sort name, language
 * and primary flag for an alias in the AliasSection. two icon button is also included
 * to remove and edit the alias in the aliasEditor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.languageOptions - The list of possible languages for an
 *        alias.
 *  * @param {Object} props.alias - the alias obejct containing information about the alias
 * 		  passed to the component
  * @param {number} props.languageValue - The ID of the language currently
 *        selected.
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

function AliasRow({
	aliasLanguage,
	nameValue,
	sortNameValue,
	primaryChecked,
	languageOptions,
	onLanguageChange,
	onNameChange,
	onSortNameChange,
	onRemoveButtonClick,
	onRemoveEmptyAliases,
	onPrimaryClick
}) {
	const languageValue = languageOptions.filter((el) => el.value === aliasLanguage);
	const [showEditor, setEditorVisibility] = React.useState(false);

	const handleEditButtonClick = React.useCallback(() => {
		setEditorVisibility(true);
	  }, []);

	return (
		<div>
			<AliasEditor
				aliasLanguage={aliasLanguage}
				languageOptions={languageOptions}
				languageValue={languageValue}
				nameValue={nameValue}
				primaryCheck={primaryChecked}
				removeEmptyAliases={onRemoveEmptyAliases}
				setVisibility={setEditorVisibility}
				show={showEditor}
				sortNameValue={sortNameValue}
				onLanguageChange={onLanguageChange}
				onNameChange={onNameChange}
				onPrimaryClick={onPrimaryClick}
				onSortNameChange={onSortNameChange}
			/>
			<Row>
			    <Col lg={{offset: '3', span: 4}}>
			        {primaryChecked ?
						<strong>{nameValue} ({sortNameValue}) - {languageValue[0]?.label}</strong> :
						<span>{nameValue} ({sortNameValue}) - {languageValue[0]?.label}</span>
					}
			    </Col>
			    <Col className="d-flex justify-content-end" lg={1}>
					<FontAwesomeIcon
						icon={faPencilAlt}
						onClick={handleEditButtonClick}
					/>
			    </Col>
			    <Col className="d-flex" lg={1}>
			        <FontAwesomeIcon icon={faTrash} onClick={onRemoveButtonClick}/>
			    </Col>
			</Row>
		</div>
	);
}
AliasRow.displayName = 'AliasEditor.AliasRow';
AliasRow.propTypes = {
	aliasLanguage: PropTypes.number.isRequired,
	languageOptions: PropTypes.array.isRequired,
	nameValue: PropTypes.string.isRequired,
	onLanguageChange: PropTypes.func.isRequired,
	onNameChange: PropTypes.func.isRequired,
	onPrimaryClick: PropTypes.func.isRequired,
	onRemoveButtonClick: PropTypes.func.isRequired,
	onRemoveEmptyAliases: PropTypes.func.isRequired,
	onSortNameChange: PropTypes.func.isRequired,
	primaryChecked: PropTypes.bool.isRequired,
	sortNameValue: PropTypes.string.isRequired
};

function mapStateToProps(rootState, {index}) {
	const state = rootState.get('aliasSection');
	return {
		aliasLanguage: state.getIn([index, 'language']),
		nameValue: state.getIn([index, 'name']),
		primaryChecked: state.getIn([index, 'primary']),
		sortNameValue: state.getIn([index, 'sortName'])
	};
}


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
		onRemoveEmptyAliases: () =>
			dispatch(removeEmptyAliases()),
		onSortNameChange: (event) =>
			dispatch(debouncedUpdateAliasSortName(index, event.target.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(AliasRow);
