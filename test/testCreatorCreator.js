/*
 * Copyright (C) 2016  Max Prettyjohns
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

'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const utils = require('../node_modules/bookbrainz-data/util.js');
const Promise = require('bluebird');

const Bookshelf = require('./bookbrainz-data.js').bookshelf;
const testData = require('../data/testData.js');

function truncate() {
	return utils.truncateTables(Bookshelf, [
		'bookbrainz.editor',
		'bookbrainz.editor_type',
		'bookbrainz.achievement_type',
		'bookbrainz.achievement_unlock',
		'bookbrainz.title_type',
		'bookbrainz.title_unlock',
		'musicbrainz.gender'
	]);
}

describe('Creator Creator achievement', () => {
	beforeEach(() => testData.createEditor()
		.then(() =>
			testData.createCreatorCreator()
		)
	);

	afterEach(truncate);

	it('should give someone with a creator revision Creator Creator I', () => {
		const achievementPromise = testData.creatorCreatorHelper(1)
			.then(() => {
				return new Editor({name: testData.editorAttribs.name})
					.fetch()
					.then((editor) =>
						Achievement.processEdit(editor.id)
					)
					.then((edit) => {
						console.log(edit);
						return edit.revisionist['Creator Creator']
					}
					);
			})

		return expect(achievementPromise).to.eventually.have.property('editorId', testData.editorAttribs.id);
	});
})
