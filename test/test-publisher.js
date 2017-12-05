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

const Achievement = rewire('../src/server/helpers/achievement.js');

const publisherIThreshold = 1;
const publisherIIThreshold = 10;
const publisherIIIThreshold = 100;

export default function tests() {
	beforeEach(() => testData.createPublisher());

	afterEach(testData.truncate);

	it('I should be given to someone with a publication creation',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'publication_revision', publisherIThreshold
					)
			});

			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.publisher['Publisher I']
				);

			return expectAchievementIds(
				achievementPromise,
				testData.editorAttribs.id,
				testData.publisherIAttribs.id
			);
		}
	);

	it('II should be given to someone with 10 publication creations',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'publication_revision', publisherIIThreshold
					)
			});
			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.publisher['Publisher II']
				);

			return expectAchievementIds(
				achievementPromise,
				testData.editorAttribs.id,
				testData.publisherIIAttribs.id
			);
		});

	it('III should be given to someone with 100 publication creations',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'publication_revision', publisherIIIThreshold
					)
			});
			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.publisher
				);

			return expectAchievementIdsNested(
				achievementPromise,
				'Publisher',
				testData.editorAttribs.id,
				testData.publisherIIIAttribs.id,
				testData.publisherAttribs.id,
			);
		});

	it('should not be given to someone with 0 publication creations',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'publication_revision', 0
					)
			});
			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.publisher['Publisher I']
				);

			return expect(achievementPromise).to.eventually.equal(false);
		});
}
