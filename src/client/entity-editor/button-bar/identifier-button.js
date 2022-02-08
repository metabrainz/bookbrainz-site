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

import {Button} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {faTimes} from '@fortawesome/free-solid-svg-icons';


/**
 * Presentational component. The IdentifierButton component renders a button
 * component in the style of a link. The link text indicates the number of
 * identifiers currently set in the IdentifierEditor, and invites the user to
 * add new or edit existing identifiers.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.identifiersInvalid - Whether the inputs are valid
 *        identifiers.
 * @param {number} props.numIdentifiers - The number of identifiers present in
 *        the IdentifierEditor - used to determine the correct button label.
 * @returns {ReactElement} React element containing the rendered
 *          IdentifierButton.
 */
function IdentifierButton({
	identifiersInvalid,
	numIdentifiers,
	...props
}) {
	let text = 'Add identifiers (eg. ISBN, Wikidata ID)…';
	if (numIdentifiers === 1) {
		text = 'Edit 1 identifier (eg. ISBN, Wikidata ID)…';
	}
	else if (numIdentifiers > 1) {
		text = `Edit ${numIdentifiers} identifiers (eg. ISBN, Wikidata ID)…`;
	}

	const iconElement = identifiersInvalid &&
		<FontAwesomeIcon className="margin-right-0-5 text-danger" icon={faTimes}/>;

	return (
		<Button variant="link" {...props}>
			{iconElement}
			{text}
		</Button>
	);
}
IdentifierButton.displayName = 'IdentifierButton';
IdentifierButton.propTypes = {
	identifiersInvalid: PropTypes.bool.isRequired,
	numIdentifiers: PropTypes.number.isRequired
};

export default IdentifierButton;
