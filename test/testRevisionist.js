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
const utils = require('../node_modules/bookbrainz-data/util.js');
const Promise = require('bluebird');

const Bookshelf = require('./bookbrainz-data.js').bookshelf;
const Editor = require('./bookbrainz-data').Editor;
const Achievement = require('../src/server/helpers/achievement.js');
const testData = require('../data/testData.js');

describe('Revisionist achievement', () => {
	beforeEach(() => testData.createEditor()
		.then(() =>
			testData.createRevisionist()
		)
	);

	afterEach(testData.truncate);

	it('should give someone with a revision Revisionist I', () => {
		const achievementPromise = new Editor({
			name: testData.editorAttribs.name
		})
			.fetch()
			.then((editor) =>
				editor.set({revisionsApplied: 1})
				.save()
			)
			.then((editor) =>
				Achievement.processEdit(editor.id)
			)
			.then((edit) =>
				edit.revisionist['Revisionist I']
			);

		return Promise.all([
			expect(achievementPromise).to.eventually.have
			.property('editorId', testData.editorAttribs.id),
			expect(achievementPromise).to.eventually.have
			.property('achievementId',
					testData.revisionistIAttribs.id)
		]);
	});

	it('should give someone with 50 revisions Revisionist II', () => {
		const achievementPromise = new Editor({
			name: testData.editorAttribs.name
		})
			.fetch()
			.then((editor) =>
				editor.set({revisionsApplied: 50})
				.save()
			)
			.then((editor) =>
				Achievement.processEdit(editor.id)
			)
			.then((edit) =>
				edit.revisionist
			);

		return Promise.all([
			expect(achievementPromise).to.eventually.have.deep
			.property('Revisionist II.editorId', testData.editorAttribs.id),
			expect(achievementPromise).to.eventually.have.deep
			.property('Revisionist II.achievementId',
				testData.revisionistIIAttribs.id)
		]);
	});

	it('should give someone with 250 revisions Revisionist III and Revisionist',
		() => {
			const achievementPromise = new Editor({
				name: testData.editorAttribs.name
			})
				.fetch()
				.then((editor) =>
					editor.set({revisionsApplied: 250})
						.save()
				)
				.then((editor) =>
					Achievement.processEdit(editor.id)
				)
				.then((edit) =>
					edit.revisionist
				);

			return Promise.all([
				expect(achievementPromise).to.eventually.have.deep
				.property('Revisionist III.editorId',
					testData.editorAttribs.id),
				expect(achievementPromise).to.eventually.have.deep
				.property('Revisionist III.achievementId',
					testData.revisionistIIIAttribs.id),
				expect(achievementPromise).to.eventually.have.deep
				.property('Revisionist.editorId', testData.editorAttribs.id),
				expect(achievementPromise).to.eventually.have.deep
				.property('Revisionist.titleId',
					testData.revisionistAttribs.id)
			]);
		});

	it('should not give someone without a revision Revisionist I', () => {
		const achievementPromise = new Editor({
			name: testData.editorAttribs.name
		})
			.fetch()
			.then((editor) =>
				Achievement.processEdit(editor.id)
			)
			.then((edit) =>
				edit.revisionist['Revisionist I']
			);

		return expect(achievementPromise).to.eventually.equal(false);
	});
});
