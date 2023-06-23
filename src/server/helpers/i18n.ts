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
			const match = value.match(/(?<tag>[a-zA-Z]{2,3})(?:-(?<subtag>[\w-]+))?(?:;q=(?<weight>[01](?:\.[0-9]+)?))?/);
			return match ? {
				code: match.groups.tag,
				subtags: match.groups.subtag?.split('-') ?? [],
				weight: parseFloat(match.groups.weight ?? '1')
			} : null;
		})
		.filter((value) => value !== null)
		.sort((a, b) => b.weight - a.weight);
}

/**
 * Extracts language codes from the Accept-Language header, ordered by weight/preference.
 * @param {Request} request - Request object which includes HTTP headers.
 * @returns {string[]} Parsed language codes, sorted by weight in descending order.
 */
export function getAcceptedLanguageCodes(request: Request): string[] {
	return parseAcceptLanguage(request.headers['accept-language'] ?? '')
		.map((language) => language.code);
}
