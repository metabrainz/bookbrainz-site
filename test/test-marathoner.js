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

/* eslint import/namespace: ['error', { allowComputed: true }] */
import * as testData from '../data/test-data.js';
import Promise from 'bluebird';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {expectAchievementIds} from './common';
import orm from './bookbrainz-data';
import rewire from 'rewire';


chai.use(chaiAsPromised);
const {expect} = chai;
const {Editor} = orm;

const Achievement = rewire('../lib/server/helpers/achievement.js');

const marathonerDays = 29;
const marathonerThreshold = 30;

export default function tests() {
	beforeEach(() => testData.createEditor()
		.then(() =>
			testData.createMarathoner()
		)
	);

	afterEach(testData.truncate);

	it('should be given to someone with a revision a day for 30 days',
		() => {
			Achievement.__set__({
				getEditsInDays: (_orm, editorId, days) => {
					let editPromise;
					if (days === marathonerDays) {
						editPromise = Promise.resolve(marathonerThreshold);
					}
					else {
						editPromise = Promise.resolve(0);
					}
					return editPromise;
				}
			});
			const achievementPromise = new Editor({
				name: testData.editorAttribs.name
			})
				.fetch()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.marathoner.Marathoner
				);

			return expectAchievementIds(
				achievementPromise,
				testData.editorAttribs.id,
				testData.marathonerAttribs.id
			);
		});

	it('shouldn\'t be given to someone without a revision a day for 30 days',
		() => {
			Achievement.__set__({
				getEditsInDays: (editorId, days) => {
					let editPromise;
					if (days === marathonerDays) {
						editPromise = Promise.resolve(marathonerThreshold - 1);
					}
					else {
						editPromise = Promise.resolve(0);
					}
					return editPromise;
				}
			});
			const achievementPromise = new Editor({
				name: testData.editorAttribs.name
			})
				.fetch()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.marathoner.Marathoner
				);

			return expect(achievementPromise).to.eventually.equal(false);
		});
}
