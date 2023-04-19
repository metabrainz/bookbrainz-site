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
import {cacheJSON, getCachedJSON} from '../../common/helpers/cache';
import {toLower, uniq} from 'lodash';
import {hoursToSeconds} from 'date-fns';
import request from 'superagent';
import {userAgent} from '../info';


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


/** Maximum age of cached results in seconds. */
const cacheMaxAge = {
	articles: hoursToSeconds(24 * 7),
	extract: hoursToSeconds(24 * 3)
};

/**
 * Fetches a list of Wikipedia articles in all available languages for the given Wikidata item.
 * @param {string} wikidataId - Wikidata item ID.
 */
export async function getAvailableWikipediaArticles(wikidataId: string, {
	forceCache = false
} = {}): Promise<WikipediaArticle[]> {
	const cacheKey = `wiki:articles:${wikidataId}`;
	const cachedArticles = await getCachedJSON<WikipediaArticle[]>(cacheKey);

	if (cachedArticles || forceCache) {
		return cachedArticles || [];
	}

	const apiUrl = new URL('https://www.wikidata.org/w/api.php');
	apiUrl.search = new URLSearchParams({
		action: 'wbgetentities',
		format: 'json',
		ids: wikidataId,
		props: 'sitelinks'
	}).toString();

	const response = await request.get(apiUrl.href)
		.set('User-Agent', userAgent);
	const result = response.body as WikidataSiteLinksResult;
	const item = result.entities?.[wikidataId];

	if (!item) {
		throw new Error(`Failed to fetch Wikidata item ${wikidataId}`);
	}

	const articles = Object.values(item.sitelinks)
		// only keep Wikipedia pages
		.filter((link) => link.site.endsWith('wiki'))
		.map((page) => <WikipediaArticle>({
			// drop project suffix
			language: page.site.replace(/wiki$/, ''),
			title: page.title
		}));

	cacheJSON(cacheKey, articles, {expireTime: cacheMaxAge.articles});

	return articles;
}

/**
 * Tries to find a Wikipedia article for the given Wikidata item in the first preferred language which is available.
 * @param {string} wikidataId - Wikidata item ID.
 * @param {string[]} preferredLanguages - List of language codes, preference in descending order.
 */
export async function selectWikipediaPage(wikidataId: string, {
	forceCache = false,
	preferredLanguages = ['en']
} = {}) {
	const articles = await getAvailableWikipediaArticles(wikidataId, {forceCache});

	let result: WikipediaArticle;
	for (const language of uniq(preferredLanguages)) {
		result = articles.find((page) => page.language === toLower(language));
		if (result) {
			break;
		}
	}

	return result;
}

/**
 * Fetches the page extract of the given Wikipedia article.
 * @param {object} article - Title and language of the article.
 */
export async function getWikipediaExtract(article: WikipediaArticle, {
	forceCache = false
} = {}): Promise<WikipediaPageExtract> {
	const cacheKey = `wiki:extract:${article.language}:${article.title}`;
	const cachedExtract = await getCachedJSON<WikipediaPageExtract>(cacheKey);

	if (cachedExtract || forceCache) {
		return cachedExtract;
	}

	const apiUrl = new URL(`https://${article.language}.wikipedia.org/w/api.php`);
	apiUrl.search = new URLSearchParams({
		action: 'query',
		format: 'json',
		formatversion: '2',
		prop: 'extracts',
		// eslint-disable-next-line sort-keys -- `exintro` only allowed with `prop: 'extracts'`
		exintro: '1',
		redirects: '1',
		titles: article.title
	}).toString();

	const response = await request.get(apiUrl.href)
		.set('User-Agent', userAgent);
	const result = response.body as WikipediaExtractResult;
	const pageExtract = result.query?.pages?.[0];

	cacheJSON(cacheKey, pageExtract, {expireTime: cacheMaxAge.extract});

	return pageExtract;
}
