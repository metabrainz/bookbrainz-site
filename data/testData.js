'use strict';

const testData = {};

const Editor = require('../test/bookbrainz-data').Editor;
const EditorType = require('../test/bookbrainz-data').EditorType;
const AchievementType = require('../test/bookbrainz-data').AchievementType;
const TitleType = require('../test/bookbrainz-data').TitleType;
const Revision = require('../test/bookbrainz-data').Revision;
const CreatorRevision = require('../test/bookbrainz-data').CreatorRevision;

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

testData.creatorCreatorIAttribs = {
	id: 2,
	name: 'Creator Creator I',
	description: 'create 10 creators',
	badgeUrl: 'http://test.com'
};

testData.creatorCreatorIAttribs = {
	id: 3,
	name: 'Creator Creator II',
	description: 'create 100 creators',
	badgeUrl: 'http://test.com'
};

testData.creatorCreatorAttribs = {
	id: 1,
	title: 'Creator Creator',
	description: 'Complete Creator Creator track'
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
		)
		.then(() =>
			new AchievementType(this.creatorCreatorIIIAttribs)
		)
		.then(() =>
			new TitleType(this.creatorCreatorAttribs)
		);
}

testData.creatorCreatorHelper = function(creatorNumber) {
	const promiseList = [];
	for (i = 0; i < creatorNumber; i++) {
		promiseList.push(
			new Revision({
				authorId: this.editorAttribs.id
			})
				.save(null, {method: 'insert'})
				.then((revision) => {
				//need to figure out how to generate a bbid here
				return new CreatorRevision({
					id: revision.id
				})
				.save(null, {method: 'insert'});
			})
		);
	}
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

module.exports = testData;
