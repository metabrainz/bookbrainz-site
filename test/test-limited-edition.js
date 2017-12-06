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

import * as testData from '../data/test-data.js';
import {expectAchievementIds, expectAchievementIdsNested} from './common';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import orm from './bookbrainz-data';
import rewire from 'rewire';


chai.use(chaiAsPromised);
const {expect} = chai;

const Achievement =	rewire('../lib/server/helpers/achievement.js');

const limitedEditionIThreshold = 1;
const limitedEditionIIThreshold = 10;
const limitedEditionIIIThreshold = 100;

export default function tests() {
	beforeEach(() => testData.createLimitedEdition());

	afterEach(testData.truncate);

	it('I should given to someone with an edition creation',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'edition_revision', limitedEditionIThreshold
					)
			});

			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.limitedEdition['Limited Edition I']
				);

			return expectAchievementIds(
				achievementPromise,
				testData.editorAttribs.id,
				testData.limitedEditionIAttribs.id
			);
		}
	);

	it('II should be given to someone with 10 edition creations',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'edition_revision', limitedEditionIIThreshold
					)
			});
			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.limitedEdition['Limited Edition II']
				);

			return expectAchievementIds(
				achievementPromise,
				testData.editorAttribs.id,
				testData.limitedEditionIIAttribs.id
			);
		});

	it('III should be given to someone with 100 edition creations',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'edition_revision', limitedEditionIIIThreshold
					)
			});
			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.limitedEdition
				);

			return expectAchievementIdsNested(
				achievementPromise,
				'Limited Edition',
				testData.editorAttribs.id,
				testData.limitedEditionIIIAttribs.id,
				testData.limitedEditionAttribs.id,
			);
		});

	it('should not given to someone with 0 edition creations',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'edition_revision', 0
					)
			});
			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.limitedEdition['Limited Edition I']
				);

			return expect(achievementPromise).to.eventually.equal(false);
		});
}
