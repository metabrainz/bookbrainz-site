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

export function expectFalse() {
	return (promise) => expect(promise).to.eventually.equal(false);
}


export function expectIds(prop, rev) {
	return async (promise) => {
		const results = await Promise.all([
			expect(promise).to.eventually.have
				.property('editorId', testData.editorAttribs.id),
			expect(promise).to.eventually.have
				.property('achievementId', testData[`${prop}${rev}Attribs`].id)
		]);
		return results;
	};
}


export function expectRevNamedIds(name, prop, rev) {
	return async (promise) => {
		const results = await Promise.all([
			expect(promise).to.eventually.have.nested
				.property(`${name} ${rev}.editorId`,
					testData.editorAttribs.id),
			expect(promise).to.eventually.have.nested
				.property(`${name} ${rev}.achievementId`,
					testData[`${prop}${rev}Attribs`].id)
		]);
		return results;
	};
}

export function expectAllNamedIds(name, prop, rev) {
	return async (promise) => {
		const results = await Promise.all([
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
		return results;
	};
}

export function getAttrPromise(Achievement, orm, full) {
	return () => {
		const editorPromise = full ? testData.createEditor() :
			new orm.Editor({name: testData.editorAttribs.name}).fetch();
		return editorPromise
			.then((editor) => Achievement.processEdit(orm, editor.id))
			.then((editor) => {
				let value = editor;

				for (let index = 3; index < arguments.length; index++) {
					value = value[arguments[index]];
				}

				return value;
			});
	};
}

export function rewire(Achievement, rewiring) {
	return () => Achievement.__set__(rewiring);
}

export function rewireTypeCreation(Achievement, name, threshold) {
	return rewire(Achievement, {
		getTypeCreation:
			testData.typeCreationHelper(
				`${name}_revision`, threshold
			)
	});
}

export function testAchievement(rewiring, attrPromise, expectations) {
	return () => {
		rewiring();
		const promise = attrPromise();
		return expectations(promise);
	};
}
