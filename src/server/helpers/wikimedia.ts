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

import type {WikipediaArticle, WikipediaPageExtract} from '../../common/helpers/wikimedia';
import request from 'superagent';


type WikidataSiteLink = {

	/**
	 * Abbreviation for the Wikimedia project/site/domain.
	 * Format: language code + project suffix (e.g. `enwiki` for the English Wikipedia)
	 */
	site: string,

	/** Title of the specific page. */
	title: string,

	/** Wikidata IDs of badges which the page has (e.g. `Q17437798` for good articles). */
	badges: string[],
};

type WikidataSiteLinksResult = {
	entities: Record<string, {
		id: string,
		sitelinks: Record<string, WikidataSiteLink>,
		type: 'item',
	}>,
	success: boolean,
};

// incomplete, only the parts we need
type WikipediaExtractResult = {
	query: {
		pages: WikipediaPageExtract[],
	},
};


/**
 * Fetches a list of Wikipedia articles in all available languages for the given Wikidata item.
 * @param wikidataId - Wikidata item ID.
 */
export async function getAvailableWikipediaArticles(wikidataId: string) {
	const apiUrl = new URL('https://www.wikidata.org/w/api.php');
	apiUrl.search = new URLSearchParams({
		action: 'wbgetentities',
		format: 'json',
		props: 'sitelinks',
		ids: wikidataId,
	}).toString();

	const response = await request.get(apiUrl.href);
	const result = response.body as WikidataSiteLinksResult;
	const item = result.entities?.[wikidataId];

	if (!item) {
		throw new Error(`Failed to fetch Wikidata item ${wikidataId}`);
	}

	return Object.values(item.sitelinks)
		 // only keep Wikipedia pages
		.filter((link) => link.site.endsWith('wiki'))
		.map((page) => <WikipediaArticle>({
			// drop project suffix
			language: page.site.replace(/wiki$/, ''),
			title: page.title
		}));
}

/**
 * Tries to find a Wikipedia article for the given Wikidata item in the first preferred language which is available.
 * @param wikidataId - Wikidata item ID.
 * @param preferredLanguages - List of language codes, preference in descending order.
 */
export async function selectWikipediaPage(wikidataId: string, preferredLanguages = ['en']) {
	const articles = await getAvailableWikipediaArticles(wikidataId);

	let result: WikipediaArticle;
	for (const language of preferredLanguages) {
		result = articles.find((page) => page.language === language);
		if (result) {
			break;
		}
	}

	return result;
}

/**
 * Fetches the page extract of the given Wikipedia article.
 * @param article - Title and language of the article.
 */
export async function getWikipediaExtract(article: WikipediaArticle) {
	const apiUrl = new URL(`https://${article.language}.wikipedia.org/w/api.php`);
	apiUrl.search = new URLSearchParams({
		action: 'query',
		format: 'json',
		formatversion: '2',
		prop: 'extracts',
		exintro: '1',
		redirects: '1',
		titles: article.title
	}).toString();

	const response = await request.get(apiUrl.href);
	const result = response.body as WikipediaExtractResult;

	return result.query?.pages?.[0];
}
