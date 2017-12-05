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
import Promise from 'bluebird';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import orm from './bookbrainz-data';
import rewire from 'rewire';


chai.use(chaiAsPromised);
const {expect} = chai;

const Achievement = rewire('../lib/server/helpers/achievement.js');

const publisherCreatorIThreshold = 1;
const publisherCreatorIIThreshold = 10;
const publisherCreatorIIIThreshold = 100;


export default function tests() {
	beforeEach(() => testData.createPublisherCreator());

	afterEach(testData.truncate);

	it('I should be given to someone with a publisher creation',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'publisher_revision', publisherCreatorIThreshold
					)
			});

			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.publisherCreator['Publisher Creator I']
				);

			return expectAchievementIds(
				achievementPromise,
				testData.editorAttribs.id,
				testData.publisherCreatorIAttribs.id
			);
		}
	);

	it('II should be given to someone with 10 publisher creations',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'publisher_revision', publisherCreatorIIThreshold
					)
			});
			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.publisherCreator['Publisher Creator II']
				);

			return expectAchievementIds(
				achievementPromise,
				testData.editorAttribs.id,
				testData.publisherCreatorIIAttribs.id
			);
		});

	it('III should be given to someone with 100 publisher creations',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'publisher_revision', publisherCreatorIIIThreshold
					)
			});
			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.publisherCreator
				);

			return expectAchievementIdsNested(
				achievementPromise,
				'Publisher Creator',
				testData.editorAttribs.id,
				testData.publisherCreatorIIIAttribs.id,
				testData.publisherCreatorAttribs.id,
			);
		});

	it('should not be given to someone with 0 publisher creations',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'publisher_revision', 0
					)
			});
			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.publisherCreator['Publisher Creator I']
				);

			return expect(achievementPromise).to.eventually.equal(false);
		});
}
