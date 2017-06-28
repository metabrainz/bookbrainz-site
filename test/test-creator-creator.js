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
import Promise from 'bluebird';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import orm from './bookbrainz-data';
import rewire from 'rewire';

chai.use(chaiAsPromised);
const {expect} = chai;

const Achievement = rewire('../lib/server/helpers/achievement.js');

const creatorCreatorIThreshold = 1;
const creatorCreatorIIThreshold = 10;
const creatorCreatorIIIThreshold = 100;

export default function tests() {
	beforeEach(() => testData.createCreatorCreator());

	afterEach(testData.truncate);

	it('I should be given to someone with a creator creation',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'creator_revision', creatorCreatorIThreshold
					)
			});

			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.creatorCreator['Creator Creator I']
				);

			return Promise.all([
				expect(achievementPromise).to.eventually.have
					.property('editorId',
						testData.editorAttribs.id),
				expect(achievementPromise).to.eventually.have
					.property('achievementId',
						testData.creatorCreatorIAttribs.id)
			]);
		}
	);

	it('II should be given to someone with 10 creator creations',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'creator_revision', creatorCreatorIIThreshold
					)
			});
			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.creatorCreator['Creator Creator II']
				);

			return Promise.all([
				expect(achievementPromise).to.eventually.have
					.property('editorId',
						testData.editorAttribs.id),
				expect(achievementPromise).to.eventually.have
					.property('achievementId',
						testData.creatorCreatorIIAttribs.id)
			]);
		});

	it('III should be given to someone with 100 creator creations',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'creator_revision', creatorCreatorIIIThreshold
					)
			});
			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.creatorCreator
				);

			return Promise.all([
				expect(achievementPromise).to.eventually.have.deep
					.property('Creator Creator III.editorId',
						testData.editorAttribs.id),
				expect(achievementPromise).to.eventually.have.deep
					.property('Creator Creator III.achievementId',
						testData.creatorCreatorIIIAttribs.id),
				expect(achievementPromise).to.eventually.have.deep
					.property('Creator Creator.editorId',
						testData.editorAttribs.id),
				expect(achievementPromise).to.eventually.have.deep
					.property('Creator Creator.titleId',
						testData.creatorCreatorAttribs.id)
			]);
		});

	it('should not be given to someone with 0 creator creations',
		() => {
			Achievement.__set__({
				getTypeCreation:
					testData.typeCreationHelper(
						'creator_revision', 0
					)
			});
			const achievementPromise = testData.createEditor()
				.then((editor) =>
					Achievement.processEdit(orm, editor.id)
				)
				.then((edit) =>
					edit.creatorCreator['Creator Creator I']
				);

			return expect(achievementPromise).to.eventually.equal(false);
		});
}
