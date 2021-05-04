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

import AliasButton from './alias-button';
import PropTypes from 'prop-types';
import React from 'react';
import {addAliasRow} from '../alias-editor/actions';
import {connect} from 'react-redux';
import {
	showAliasEditor
} from './actions';
import {validateAliases} from '../validators/common';

/**
 * Container component. This component renders three buttons in a horizontal
 * row allowing the user to open the AliasEditor (AliasButton), add a
 * disambiguation to the entity and open the IdentifierEditor
 * (IdentifierButton).
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.numAliases - The number of aliases present in
 *        the AliasEditor - passed to the AliasButton component.
 * @param {Function} props.onAliasButtonClick - A function to be called when the
 *        AliasButton is clicked.
 * @returns {ReactElement} React element containing the rendered ButtonBar.
 */
function ButtonBar({
	aliasesInvalid,
	numAliases,
	onAliasButtonClick
}) {
	return (
		<div>
			<Row className="margin-top-1">
				<Col className="text-center" md={6}>
					<AliasButton
						aliasesInvalid={aliasesInvalid}
						numAliases={numAliases}
						onClick={onAliasButtonClick}
					/>
				</Col>
			</Row>
		</div>
	);
}
ButtonBar.displayName = 'ButtonBar';
ButtonBar.propTypes = {
	aliasesInvalid: PropTypes.bool.isRequired,
	numAliases: PropTypes.number.isRequired,
	onAliasButtonClick: PropTypes.func.isRequired
};

function mapStateToProps(rootState) {
	return {
		aliasesInvalid: !validateAliases(rootState.get('aliasEditor')),
		numAliases: rootState.get('aliasEditor').size
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onAliasButtonClick: () => {
			dispatch(showAliasEditor());
			dispatch(addAliasRow());
		}
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ButtonBar);
