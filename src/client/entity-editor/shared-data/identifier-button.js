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
import React from 'react';

function IdentifierButton({
	numIdentifiers,
	...props
}) {
	let text = 'Add identifiers (eg. MBID, Wikidata ID)…';
	if (numIdentifiers === 1) {
		text = 'Edit 1 identifier (eg. MBID, Wikidata ID)…';
	}
	else if (numIdentifiers > 1) {
		text = `Edit ${numIdentifiers} identifiers (eg. MBID, Wikidata ID)…`;
	}

	return (
		<Button bsStyle="link" {...props}>
			{text}
		</Button>
	);
}
IdentifierButton.displayName = 'IdentifierButton';
IdentifierButton.propTypes = {
	numIdentifiers: React.PropTypes.number
};

export default IdentifierButton;
