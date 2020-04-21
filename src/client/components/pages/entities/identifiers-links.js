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
/* eslint-disable no-inline-comments */

import PropTypes from 'prop-types';
import React from 'react';


function IdentifierLink({typeId, value}) {
	let link;
	// All identifiers type IDs have been taken from database.
	switch (typeId) {
		case 1: // @MusicBrainz Release ID: The ID for the MusicBrainz Release corresponding to a BookBrainz Edition.
			link = `https://musicbrainz.org/release/${value}`;
			break;
		case 2: // @MusicBrainz Artist ID: The ID for the MusicBrainz Artist corresponding to a BookBrainz Author.
			link = `https://musicbrainz.org/artist/${value}`;
			break;
		case 3: // @MusicBrainz Work ID: The ID for the MusicBrainz Work corresponding to a BookBrainz Work.
			link = `https://musicbrainz.org/work/${value}`;
			break;
		case 4: // @Wikidata ID: The ID for the Wikidata page corresponding to a BookBrainz Edition.
			link = `https://www.wikidata.org/wiki/${value}`;
			break;
		case 5: // @Amazon ASIN: The Amazon ASIN corresponding to a BookBrainz Edition.
			link = `https://www.amazon.com/dp/${value}`;
			break;
		case 6: // @OpenLibrary Book ID: The ID for an OpenLibrary Book corresponding to a BookBrainz Edition.
			link = `https://openlibrary.org/books/${value}`;
			break;
		case 8: // @OpenLibrary Work ID: The ID for an OpenLibrary Work corresponding to a BookBrainz Work.
			link = `https://openlibrary.org/works/${value}`;
			break;
		case 9: // @ISBN-13: The ISBN-13 for a BookBrainz Edition.
			link = `https://isbnsearch.org/isbn/${value}`;
			break;
		case 10: // @ISBN-10: The ISBN-10 for a BookBrainz Edition.
			link = `https://isbnsearch.org/isbn/${value}`;
			break;
		case 11: // @Barcode: The barcode for a BookBrainz Edition.
			link = `https://www.barcodelookup.com/${value}`;
			break;
		case 12: // @VIAF: The VIAF ID corresponding to a BookBrainz Author.
		case 29: // @VIAF: The VIAF ID corresponding to a BookBrainz Publisher.
			link = `https://viaf.org/viaf/${value}`;
			break;
		case 13: // @ISNI: The ISNI ID corresponding to a BookBrainz Author.
			link = `http://www.isni.org/${value}`;
			break;
		case 14: // @LibraryThing Work: The LibraryThing ID for a BookBrainz work.
			link = `https://www.librarything.com/work/${value}`;
			break;
		case 15: // @LibraryThing Author: The LibraryThing author ID corresponding to a BookBrainz Author.
			link = `https://www.librarything.com/author/${value}`;
			break;
		case 16: // @IMDb Title ID: The ID for a title from IMDb
			link = `https://www.imdb.com/title/${value}`;
			break;
		case 17: // @MusicBrainz Label ID: The ID for the MusicBrainz Label corresponding to a BookBrainz Publisher.
			link = `https://musicbrainz.org/label/${value}`;
			break;
		case 18: // @Wikidata ID: The ID for the Wikidata page corresponding to a BookBrainz Author.
		case 19: // @Wikidata ID: The ID for the Wikidata page corresponding to a BookBrainz EditionGroup.
		case 20: // @Wikidata ID: The ID for the Wikidata page corresponding to a BookBrainz Publisher.
		case 21: // @Wikidata ID: The ID for the Wikidata page corresponding to a BookBrainz Work.
			link = `https://www.wikidata.org/wiki/${value}`;
			break;
		case 22:
			link = `https://www.archive.org/details/${value}`;
			break;
		case 23:
			link = `https://www.openlibrary.org/authors/${value}`;
			break;
		case 24:
			link = `https://lccn.loc.gov/${value}`;
			break;
		case 25:
			link = `https://www.orcid.org/${value}`;
			break;
		case 26:
			link = `https://www.worldcat.org/oclc/${value}`;
			break;
		case 27:
			link = `https://www.goodreads.com/author/show/${value}`;
			break;
		case 28:
			link = `https://www.goodreads.com/book/show/${value}`;
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
