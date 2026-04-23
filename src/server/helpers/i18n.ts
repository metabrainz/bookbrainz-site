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
		.map((rawValue) => rawValue.trim())
		.filter(Boolean)
		.map((value) => {
			// Matches:
			// - primary tag: 2-3 letters (e.g. en, fr, pt)
			// - optional subtags: -Latn, -US, etc.
			// - optional quality weight: ;q=0.8
			const match = value.match(
				/^(?<tag>[a-zA-Z]{2,3})(?:-(?<subtag>[a-zA-Z0-9-]+))?(?:\s*;\s*q=(?<weight>[01](?:\.[0-9]+)?))?$/
			);

			if (!match?.groups?.tag) {
				return null;
			}

			const weight = parseFloat(match.groups.weight ?? '1');
			if (Number.isNaN(weight) || weight < 0 || weight > 1) {
				return null;
			}

			return {
				code: match.groups.tag.toLowerCase(),
				subtags: match.groups.subtag
					? match.groups.subtag.split('-').map((subtag) => subtag.toLowerCase())
					: [],
				weight
			};
		})
		.filter((value): value is AcceptedLanguage => value !== null)
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
