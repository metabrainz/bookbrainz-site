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
const Promise = require('bluebird');

const Editor = require('./bookbrainz-data').Editor;
const Achievement = require('../src/server/helpers/achievement.js');
const testData = require('../data/testData.js');

const sprinterThreshold = 10;

module.exports = () => {
	beforeEach(() => testData.createEditor()
		.then(() =>
			testData.createSprinter()
		)
	);

	afterEach(testData.truncate);

	it('should be given to someone with 10 revisions in an hour', () => {
		const achievementPromise = testData.sprinterHelper(sprinterThreshold)
			.then(() => new Editor({name: testData.editorAttribs.name})
				.fetch()
			)
			.then((editor) =>
				Achievement.processEdit(editor.id)
			)
			.then((edit) =>
				edit.sprinter.Sprinter
			);

		return Promise.all([
			expect(achievementPromise).to.eventually.have
				.property('editorId', testData.editorAttribs.id),
			expect(achievementPromise).to.eventually.have
				.property('achievementId', testData.sprinterAttribs.id)
		]);
	});


	it('should not be given to someone with 9 revisions in an hour', () => {
		const achievementPromise =
			testData.sprinterHelper(sprinterThreshold - 1)
			.then(() => new Editor({name: testData.editorAttribs.name})
				.fetch()
			)
			.then((editor) =>
				Achievement.processEdit(editor.id)
			)
			.then((edit) =>
				edit.sprinter.Sprinter
			);

		return expect(achievementPromise).to.eventually.equal(false);
	});
};
