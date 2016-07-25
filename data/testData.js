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

const testData = {};

const Editor = require('../test/bookbrainz-data').Editor;
const EditorType = require('../test/bookbrainz-data').EditorType;
const AchievementType = require('../test/bookbrainz-data').AchievementType;
const TitleType = require('../test/bookbrainz-data').TitleType;
const Revision = require('../test/bookbrainz-data').Revision;
const CreatorRevision = require('../test/bookbrainz-data').CreatorRevision;
const Bookshelf = require('../test/bookbrainz-data.js').bookshelf;
const utils = require('../node_modules/bookbrainz-data/util.js');

testData.editorTypeAttribs = {
	id: 1,
	label: 'test_type'
};

testData.editorAttribs = {
	id: 1,
	name: 'bob',
	email: 'bob@test.org',
	password: 'test',
	typeId: 1,
	revisionsApplied: 0
};

testData.revisionistIAttribs = {
	id: 1,
	name: 'Revisionist I',
	description: 'create one revision',
	badgeUrl: 'http://test.com'
};

testData.revisionistIIAttribs = {
	id: 2,
	name: 'Revisionist II',
	description: 'create 25 revisions',
	badgeUrl: 'http://test.com'
};

testData.revisionistIIIAttribs = {
	id: 3,
	name: 'Revisionist III',
	description: 'create 250 revisions',
	badgeUrl: 'http://test.com'
};

testData.revisionistAttribs = {
	id: 1,
	title: 'Revisionist',
	description: 'create 250 revisions'
};

testData.creatorCreatorIAttribs = {
	id: 1,
	name: 'Creator Creator I',
	description: 'create one creator',
	badgeUrl: 'http://test.com'
};

testData.creatorCreatorIIAttribs = {
	id: 2,
	name: 'Creator Creator II',
	description: 'create 10 creators',
	badgeUrl: 'http://test.com'
};

testData.creatorCreatorIIIAttribs = {
	id: 3,
	name: 'Creator Creator III',
	description: 'create 100 creators',
	badgeUrl: 'http://test.com'
};

testData.creatorCreatorAttribs = {
	id: 1,
	title: 'Creator Creator',
	description: 'Complete Creator Creator track'
};

testData.limitedEditionIAttribs = {
	id: 1,
	name: 'Limited Edition I',
	description: 'create one edition',
	badgeUrl: 'http://test.com'
};

testData.limitedEditionIIAttribs = {
	id: 2,
	name: 'Limited Edition II',
	description: 'create 10 editions',
	badgeUrl: 'http://test.com'
};

testData.limitedEditionIIIAttribs = {
	id: 3,
	name: 'Limited Edition III',
	description: 'create 100 edtions',
	badgeUrl: 'http://test.com'
};

testData.limitedEditionAttribs = {
	id: 1,
	title: 'Limited Edition',
	description: 'Complete limited edition track'
};


testData.publisherIAttribs = {
	id: 1,
	name: 'Publisher I',
	description: 'create one publisher',
	badgeUrl: 'http://test.com'
};

testData.publisherIIAttribs = {
	id: 2,
	name: 'Publisher II',
	description: 'create 10 publishers',
	badgeUrl: 'http://test.com'
};

testData.publisherIIIAttribs = {
	id: 3,
	name: 'Publisher III',
	description: 'create 100 publishers',
	badgeUrl: 'http://test.com'
};

testData.publisherAttribs = {
	id: 1,
	title: 'Publisher',
	description: 'Complete publisher track'
};

testData.sprinterAttribs = {
	id: 1,
	name: 'Sprinter',
	description: 'create 100 creators',
	badgeUrl: 'http://test.com'
};

testData.sprinterTitleAttribs = {
	id: 1,
	title: 'Sprinter',
	description: 'Complete Creator Creator track'
};

testData.createEditor = function() {
	return new EditorType(this.editorTypeAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new Editor(this.editorAttribs)
			.save(null, {method: 'insert'})
		);
}

testData.createRevisionist = function() {
	return new AchievementType(this.revisionistIAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new AchievementType(this.revisionistIIAttribs)
			.save(null, {method: 'insert'})
		)
		.then(() =>
			new AchievementType(this.revisionistIIIAttribs)
			.save(null, {method: 'insert'})
		)
		.then(() =>
			new TitleType(this.revisionistAttribs)
			.save(null, {method: 'insert'})
		)
}

testData.createCreatorCreator = function() {
	return new AchievementType(this.creatorCreatorIAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new AchievementType(this.creatorCreatorIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new AchievementType(this.creatorCreatorIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new TitleType(this.creatorCreatorAttribs)
				.save(null, {method: 'insert'})
		);
}

testData.createLimitedEdition = function() {
	return new AchievementType(this.limitedEditionIAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new AchievementType(this.limitedEditionIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new AchievementType(this.limitedEditionIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new TitleType(this.limitedEditionAttribs)
				.save(null, {method: 'insert'})
		);
}

testData.createPublisher = function() {
	return new AchievementType(this.publisherIAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new AchievementType(this.publisherIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new AchievementType(this.publisherIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new TitleType(this.publisherAttribs)
				.save(null, {method: 'insert'})
		);
}

testData.createSprinter = function() {
	return new AchievementType(this.sprinterAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new TitleType(this.sprinterTitleAttribs)
			.save(null, {method: 'insert'})
		);
}

testData.sprinterHelper = function(numRevisions) {
	const promiseList = [];
	for (let i = 0; i < numRevisions; i++) {
		promiseList.push(
			new Revision({authorId: testData.editorAttribs.id})
				.save(null, {method: 'insert'})
		);
	}
	return Promise.all(promiseList);
}

testData.typeRevisionHelper = function(revisionType, rowcount) {
	return function(type, editor) {
		let rowCountPromise;
		if (type == revisionType) {
			rowCountPromise = Promise.resolve(rowcount);
		}
		else {
			rowCountPromise = Promise.resolve(0);
		}
		return rowCountPromise;
	};
}

testData.truncate = () => utils.truncateTables(Bookshelf, [
		'bookbrainz.editor',
		'bookbrainz.editor_type',
		'bookbrainz.achievement_type',
		'bookbrainz.achievement_unlock',
		'bookbrainz.title_type',
		'bookbrainz.title_unlock',
		'bookbrainz.revision',
		'musicbrainz.gender'
	]);

module.exports = testData;
