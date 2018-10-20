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
	showAliasEditor,
	showDisambiguation,
	showIdentifierEditor
} from './actions';
import {validateAliases, validateIdentifiers} from '../validators/common';

import AliasButton from './alias-button';
import IdentifierButton from './identifier-button';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

/**
 * Container component. This component renders three buttons in a horizontal
 * row allowing the user to open the AliasEditor (AliasButton), add a
 * disambiguation to the entity and open the IdentifierEditor
 * (IdentifierButton).
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.disambiguationVisible - Whether or not the
 *        disambiguation is currently shown in the editor - used to disable the
 *       "Add disambiguation" button.
 * @param {number} props.numAliases - The number of aliases present in
 *        the AliasEditor - passed to the AliasButton component.
 * @param {number} props.numIdentifiers - The number of identifiers present in
 *        the IdentifierEditor - passed to the IdentiferButton component.
 * @param {Function} props.onAliasButtonClick - A function to be called when the
 *        AliasButton is clicked.
 * @param {Function} props.onDisambiguationButtonClick - A function to be
 *        called when the disambiguation button is clicked.
 * @param {Function} props.onIdentifierButtonClick - A function to be called
 *        when the IdentifierButton is clicked.
 * @returns {ReactElement} React element containing the rendered ButtonBar.
 */
function ButtonBar({
	aliasesInvalid,
	disambiguationVisible,
	identifiersInvalid,
	numAliases,
	numIdentifiers,
	onAliasButtonClick,
	onDisambiguationButtonClick,
	onIdentifierButtonClick
}) {
	return (
		<div>
			<form>
				<Row className="margin-top-1">
					<Col className="text-center" md={4}>
						<AliasButton
							aliasesInvalid={aliasesInvalid}
							numAliases={numAliases}
							onClick={onAliasButtonClick}
						/>
					</Col>
					<Col className="text-center" md={4}>
						<IdentifierButton
							identifiersInvalid={identifiersInvalid}
							numIdentifiers={numIdentifiers}
							onClick={onIdentifierButtonClick}
						/>
					</Col>
					{
						!disambiguationVisible &&
						<Col className="text-center" md={4}>
							<Button
								bsStyle="link"
								onClick={onDisambiguationButtonClick}
							>
								Add disambiguation…
							</Button>
						</Col>
					}
				</Row>
			</form>
		</div>
	);
}
ButtonBar.displayName = 'ButtonBar';
ButtonBar.propTypes = {
	aliasesInvalid: PropTypes.bool.isRequired,
	disambiguationVisible: PropTypes.bool.isRequired,
	identifiersInvalid: PropTypes.bool.isRequired,
	numAliases: PropTypes.number.isRequired,
	numIdentifiers: PropTypes.number.isRequired,
	onAliasButtonClick: PropTypes.func.isRequired,
	onDisambiguationButtonClick: PropTypes.func.isRequired,
	onIdentifierButtonClick: PropTypes.func.isRequired
};

function mapStateToProps(rootState, {identifierTypes}) {
	const state = rootState.get('buttonBar');
	return {
		aliasesInvalid: !validateAliases(rootState.get('aliasEditor')),
		disambiguationVisible: state.get('disambiguationVisible'),
		identifiersInvalid: !validateIdentifiers(
			rootState.get('identifierEditor'), identifierTypes
		),
		numAliases: rootState.get('aliasEditor').size,
		numIdentifiers: rootState.get('identifierEditor').size
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onAliasButtonClick: () => dispatch(showAliasEditor()),
		onDisambiguationButtonClick: () => dispatch(showDisambiguation()),
		onIdentifierButtonClick: () => dispatch(showIdentifierEditor())
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ButtonBar);
