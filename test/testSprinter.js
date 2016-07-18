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
const Editor = require('./bookbrainz-data').Editor;
const Achievement = require('../src/server/helpers/achievement.js');
const testData = require('../data/testData.js');

function truncate() {
	return utils.truncateTables(Bookshelf, [
		'bookbrainz.editor',
		'bookbrainz.editor_type',
		'bookbrainz.achievement_type',
		'bookbrainz.achievement_unlock',
		'bookbrainz.title_type',
		'bookbrainz.title_unlock',
		'bookbrainz.revision',
		'musicbrainz.gender'
	]);
}

describe('Sprinter Achievement', () => {
	beforeEach(() => testData.createEditor()
		.then(() =>
			testData.createSprinter()
		)
	);

	afterEach(truncate);

	it('should give someone with 10 revisions in an hour Sprinter', () => {
		const achievementPromise = testData.sprinterHelper(10)
			.then(() => new Editor({name: testData.editorAttribs.name})
				.fetch()
			)
			.then((editor) =>
				Achievement.processEdit(editor.id)
			)
			.then((edit) =>
				edit.sprinter['Sprinter']
			);
		
		return Promise.all([
			expect(achievementPromise).to.eventually.have
				.property('editorId', testData.editorAttribs.id),
			expect(achievementPromise).to.eventually.have
				.property('achievementId', testData.sprinterAttribs.id)
		]);
	});


	it('should not give someone with 9 revisions in an hour Sprinter', () => {
		const achievementPromise = testData.sprinterHelper(9)
			.then(() => new Editor({name: testData.editorAttribs.name})
				.fetch()
			)
			.then((editor) =>
				Achievement.processEdit(editor.id)
			)
			.then((edit) =>
				edit.sprinter['Sprinter']
			);
		
		return expect(achievementPromise).to.eventually.equal(false);
	});
})
