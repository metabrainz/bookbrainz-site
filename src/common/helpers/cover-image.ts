/*
 * Copyright (C) 2024  BookBrainz Contributors
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

/**
 * Gets the OpenLibrary cover image URL and source page URL for an Edition.
 * Priority: OLID > ISBN-13 > ISBN-10 > OCLC > LCCN
 * @param {(Array | null | undefined)} identifiers - Array of identifier objects with type and value
 * @param {('S' | 'M' | 'L')} size - Cover image size (S for small, M for medium, L for large)
 * @returns {(string[] | null)} [coverUrl, sourcePageUrl] or null if no identifier found
 */
export function getOpenLibraryCoverUrl(
	identifiers: Array<{type: {label: string, id?: number}, value: string}> | null | undefined,
	size: 'S' | 'M' | 'L' = 'M'
): [string, string] | null {
	if (!identifiers || !Array.isArray(identifiers) || identifiers.length === 0) {
		return null;
	}

	const olidIdentifier = identifiers.find((identifier) => {
		const typeLabel = identifier.type?.label?.toLowerCase() || '';
		const typeId = identifier.type?.id;
		return typeId === 6 ||
			typeLabel.includes('openlibrary') ||
			(typeLabel.includes('olid') || typeLabel.includes('ol id'));
	});

	if (olidIdentifier && olidIdentifier.value) {
		const olidValue = olidIdentifier.value.trim();
		return [
			`https://covers.openlibrary.org/b/olid/${olidValue}-${size}.jpg?default=false`,
			`https://openlibrary.org/books/${olidValue}`
		];
	}

	const isbn13Identifier = identifiers.find((identifier) => {
		const typeLabel = identifier.type?.label?.toLowerCase() || '';
		const typeId = identifier.type?.id;
		return typeId === 9 || typeLabel === 'isbn-13';
	});

	if (isbn13Identifier && isbn13Identifier.value) {
		const cleanISBN = isbn13Identifier.value.replace(/-/g, '').trim();
		if (cleanISBN.length === 13) {
			return [
				`https://covers.openlibrary.org/b/isbn/${cleanISBN}-${size}.jpg?default=false`,
				`https://openlibrary.org/isbn/${cleanISBN}`
			];
		}
	}

	const isbn10Identifier = identifiers.find((identifier) => {
		const typeLabel = identifier.type?.label?.toLowerCase() || '';
		const typeId = identifier.type?.id;
		return typeId === 10 || typeLabel === 'isbn-10';
	});

	if (isbn10Identifier && isbn10Identifier.value) {
		const cleanISBN = isbn10Identifier.value.replace(/-/g, '').trim();
		if (cleanISBN.length === 10) {
			return [
				`https://covers.openlibrary.org/b/isbn/${cleanISBN}-${size}.jpg?default=false`,
				`https://openlibrary.org/isbn/${cleanISBN}`
			];
		}
	}

	const oclcIdentifier = identifiers.find((identifier) => {
		const typeLabel = identifier.type?.label?.toLowerCase() || '';
		const typeId = identifier.type?.id;
		return typeId === 26 ||
			typeLabel.includes('oclc') ||
			typeLabel.includes('ocn') ||
			typeLabel.includes('worldcat');
	});

	if (oclcIdentifier && oclcIdentifier.value) {
		const oclcValue = oclcIdentifier.value.trim();
		if ((/^\d+$/).test(oclcValue)) {
			return [
				`https://covers.openlibrary.org/b/oclc/${oclcValue}-${size}.jpg?default=false`,
				`https://openlibrary.org/oclc/${oclcValue}`
			];
		}
	}

	const lccnIdentifier = identifiers.find((identifier) => {
		const typeLabel = identifier.type?.label?.toLowerCase() || '';
		const typeId = identifier.type?.id;
		return typeId === 24 || typeLabel === 'lccn';
	});

	if (lccnIdentifier && lccnIdentifier.value) {
		const lccnValue = lccnIdentifier.value.trim();
		if ((/^[a-zA-Z]{0,3}\d{6,10}$/).test(lccnValue)) {
			return [
				`https://covers.openlibrary.org/b/lccn/${lccnValue}-${size}.jpg?default=false`,
				`https://openlibrary.org/lccn/${lccnValue}`
			];
		}
	}

	return null;
}
