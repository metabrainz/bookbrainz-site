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
 * Presentational component. The AliasButton component renders a button
 * component in the style of a link. The link text indicates the number of
 * aliases currently set in the AliasEditor, and invites the user to add new or
 * edit existing aliases.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.numAliases - The number of aliases present in the
 *        AliasEditor - used to determine the correct button label.
 * @returns {ReactElement} React element containing the rendered AliasButton.
 */
function AliasButton({
	aliasesInvalid,
	numAliases,
	...props
}) {
	let text = 'Add aliases…';
	if (numAliases === 1) {
		text = 'Edit 1 alias…';
	}
	else if (numAliases > 1) {
		text = `Edit ${numAliases} aliases…`;
	}

	const iconElement = aliasesInvalid &&
		<FontAwesomeIcon className="margin-right-0-5 text-danger" icon={faTimes}/>;

	return (
		<Button variant="link" {...props}>
			{iconElement}
			{text}
		</Button>
	);
}
AliasButton.displayName = 'AliasButton';
AliasButton.propTypes = {
	aliasesInvalid: PropTypes.bool.isRequired,
	numAliases: PropTypes.number.isRequired
};

export default AliasButton;
