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

import * as achievement from '../lib/server/helpers/achievement';
import * as testData from '../data/test-data.js';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {expectAchievementIds} from './common';
import orm from './bookbrainz-data';


chai.use(chaiAsPromised);
const {expect} = chai;
const {Editor} = orm;

const sprinterThreshold = 10;

export default function tests() {
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
				achievement.processEdit(orm, editor.id)
			)
			.then((edit) =>
				edit.sprinter.Sprinter
			);

		return expectAchievementIds(
			achievementPromise,
			testData.editorAttribs.id,
			testData.sprinterAttribs.id
		);
	});


	it('should not be given to someone with 9 revisions in an hour', () => {
		const achievementPromise =
			testData.sprinterHelper(sprinterThreshold - 1)
				.then(() => new Editor({name: testData.editorAttribs.name})
					.fetch()
				)
				.then((editor) =>
					achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.sprinter.Sprinter
				);

		return expect(achievementPromise).to.eventually.equal(false);
	});
}
