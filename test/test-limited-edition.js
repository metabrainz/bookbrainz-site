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
import orm from './bookbrainz-data';
import rewire from 'rewire';


const Achievement =	rewire('../src/server/helpers/achievement.js');

const thresholdI = 1;
const thresholdII = 10;
const thresholdIII = 100;

function rewireTypeCreation(threshold) {
	return common.rewireTypeCreation(Achievement, 'edition', threshold);
}

function getRevAttrPromise(rev) {
	return common.getAttrPromise(
		Achievement, orm, true, 'limitedEdition', `Limited Edition ${rev}`
	);
}

function expectIds(rev) {
	return common.expectIds('limitedEdition', rev);
}

function expectAllNamedIds(rev) {
	return common.expectAllNamedIds('Limited Edition', 'limitedEdition', rev);
}

export default function tests() {
	beforeEach(() => testData.createLimitedEdition());
	afterEach(testData.truncate);

	const test1 = common.testAchievement(
		rewireTypeCreation(thresholdI),
		getRevAttrPromise('I'),
		expectIds('I')
	);
	it('I should given to someone with an edition creation', test1);

	const test2 = common.testAchievement(
		rewireTypeCreation(thresholdII),
		getRevAttrPromise('II'),
		expectIds('II')
	);
	it('II should be given to someone with 10 edition creations', test2);

	const test3 = common.testAchievement(
		rewireTypeCreation(thresholdIII),
		common.getAttrPromise(Achievement, orm, true, 'limitedEdition'),
		expectAllNamedIds('III')
	);
	it('III should be given to someone with 100 edition creations', test3);

	const test4 = common.testAchievement(
		rewireTypeCreation(0),
		getRevAttrPromise('I'),
		common.expectFalse()
	);
	it('should not given to someone with 0 edition creations', test4);
}
