/*
 * Copyright (C) 2023  David Kellner
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

import type {EntityTypeString, LazyLoadedEntityT} from 'bookbrainz-data/lib/types/entity';


export type WikipediaArticle = {

	/** Language code of the Wikipedia project. */
	language: string,

	/** Title of the Wikipedia article. */
	title: string,
};

/** Page object with the extract property from the Wikipedia API. */
export type WikipediaPageExtract = {

	/** Title of the Wikipedia article. */
	title: string,

	/** First paragraph of the page as HTML (without hyperlinks). */
	extract: string,

	pageid: number,
	ns: number,
};

/** Wikipedia extract which includes information about the Wikipedia project where it comes from. */
export type WikipediaArticleExtract = WikipediaPageExtract & {
	article: WikipediaArticle,
};


const wikidataIdentifierTypeIds: Record<EntityTypeString, number> = {
	Author: 18,
	Edition: 4,
	EditionGroup: 19,
	Publisher: 20,
	Series: 30,
	Work: 21
};

export function getWikidataId(entity: LazyLoadedEntityT) {
	const identifiers = entity.identifierSet?.identifiers;
	const wikidataTypeId = wikidataIdentifierTypeIds[entity.type];
	return identifiers?.find((identifier) => identifier.typeId === wikidataTypeId)?.value;
}

export function buildWikipediaUrl(article: WikipediaArticle) {
	return new URL(article.title.replaceAll(' ', '_'), `https://${article.language}.wikipedia.org/wiki/`);
}
