'use strict';

const chai = require('../node_modules/chai');
const chaiAsPromised = require('../node_modules/chai-as-promised');
chai.use(chaiAsPromised);
const utils = require('../src/server/helpers/utils');
const Achievement = require('../src/server/helpers/achievement.js');
const assert = require('../node_modules/chai').assert;

const AchievementType = require('bookbrainz-data').AchievementType;
const AchievementUnlock = require('bookbrainz-data').AchievementUnlock;
const Editor = require('bookbrainz-data').Editor;
const EditorType = require('bookbrainz-data').EditorType;
const Bookshelf = require('../node_modules/bookshelf');

const editorAttribs = {
	id: 1,
	name: 'bob',
	email: 'bob@test.org',
	password: 'test',
	typeId: 1,
	revisionsApplied: 1
};


const revisionistAttribs = {
	id: 1,
	name: 'Revisionist I',
	description: 'create one revision',
	badgeUrl: 'http://test.com'
};

describe('Revisionist achievement', () => {
	beforeEach(() => {
		new EditorType({id: 1, label: 'Editor'})
			.save()
			.then(() => {
				new Editor(editorAttribs)
				.save();
			})
			.then(() => {
				new AchievementType(revisionistAttribs)
				.save();
			});
	});

	it('should have given editor an achievement', () => {
		Achievement.processEdit(editorAttribs.id);
		return AchievementUnlock({editorId: 1, achievementId: 1}).fetch()
			.should.eventually.not.equal(null);
	});
});
