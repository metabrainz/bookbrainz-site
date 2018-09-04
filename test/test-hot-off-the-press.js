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


const Achievement = rewire('../src/server/helpers/achievement.js');

const hotOffThePressThreshold = -7;

function rewireEditionDateDifference(threshold) {
	return common.rewire(Achievement, {
		getEditionDateDifference: () =>
			Promise.resolve(threshold)
	});
}

function getRevAttrPromise() {
	return common.getAttrPromise(
		Achievement, orm, false, 'hotOffThePress', 'Hot Off the Press'
	);
}

function expectIds(rev) {
	return common.expectIds('hotOffThePress', rev);
}

export default function tests() {
	beforeEach(
		() => testData.createEditor()
			.then(() => testData.createHotOffThePress())
	);
	afterEach(testData.truncate);

	const test1 = common.testAchievement(
		rewireEditionDateDifference(hotOffThePressThreshold),
		getRevAttrPromise(),
		expectIds('')
	);
	it('should be given to someone with edition revision released this week',
		test1);

	const test2 = common.testAchievement(
		rewireEditionDateDifference(hotOffThePressThreshold - 1),
		common.getAttrPromise(
			Achievement, orm, false, 'timeTraveller', 'Time Traveller'
		),
		common.expectFalse()
	);
	it('shouldn\'t be given when edition revision released a week ago', test2);
}
