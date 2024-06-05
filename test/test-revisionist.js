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

import * as achievement from '../src/server/helpers/achievement';
import * as common from './common';
import * as testData from '../data/test-data.js';
import orm from './bookbrainz-data';
import rewire from 'rewire';


const {Editor} = orm;

const Achievement = rewire('../src/server/helpers/achievement.js');

function rewireNothing() {
	return common.rewire(Achievement, {});
}

function expectIds(rev) {
	return common.expectIds('revisionist', rev);
}

function expectRevNamedIds(rev) {
	return common.expectRevNamedIds('Revisionist', 'revisionist', rev);
}

function expectAllNamedIds(rev) {
	return common.expectAllNamedIds('Revisionist', 'revisionist', rev);
}

export default function tests() {
	beforeEach(
		() => testData.createEditor().then(() => testData.createRevisionist())
	);
	afterEach(testData.truncate);

	const test1 = common.testAchievement(
		rewireNothing(),
		() => new Editor({name: testData.editorAttribs.name})
			.fetch()
			.then((editor) => editor.set({revisionsApplied: 1}).save())
			.then((editor) => achievement.processEdit(orm, editor.id))
			.then((edit) => edit.revisionist['Revisionist I']),
		expectIds('I')
	);
	it('I should be given to someone with a revision', test1);

	const test2 = common.testAchievement(
		rewireNothing(),
		() => new Editor({name: testData.editorAttribs.name})
			.fetch()
			.then((editor) => editor.set({revisionsApplied: 50}).save())
			.then((editor) => achievement.processEdit(orm, editor.id))
			.then((edit) => edit.revisionist),
		expectRevNamedIds('II')
	);
	it('II should be given to someone with 50 revisions', test2);

	const test3 = common.testAchievement(
		rewireNothing(),
		() => new Editor({name: testData.editorAttribs.name})
			.fetch()
			.then((editor) => editor.set({revisionsApplied: 250}).save())
			.then((editor) => achievement.processEdit(orm, editor.id))
			.then((edit) => edit.revisionist),
		expectAllNamedIds('III')
	);
	it('III should be given to someone with 250 revisions', test3);

	const test4 = common.testAchievement(
		rewireNothing(),
		() => new Editor({name: testData.editorAttribs.name})
			.fetch()
			.then((editor) => achievement.processEdit(orm, editor.id))
			.then((edit) => edit.revisionist['Revisionist I']),
		common.expectFalse()
	);
	it('should not be given to someone without a revision', test4);
}
