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
const rewire = require('rewire');
const utils = require('../node_modules/bookbrainz-data/util.js');
const Promise = require('bluebird');
const Bookshelf = require('./bookbrainz-data.js').bookshelf;
const testData = require('../data/testData.js');
const Achievement = rewire('../src/server/helpers/achievement.js');

function tests() {
	describe('Creator Creator achievement', () => {
		beforeEach(() => testData.createCreatorCreator());

		afterEach(testData.truncate);

		it('should give someone with a creator revision Creator Creator I',
			() => {
				Achievement.__set__({
					getTypeRevisions:
						testData.typeRevisionHelper('creatorRevision', 1)
				});

				const achievementPromise = testData.createEditor()
					.then((editor) =>
						Achievement.processEdit(editor.id)
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

		it('should give someone with 10 creator revisions Creator Creator II',
			() => {
				Achievement.__set__({
					getTypeRevisions:
						testData.typeRevisionHelper('creatorRevision', 10)
				});
				const achievementPromise = testData.createEditor()
					.then((editor) =>
						Achievement.processEdit(editor.id)
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

		it('should give someone with 100 creator revisions Creator Creator III',
			() => {
				Achievement.__set__({
					getTypeRevisions:
						testData.typeRevisionHelper('creatorRevision', 100)
				});
				const achievementPromise = testData.createEditor()
					.then((editor) =>
						Achievement.processEdit(editor.id)
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

		it('should not give someone with 0 creator revisions Creator Creator I',
			() => {
				Achievement.__set__({
					getTypeRevisions: (type, editor) =>
						Promise.resolve(0)
				});
				const achievementPromise = testData.createEditor()
					.then((editor) =>
						Achievement.processEdit(editor.id)
					)
					.then((edit) =>
						edit.creatorCreator['Creator Creator I']
					);

				return expect(achievementPromise).to.eventually.equal(false);
			});
	});
}

describe('Creator Creator Achievements', tests);
