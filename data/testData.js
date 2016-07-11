const testData = {};

const Editor = require('../test/bookbrainz-data').Editor;
const EditorType = require('../test/bookbrainz-data').EditorType;
const AchievementType = require('../test/bookbrainz-data').AchievementType;
const TitleType = require('../test/bookbrainz-data').TitleType;

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

module.exports = testData;
