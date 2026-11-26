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

const languageSet = {
	id: 1,
	languages: [
		{id: 120, name: 'English'},
		{id: 136, name: 'French'}
	]
};
const publisherSet = {
	id: 2,
	publishers: [{bbid: '9e9e4ad5-6d2f-4b8b-8d7f-0f0e3a2a1a11'}]
};
const releaseEventSet = {
	id: 3,
	releaseEvents: [{date: '1958-01-01'}]
};

describe('diffFormatters', () => {
	describe('languageSet', () => {
		it('should list the languages when a whole language set is added', () => {
			const change = {kind: 'N', path: ['languageSet'], rhs: languageSet};

			expect(languageSetFormatter.format(change)).to.deep.equal([
				{key: 'Languages', kind: 'N', rhs: ['English', 'French']}
			]);
		});

		// BB-807: a work merged into another one loses its whole language set.
		it('should list the old languages when a whole language set is removed', () => {
			const change = {kind: 'D', lhs: languageSet, path: ['languageSet']};

			expect(languageSetFormatter.format(change)).to.deep.equal([
				{key: 'Languages', kind: 'D', lhs: ['English', 'French']}
			]);
		});

		it('should show nothing when an empty language set is removed', () => {
			const change = {
				kind: 'D', lhs: {id: 1, languages: []}, path: ['languageSet']
			};

			expect(languageSetFormatter.format(change)).to.deep.equal([]);
		});
	});

	describe('publisherSet', () => {
		it('should list the old publishers when a whole publisher set is removed', () => {
			const change = {kind: 'D', lhs: publisherSet, path: ['publisherSet']};

			expect(publisherSetFormatter.format(change)).to.deep.equal([
				{
					key: 'Publisher',
					kind: 'D',
					lhs: ['9e9e4ad5-6d2f-4b8b-8d7f-0f0e3a2a1a11']
				}
			]);
		});
	});

	describe('releaseEventSet', () => {
		it('should list the old dates when a whole release event set is removed', () => {
			const change = {
				kind: 'D', lhs: releaseEventSet, path: ['releaseEventSet']
			};

			expect(releaseEventSetFormatter.format(change)).to.deep.equal([
				{key: 'Release Date', kind: 'D', lhs: ['1958-01-01']}
			]);
		});
	});
});
