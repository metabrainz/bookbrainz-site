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

import {
	showAliasEditor,
	showIdentifierEditor
} from './actions';
import {validateAliases, validateIdentifiers} from '../validators/common';

import AliasButton from './alias-button';
import IdentifierButton from './identifier-button';
import PropTypes from 'prop-types';
import React from 'react';
import {addAliasRow} from '../alias-editor/actions';
import {addIdentifierRow} from '../identifier-editor/actions';
import {connect} from 'react-redux';

/**
 * This component renders two buttons in a horizontal row: IdentifierButton
 * for the IdentifierEditor, and when not on the unified form AliasButton
 * for the AliasEditor.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.numAliases - The number of aliases present in
 *        the AliasEditor - passed to the AliasButton component.
 * @param {number} props.numIdentifiers - The number of identifiers present in
 *        the IdentifierEditor - passed to the IdentiferButton component.
 * @param {Function} props.onAliasButtonClick - A function to be called when the
 *        AliasButton is clicked.
 * @param {Function} props.onIdentifierButtonClick - A function to be called
 *        when the IdentifierButton is clicked.
 * @returns {ReactElement} React element containing the rendered ButtonBar.
 */
function ButtonBar({
	aliasesInvalid,
	identifiersInvalid,
	numAliases,
	numIdentifiers,
	onAliasButtonClick,
	isUnifiedForm,
	onIdentifierButtonClick
}) {
	const identifierEditorClass = `wrap${!isUnifiedForm ? '' : ' ms-auto'}`;
	return (
		<div className="d-flex flex-wrap justify-content-around gap-3 mt-3">
			{!isUnifiedForm &&
				<AliasButton
					aliasesInvalid={aliasesInvalid}
					numAliases={numAliases}
					onClick={onAliasButtonClick}
				/>
			}
			<IdentifierButton
				buttonVariant={isUnifiedForm ? 'success' : 'outline-info'}
				className={identifierEditorClass}
				identifiersInvalid={identifiersInvalid}
				numIdentifiers={numIdentifiers}
				onClick={onIdentifierButtonClick}
			/>
		</div>
	);
}
ButtonBar.displayName = 'ButtonBar';
ButtonBar.propTypes = {
	aliasesInvalid: PropTypes.bool.isRequired,
	identifiersInvalid: PropTypes.bool.isRequired,
	isUnifiedForm: PropTypes.bool,
	numAliases: PropTypes.number.isRequired,
	numIdentifiers: PropTypes.number.isRequired,
	onAliasButtonClick: PropTypes.func.isRequired,
	onIdentifierButtonClick: PropTypes.func.isRequired
};
ButtonBar.defaultProps = {
	isUnifiedForm: false
};

function mapStateToProps(rootState, {identifierTypes}) {
	return {
		aliasesInvalid: !validateAliases(rootState.get('aliasEditor')),
		identifiersInvalid: !validateIdentifiers(
			rootState.get('identifierEditor'), identifierTypes
		),
		numAliases: rootState.get('aliasEditor').size,
		numIdentifiers: rootState.get('identifierEditor').size
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onAliasButtonClick: () => {
			dispatch(showAliasEditor());
			dispatch(addAliasRow());
		},
		onIdentifierButtonClick: () => {
			dispatch(showIdentifierEditor());
			dispatch(addIdentifierRow());
		}
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ButtonBar);
