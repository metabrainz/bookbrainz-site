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
	validateAliasLanguage,
	validateAliasName,
	validateAliasSortName
} from '../validators/common';

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {removeAliasRow} from './actions';

/**
 * Container component. The AliasRowMerge component renders a single Row containing
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
 * @param {Function} props.onRemoveButtonClick - A function to be called when
 *        the button to remove the alias is clicked.
 * @returns {ReactElement} React element containing the rendered AliasRowMerge.
 */
const AliasRowMerge = ({
	languageOptions,
	languageValue,
	nameValue,
	sortNameValue,
	primaryChecked,
	onRemoveButtonClick
}) => (
	<div className="margin-bottom-1">
		{nameValue} <small>({sortNameValue})</small>
		&nbsp;<small className="text-muted">{primaryChecked && 'Primary'} {languageOptions[languageValue]}</small>
	</div>
);

AliasRowMerge.displayName = 'AliasEditor.AliasRowMerge';
AliasRowMerge.propTypes = {
	languageOptions: PropTypes.object.isRequired,
	languageValue: PropTypes.number,
	nameValue: PropTypes.string.isRequired,
	onRemoveButtonClick: PropTypes.func.isRequired,
	primaryChecked: PropTypes.bool.isRequired,
	sortNameValue: PropTypes.string.isRequired
};
AliasRowMerge.defaultProps = {
	languageValue: null
};

function mapDispatchToProps(dispatch, {index}) {
	return {
		onRemoveButtonClick: () =>
			dispatch(removeAliasRow(index))
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


export default connect(mapStateToProps, mapDispatchToProps)(AliasRowMerge);


/* <Col sm={9}>
	{nameValue} <small>({sortNameValue})</small>
	<br/><small>{primaryChecked && 'Primary'} {languageOptions[languageValue]}</small>
</Col>
<Col sm={3}>
	<Button
		bsSize="sm"
		bsStyle="danger"
		onClick={onRemoveButtonClick}
	>
		Remove
	</Button>
</Col> */
