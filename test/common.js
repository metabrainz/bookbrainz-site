/*
 * Copyright (C) 2017  Robin Richtsfeld
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

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;

export function expectAchievementIds(promise, editorId, achievementId) {
	return Promise.all([
		expect(promise).to.eventually.have
			.property('editorId', editorId),
		expect(promise).to.eventually.have
			.property('achievementId', achievementId)
	]);
}

export function expectAchievementIdsNested(promise, name,
	editorId, achievementId, titleId) {
	return Promise.all([
		expect(promise).to.eventually.have.nested
			.property(`${name} III.editorId`, editorId),
		expect(promise).to.eventually.have.nested
			.property(`${name} III.achievementId`, achievementId),
		expect(promise).to.eventually.have.nested
			.property(`${name}.editorId`, editorId),
		expect(promise).to.eventually.have.nested
			.property(`${name}.titleId`, titleId)
	]);
}
