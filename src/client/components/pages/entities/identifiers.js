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

import PropTypes from 'prop-types';
import React from 'react';


function IdentifireLink({type, value}) {
	let link;
	if (type === 'ISBN-10') {
		link = `https://isbnsearch.org/isbn/${value}`;
	}
	else if (type === 'ISBN-13') {
		link = `https://isbnsearch.org/isbn/${value}`;
	}
	else if (type === 'Wikidata ID') {
		link = `https://www.wikidata.org/wiki/${value}`;
	}
	else if (type === 'VIAF') {
		link = `https://viaf.org/viaf/${value}`;
	}
	else if (type === 'ISNI') {
		link = `http://www.isni.org/${value}`;
	}
	else if (type === 'MusicBrainz Artist ID') {
		link = `https://musicbrainz.org/artist/${value}`;
	}
	else if (type === 'LibraryThing Author') {
		link = `https://www.librarything.com/author/${value}`;
	}
	else if (type === 'Amazon ASIN') {
		link = `http://www.amazon-asin.com/asincheck/?product_id=${value}`;
	}
	else if (type === 'Barcode') {
		link = `https://www.barcodelookup.com/${value}`;
	}
	else if (type === 'OpenLibrary Work ID') {
		link = `https://openlibrary.org/works/${value}`;
	}
	else if (type === 'LibraryThing Work') {
		link = `https://www.librarything.com/work/${value}`;
	}
	else {
		return value;
	}
	return (
		<a href={link} rel="noopener noreferrer" target="_blank"> {value} </a>
	);
}

function EntityIdentifiers({identifierSet, identifierTypes}) {
	return (
		<div>
			<h2>Identifiers</h2>
			{
				identifierSet && identifierSet.identifiers &&
				identifierTypes.map((type) => {
					const identifierValues =
						identifierSet.identifiers
							.filter(
								(identifier) => identifier.type.id === type.id
							)
							.map(
								(identifier) => (
									<dd key={identifier.id}>
										<IdentifireLink
											type={type.label}
											value={identifier.value}
										/>
									</dd>
								)
							);

					return [
						<dt key={type.id}>{type.label}</dt>,
						identifierValues
					];
				})
			}
		</div>
	);
}

IdentifireLink.propTypes = {
	type: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired
};

EntityIdentifiers.displayName = 'EntityIdentifiers';
EntityIdentifiers.propTypes = {
	identifierSet: PropTypes.object.isRequired,
	identifierTypes: PropTypes.array.isRequired
};

export default EntityIdentifiers;
