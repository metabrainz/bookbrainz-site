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

import type {Request} from 'express';
import fs from 'fs';
import log from 'log';
import path from 'path';


// Production catalogs are deployed with the app; restart to load changes.
// Cache pending reads too, so concurrent requests share the same disk work.
let availableLocalesPromise: Promise<string[]> | null = null;
const translationPromises = new Map<string, Promise<Record<string, unknown>>>();

export function getAvailableLocales(): Promise<string[]> {
	const cacheEnabled = process.env.NODE_ENV === 'production';
	if (cacheEnabled && availableLocalesPromise) {
		return availableLocalesPromise;
	}
	const promise = fs.promises.readdir(path.join(process.cwd(), 'public', 'locales'), {withFileTypes: true})
		.then(entries => entries.filter(entry => entry.isDirectory()).map(entry => entry.name))
		.catch(err => {
			availableLocalesPromise = null;
			log.debug('Could not read public/locales, defaulting to en: %s', err.message);
			return ['en'];
		});
	if (cacheEnabled) {
		availableLocalesPromise = promise;
	}
	return promise;
}

export function loadTranslation(locale: string): Promise<Record<string, unknown>> {
	const cacheEnabled = process.env.NODE_ENV === 'production';
	if (cacheEnabled && translationPromises.has(locale)) {
		return translationPromises.get(locale);
	}
	const promise = fs.promises.readFile(path.join(process.cwd(), 'public', 'locales', locale, 'translation.json'), 'utf8')
		.then(contents => JSON.parse(contents))
		.catch(() => {
			translationPromises.delete(locale);
			return {};
		});
	if (cacheEnabled) {
		translationPromises.set(locale, promise);
	}
	return promise;
}


type AcceptedLanguage = {
	code: string,
	subtags: string[],
	weight: number,
};

/**
 * Parses an Accept-Language header to obtain the language codes, optional subtags and weights.
 * @param {string} acceptLanguage - Accept-Language header value.
 * @returns {Array} Parsed languages, sorted by weight in descending order.
 */
export function parseAcceptLanguage(acceptLanguage: string): AcceptedLanguage[] {
	return acceptLanguage
		.split(',')
		.map((value) => {
			const match = value.match(/(?<tag>[a-zA-Z]{2,3})(?:-(?<subtag>[\w-]+))?(?:;\s*q=(?<weight>[01](?:\.[0-9]+)?))?/);
			return match ? {
				code: match.groups.tag.toLowerCase(),
				subtags: match.groups.subtag?.split('-') ?? [],
				weight: parseFloat(match.groups.weight ?? '1')
			} : null;
		})
		.filter((value) => value !== null)
		.sort((a, b) => b.weight - a.weight);
}

/**
 * Extracts language codes from the Accept-Language header, excluding zero-weight preferences.
 * @param {Request} request - Request object which includes HTTP headers.
 * @returns {string[]} Parsed language codes, sorted by weight in descending order.
 */
export function getAcceptedLanguageCodes(request: Request): string[] {
	return parseAcceptLanguage(request.headers['accept-language'] ?? '')
		.filter((language) => language.weight > 0)
		.map((language) => language.code);
}
