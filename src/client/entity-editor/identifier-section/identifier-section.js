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
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import IdentifierSectionBody from './identifier-section-body';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';

/**
 * Container component. The identifierSection component contains
 * IdentifierSectionBody elements, and renders it in the entity editor page
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.identifiers - The list of identifiers to be rendered in
 *        the editor.
 * @param {Array} props.identifierTypes - The list of possible types for an
 *        identifier.
 * @returns {ReactElement} React element containing the rendered
 *          identifierSection.
 */
const IdentifierSection = ({
	identifierTypes,
	isUnifiedForm
}) => {
	console.log("IT :", identifierTypes);
	const helpText = `identity of the entity in other databases and services, such as ISBN, barcode, MusicBrainz ID, WikiData ID, OpenLibrary ID, etc.
	You can enter either the identifier only (Q2517049) or a full link (https://www.wikidata.org/wiki/Q2517049).`;
	const helpIconElement = (
		<OverlayTrigger
			delay={50}
			overlay={<Tooltip id="identifier-editor-tooltip">{helpText}</Tooltip>}
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
					<h2>Add identifiers</h2>
					<div className="d-flex flex-column justify-content-center ml-2">
						{helpIconElement}
					</div>
				</div>
			</div>
			<div>
				<IdentifierSectionBody
					identifierTypes={identifierTypes}
					isUnifiedForm={isUnifiedForm}
				/>
			</div>
		</div>
	);
};
IdentifierSection.displayName = 'IdentifierSection';
IdentifierSection.propTypes = {
	identifierTypes: PropTypes.array.isRequired,
	isUnifiedForm: PropTypes.bool
};
IdentifierSection.defaultProps = {
	isUnifiedForm: false
};

export default connect(null, null)(IdentifierSection);
