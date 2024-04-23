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
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import AliasModalBody from './alias-section-body';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';

/**
 * Container component. The AliasSection component contains alias section
 * body, and renders it in alias section inside entity editor page.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.languageOptions - The list of possible languages for an
 *        alias.
 * @returns {ReactElement} React element containing the rendered AliasEditor.
 */
const AliasSection = ({
	languageOptions
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
				<div className="d-flex">
				  <h2>Add new alias</h2>
				  <div className="d-flex flex-column justify-content-center ml-2">
						{helpIconElement}
				  </div>
				</div>
			</div>
			<div>
				<AliasModalBody languageOptions={languageOptions}/>
			</div>
		</div>
	  );
};
AliasSection.displayName = 'AliasSection';
AliasSection.propTypes = {
	languageOptions: PropTypes.array.isRequired
};

export default connect(null, null)(AliasSection);
