/*
 * Copyright (C) 2017  Ben Ockmore
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

import IdentifierLink from './identifiers-links';
import PropTypes from 'prop-types';
import React from 'react';


function EntityIdentifiers({identifiers, identifierTypes}) {
	return (
		<div>
			<h2>Identifiers</h2>
			{
				identifiers &&
				identifierTypes.map((type) => {
					const identifierValues =
						identifiers
							.filter(
								(identifier) => identifier.type.id === type.id || identifier.typeId === type.id
							)
							.map(
								(identifier) => (
									<dd key={identifier.id}>
										<IdentifierLink
											typeId={type.id}
											value={identifier.value}
										/>
									</dd>
								)
							);
					if (!identifierValues.length) {
						return null;
					}
					return [
						<dt key={type.id}>{type.label}</dt>,
						identifierValues
					];
				})
			}
		</div>
	);
}

EntityIdentifiers.displayName = 'EntityIdentifiers';
EntityIdentifiers.propTypes = {
	identifierTypes: PropTypes.array.isRequired,
	identifiers: PropTypes.array
};
EntityIdentifiers.defaultProps = {
	identifiers: []
};

export default EntityIdentifiers;
