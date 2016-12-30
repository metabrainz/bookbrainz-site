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
	showAliasEditor, showIdentifierEditor
} from '../actions';
import AliasButton from './alias-button';
import IdentifierButton from './identifier-button';
import React from 'react';
import _debounce from 'lodash.debounce';
import {connect} from 'react-redux';


function ButtonBar({
	disambiguationVisible,
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
			</form>
		</div>
	);
}
ButtonBar.displayName = 'ButtonBar';
ButtonBar.propTypes = {
	disambiguationVisible: React.PropTypes.bool,
	numAliases: React.PropTypes.number,
	numIdentifiers: React.PropTypes.number,
	onAliasButtonClick: React.PropTypes.func,
	onDisambiguationButtonClick: React.PropTypes.func,
	onIdentifierButtonClick: React.PropTypes.func
};

function mapStateToProps(rootState) {
	const state = rootState.get('buttonBar');
	return {
		disambiguationVisible: state.get('disambiguationVisible'),
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
		onDisambiguationButtonClick: () => dispatch({
			type: 'SHOW_DISAMBIGUATION'
		}),
		onIdentifierButtonClick: () => dispatch(showIdentifierEditor())
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ButtonBar);
