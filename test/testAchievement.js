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
const AchievementType = require('./bookbrainz-data').AchievementType;
const TitleType = require('./bookbrainz-data').TitleType;
const Editor = require('./bookbrainz-data').Editor;
const EditorType = require('./bookbrainz-data').EditorType;
const Achievement = require('../src/server/helpers/achievement.js');

const editorTypeAttribs = {
	id: 1,
	label: 'test_type'
};

const editorAttribs = {
	id: 1,
	name: 'bob',
	email: 'bob@test.org',
	password: 'test',
	typeId: 1,
	revisionsApplied: 0
};

const revisionistIAttribs = {
	id: 1,
	name: 'Revisionist I',
	description: 'create one revision',
	badgeUrl: 'http://test.com'
};

const revisionistIIAttribs = {
	id: 2,
	name: 'Revisionist II',
	description: 'create 25 revisions',
	badgeUrl: 'http://test.com'
};

const revisionistIIIAttribs = {
	id: 3,
	name: 'Revisionist III',
	description: 'create 250 revisions',
	badgeUrl: 'http://test.com'
};

const revisionistAttribs = {
	id: 1,
	title: 'Revisionist',
	description: 'create 250 revisions'
};

function truncate() {
	return utils.truncateTables(Bookshelf, [
		'bookbrainz.editor',
		'bookbrainz.editor_type',
		'bookbrainz.achievement_type',
		'bookbrainz.achievement_unlock',
		'bookbrainz.title_type',
		'bookbrainz.title_unlock',
		'musicbrainz.gender'
	]);
}

describe('Revisionist achievement', () => {
	beforeEach(() => new EditorType(editorTypeAttribs)
				.save(null, {method: 'insert'})
			.then(() =>
				new AchievementType(revisionistIAttribs)
				.save(null, {method: 'insert'})
			)
			.then(() =>
				new AchievementType(revisionistIIAttribs)
				.save(null, {method: 'insert'})
			)
			.then(() =>
				new AchievementType(revisionistIIIAttribs)
				.save(null, {method: 'insert'})
			)
			.then(() =>
				new TitleType(revisionistAttribs)
				.save(null, {method: 'insert'})
			)
			.then(() =>
				new Editor(editorAttribs)
				.save(null, {method: 'insert'})
			)
	);

	afterEach(truncate);

	it('should give someone with a revision Revisionist I', () => {
		const achievementPromise = new Editor({name: editorAttribs.name})
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
			.property('editorId', editorAttribs.id),
			expect(achievementPromise).to.eventually.have
			.property('achievementId',
					revisionistIAttribs.id)
		]);
	});

	it('should give someone with 50 revisions Revisionist II', () => {
		const achievementPromise = new Editor({name: editorAttribs.name})
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
			.property('Revisionist II.editorId', editorAttribs.id),
			expect(achievementPromise).to.eventually.have.deep
			.property('Revisionist II.achievementId',
				revisionistIIAttribs.id)
		]);
	});

	it('should give someone with 250 revisions Revisionist III and Revisionist',
		() => {
			const achievementPromise = new Editor({name: editorAttribs.name})
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
				.property('Revisionist III.editorId', editorAttribs.id),
				expect(achievementPromise).to.eventually.have.deep
				.property('Revisionist III.achievementId',
					revisionistIIIAttribs.id),
				expect(achievementPromise).to.eventually.have.deep
				.property('Revisionist.editorId', editorAttribs.id),
				expect(achievementPromise).to.eventually.have.deep
				.property('Revisionist.titleId',
					revisionistAttribs.id)
			]);
		});

	it('should not give someone without a revision Revisionist I', () => {
		const achievementPromise = new Editor({name: editorAttribs.name})
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
