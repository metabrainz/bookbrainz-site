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
const rewire = require('rewire');

const Editor = require('./bookbrainz-data').Editor;
const Achievement = rewire('../src/server/helpers/achievement.js');
const testData = require('../data/test-data.js');

const hotOffThePressThreshold = -7;

module.exports = () => {
	beforeEach(() => testData.createEditor()
		.then(() =>
			testData.createHotOffThePress()
		)
	);

	afterEach(testData.truncate);

	it('should be given to someone with edition revision released this week',
		() => {
			Achievement.__set__({
				getEditionDateDifference: () =>
					Promise.resolve(hotOffThePressThreshold)
			});

			const achievementPromise =
				new Editor({name: testData.editorAttribs.name})
					.fetch()
					.then((editor) =>
						Achievement.processEdit(editor.id)
					)
					.then((edit) =>
						edit.hotOffThePress['Hot Off the Press']
					);

			return Promise.all([
				expect(achievementPromise).to.eventually.have
					.property('editorId', testData.editorAttribs.id),
				expect(achievementPromise).to.eventually.have
				.property('achievementId',
					testData.hotOffThePressAttribs.id)
			]);
		}
	);

	it('shouldn\'t be given when edition revision released a week ago',
		() => {
			Achievement.__set__({
				getEditionDateDifference: () =>
					Promise.resolve(hotOffThePressThreshold - 1)
			});

			const achievementPromise =
				new Editor({name: testData.editorAttribs.name})
					.fetch()
					.then((editor) =>
						Achievement.processEdit(editor.id)
					)
					.then((edit) =>
						edit.timeTraveller
					);

			expect(achievementPromise).to.eventually.equal(false);
		});
};
