/*
 * Copyright (C) 2017  Akhilesh Kumar (@akhilesh26)
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


function IdentifierLink({typeId, value}) {
	let link;
	// All identifiers type IDs have been taken from database.
	switch (typeId) {
		// @MusicBrainz Release ID: The ID for the MusicBrainz Release corresponding to a BookBrainz Edition.
		case 1:
			link = `https://musicbrainz.org/release/${value}`;
			break;
		// @MusicBrainz Artist ID: The ID for the MusicBrainz Artist corresponding to a BookBrainz Creator.
		case 2:
			link = `https://musicbrainz.org/artist/${value}`;
			break;
		// @MusicBrainz Work ID: The ID for the MusicBrainz Work corresponding to a BookBrainz Work.
		case 3:
			link = `https://musicbrainz.org/work/${value}`;
			break;
		// @Wikidata ID: The ID for the Wikidata page corresponding to a BookBrainz Edition.
		case 4:
			link = `https://www.wikidata.org/wiki/${value}`;
			break;
		// @Amazon ASIN: The Amazon ASIN corresponding to a BookBrainz Edition.
		case 5:
			link = `https://www.amazon.com/dp/${value}`;
			break;
		// @OpenLibrary Book ID: The ID for an OpenLibrary Book corresponding to a BookBrainz Edition.
		case 6:
			link = `https://openlibrary.org/books/${value}`;
			break;
		// @OpenLibrary Work ID: The ID for an OpenLibrary Work corresponding to a BookBrainz Work.
		case 8:
			link = `https://openlibrary.org/works/${value}`;
			break;
		// @ISBN-13: The ISBN-13 for a BookBrainz Edition.
		case 9:
			link = `https://isbnsearch.org/isbn/${value}`;
			break;
		// @ISBN-10: The ISBN-10 for a BookBrainz Edition.
		case 10:
			link = `https://isbnsearch.org/isbn/${value}`;
			break;
		// @Barcode: The barcode for a BookBrainz Edition.
		case 11:
			link = `https://www.barcodelookup.com/${value}`;
			break;
		// @VIAF: The VIAF ID corresponding to a BookBrainz creator.
		case 12:
			link = `https://viaf.org/viaf/${value}`;
			break;
		 // @ISNI: The ISNI ID corresponding to a BookBrainz creator.
		case 13:
			link = `http://www.isni.org/${value}`;
			break;
		// @LibraryThing Work: The LibraryThing ID for a BookBrainz work.
		case 14:
			link = `https://www.librarything.com/work/${value}`;
			break;
		// @LibraryThing Author: The LibraryThing author ID corresponding to a BookBrainz creator.
		case 15:
			link = `https://www.librarything.com/author/${value}`;
			break;
		// @IMDb Title ID: The ID for a title from IMDb
		case 16:
			link = `https://www.imdb.com/title/${value}`;
			break;
		// @MusicBrainz Label ID: The ID for the MusicBrainz Label corresponding to a BookBrainz Publisher.
		case 17:
			link = `https://musicbrainz.org/label/${value}`;
			break;
		// @Wikidata ID: The ID for the Wikidata page corresponding to a BookBrainz Creator.
		case 18:
			break;
		// @Wikidata ID: The ID for the Wikidata page corresponding to a BookBrainz Publication.
		case 19:
			break;
			// @Wikidata ID: The ID for the Wikidata page corresponding to a BookBrainz Publisher.
		case 20:
			break;
		// @Wikidata ID: The ID for the Wikidata page corresponding to a BookBrainz Work.
		case 21:
			link = `https://www.wikidata.org/wiki/${value}`;
			break;
		default:
			return value;
	}

	return (
		<a href={link} rel="noopener noreferrer" target="_blank"> {value} </a>
	);
}

IdentifierLink.propTypes = {
	typeId: PropTypes.number.isRequired,
	value: PropTypes.string.isRequired
};

export default IdentifierLink;
