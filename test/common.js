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

/* eslint import/namespace: ['error', { allowComputed: true }] */
import * as testData from '../data/test-data.js';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';


chai.use(chaiAsPromised);
const {expect} = chai;

export function expectIds(prop, rev) {
	return (promise) => Promise.all([
		expect(promise).to.eventually.have
			.property('editorId', testData.editorAttribs.id),
		expect(promise).to.eventually.have
			.property('achievementId', testData[`${prop}${rev}Attribs`].id)
	]);
}

export function expectIdsNested(name, prop, rev) {
	return (promise) => Promise.all([
		expect(promise).to.eventually.have.nested
			.property(`${name} ${rev}.editorId`,
				testData.editorAttribs.id),
		expect(promise).to.eventually.have.nested
			.property(`${name} ${rev}.achievementId`,
				testData[`${prop}${rev}Attribs`].id),
		expect(promise).to.eventually.have.nested
			.property(`${name}.editorId`,
				testData.editorAttribs.id),
		expect(promise).to.eventually.have.nested
			.property(`${name}.titleId`,
				testData[`${prop}Attribs`].id)
	]);
}

export function generateProcessEdit(Achievement, orm, func, name, rev) {
	return () => testData.createEditor()
		.then((editor) => Achievement.processEdit(orm, editor.id))
		.then((edit) => edit[func][`${name} ${rev}`]);
}

export function generateProcessEditNamed(Achievement, orm, func, name) {
	return () => new orm.Editor({name: testData.editorAttribs.name})
		.fetch()
		.then((editor) => Achievement.processEdit(orm, editor.id))
		.then((edit) => edit[func][name]);
}

export function rewireAchievement(Achievement, rewiring) {
	return () => Achievement.__set__(rewiring);
}

export function rewireTypeCreation(Achievement, name, threshold) {
	return rewireAchievement(Achievement, {
		getTypeCreation:
			testData.typeCreationHelper(
				`${name}_revision`, threshold
			)
	});
}

export function testAchievement(rewiring, generator, expectations) {
	return () => {
		rewiring();
		const promise = generator();
		return expectations(promise);
	};
}
