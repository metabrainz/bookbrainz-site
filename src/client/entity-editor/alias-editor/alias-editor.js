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

import {Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {removeEmptyAliases} from './actions';
import AliasModalBody from './alias-modal-body';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';


/**
 * Container component. The AliasEditor component contains a number of AliasRow
 * elements, and renders these inside a modal, which appears when the show
 * property of the component is set.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.aliases - The list of aliases to be rendered in the
 *        editor.
 * @param {Array} props.languageOptions - The list of possible languages for an
 *        alias.
 * @param {Function} props.onClose - A function to be called when the button to
 *        add new alias is clicked.
 * @param {boolean} props.show - Whether or not the editor modal should be
 *        visible.
 * @returns {ReactElement} React element containing the rendered AliasEditor.
 */
const AliasEditor = ({
	languageOptions,
	onClose
}) => {
	const helpText = `Variant names for an entity such as alternate spelling, different script, stylistic representation, acronyms, etc.
		Refer to the help page for more details and examples.`;
	const helpIconElement = (
		<OverlayTrigger
			delay={50}
			overlay={<Tooltip id="alias-editor-tooltip">{helpText}</Tooltip>}
			placement="right"
		>
			<FontAwesomeIcon
				className="fa-sm"
				icon={faQuestionCircle}
			/>
		</OverlayTrigger>
	);

	return (
		<div>
			<div>
			<div style={{display: 'flex'}}>
					<h2>Add new alias</h2> 
					<div>
						{helpIconElement}
					</div>
				</div>
			</div>

			<div>
				<AliasModalBody languageOptions={languageOptions}/>
			</div>

			<div>
				<Button variant="primary" onClick={onClose}>Done</Button>
			</div>
		</div>
	);
};
AliasEditor.displayName = 'AliasEditor';
AliasEditor.propTypes = {
	languageOptions: PropTypes.array.isRequired,
	onClose: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
	return {
		onClose: () => {
			dispatch(removeEmptyAliases());
		}
	};
}

export default connect(null, mapDispatchToProps)(AliasEditor);
