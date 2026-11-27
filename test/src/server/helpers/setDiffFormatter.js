/*
 * Copyright (C) 2026  Abhinav Dwivedi
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import * as languageSetFormatter from
	'../../../../src/server/helpers/diffFormatters/languageSet';
import * as publisherSetFormatter from
	'../../../../src/server/helpers/diffFormatters/publisherSet';
import * as releaseEventSetFormatter from
	'../../../../src/server/helpers/diffFormatters/releaseEventSet';
import chai from 'chai';


const {expect} = chai;

// These are the changes deep-diff (used by bookbrainz-data's diffRevisions)
// produces when one item is added to or removed from an array: kind 'A',
// the item's index, and the added or removed value in `item`.
describe('set diff formatters with items added to or removed from a set', () => {
	it('should show a language added to an existing language set', () => {
		const change = {
			index: 1,
			item: {kind: 'N', rhs: {name: 'French'}},
			kind: 'A',
			path: ['languageSet', 'languages']
		};

		expect(languageSetFormatter.format(change)).to.deep.equal([
			{key: 'Language 1', kind: 'N', rhs: ['French']}
		]);
	});

	it('should show a language removed from an existing language set', () => {
		const change = {
			index: 1,
			item: {kind: 'D', lhs: {name: 'French'}},
			kind: 'A',
			path: ['languageSet', 'languages']
		};

		expect(languageSetFormatter.format(change)).to.deep.equal([
			{key: 'Language 1', kind: 'D', lhs: ['French']}
		]);
	});

	it('should show a publisher added to an existing publisher set', () => {
		const change = {
			index: 1,
			item: {kind: 'N', rhs: {bbid: 'second-bbid'}},
			kind: 'A',
			path: ['publisherSet', 'publishers']
		};

		expect(publisherSetFormatter.format(change)).to.deep.equal([
			{key: 'Publisher', kind: 'N', rhs: ['second-bbid']}
		]);
	});

	it('should show a release date added to an existing release event set', () => {
		const change = {
			index: 1,
			item: {kind: 'N', rhs: {date: '1960-05-01'}},
			kind: 'A',
			path: ['releaseEventSet', 'releaseEvents']
		};

		expect(releaseEventSetFormatter.format(change)).to.deep.equal([
			{key: 'Release Date', kind: 'N', rhs: ['1960-05-01']}
		]);
	});

	it('should still show a renamed language', () => {
		const change = {
			kind: 'E',
			lhs: 'English',
			path: ['languageSet', 'languages', 0, 'name'],
			rhs: 'French'
		};

		expect(languageSetFormatter.format(change)).to.deep.equal([
			{key: 'Language 0', kind: 'E', lhs: ['English'], rhs: ['French']}
		]);
	});
});
