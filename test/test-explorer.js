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

import * as common from './common';
import * as testData from '../data/test-data.js';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import orm from './bookbrainz-data';
import rewire from 'rewire';


chai.use(chaiAsPromised);
const {expect} = chai;
const {Editor} = orm;

const Achievement = rewire('../lib/server/helpers/achievement.js');

const thresholdI = 10;
const thresholdII = 100;
const thresholdIII = 1000;

export default function tests() {
	beforeEach(
		() => testData.createEditor()
			.then(() => testData.createExplorer())
	);

	afterEach(testData.truncate);

	const test1 = common.testAchievement(
		common.rewireAchievement(Achievement, {
			getEntityVisits: () => Promise.resolve(thresholdI)
		}),
		() => new Editor({
			name: testData.editorAttribs.name
		})
			.fetch()
			.then((editor) => Achievement.processPageVisit(orm, editor.id))
			.then((edit) => edit.explorer['Explorer I']),
		common.expectIds(
			'explorer', 'I'
		)
	);
	it('I should be given to someone with 10 entity views', test1);

	const test2 = common.testAchievement(
		common.rewireAchievement(Achievement, {
			getEntityVisits: () => Promise.resolve(thresholdII)
		}),
		() => new Editor({
			name: testData.editorAttribs.name
		})
			.fetch()
			.then((editor) => Achievement.processPageVisit(orm, editor.id))
			.then((edit) => edit.explorer['Explorer II']),
		common.expectIds(
			'explorer', 'II'
		)
	);
	it('II should be given to someone with 100 entity views', test2);

	const test3 = common.testAchievement(
		common.rewireAchievement(Achievement, {
			getEntityVisits: () => Promise.resolve(thresholdIII)
		}),
		() => new Editor({
			name: testData.editorAttribs.name
		})
			.fetch()
			.then((editor) => Achievement.processPageVisit(orm, editor.id))
			.then((edit) => edit.explorer['Explorer III']),
		common.expectIds(
			'explorer', 'III'
		)
	);
	it('III should be given to someone with 1000 entity views', test3);

	const test4 = common.testAchievement(
		common.rewireAchievement(Achievement, {
			getEntityVisits: () => Promise.resolve(thresholdI - 1)
		}),
		() => new Editor({
			name: testData.editorAttribs.name
		})
			.fetch()
			.then((editor) => Achievement.processPageVisit(orm, editor.id))
			.then((edit) => edit.explorer['Explorer I']),
		(promise) => expect(promise).to.eventually.equal(false)
	);
	it('I should not be given to someone with 9 entity views', test4);
}
