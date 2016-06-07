'use strict';

const chai = require('../node_modules/chai');
const chaiAsPromised = require('../node_modules/chai-as-promised');
chai.use(chaiAsPromised);
const utils = require('../src/server/helpers/utils');
const Achievement = require('../src/server/helpers/achievement.js');

const AchievementType = require('bookbrainz-data').AchievementType;
const AchievementUnlock = require('bookbrainz-data').AchievementUnlock;
const Editor = require('bookbrainz-data').Editor;
const EditorType = require('bookbrainz-data').EditorType;
const Bookshelf = require('../node_modules/bookshelf');

const reviserAttribs = {
	id: 1,
	name: 'alice',
	email: 'alice@test.org',
	typeId: 1,
	revisionsApplied: 1
};

const editorAttribs = {
	id: 2,
	name: 'bob',
	email: 'bob@test.org',
	password: 'test',
	typeId: 1,
	revisionsApplied: 0
};

const revisionistAttribs = {
	id: 1,
	name: 'Revisionist I',
	description: 'create one revision',
	badgeUrl: 'http://test.com'
};

function truncate() {
	return utils.truncateTables(Bookshelf, [
		'bookbrainz.editor',
		'bookbrainz.editor_type',
		'bookbrainz.achievement_type',
		'bookbrainz.achievement_unlock'
	]);
}

describe('Revisionist achievement', () => {
	beforeEach(() => {
		new EditorType({id: 1, label: 'Editor'})
			.save()
			.then(() => {
				new Editor(editorAttribs)
				.save();
			})
			.then(() => {
				new Editor(reviserAttribs)
				.save();
			})
			.then(() => {
				new AchievementType(revisionistAttribs)
				.save();
			});
	});

	afterEach(truncate);

	it('should give someone with a revision Revisionist I', () => {
		Achievement.processEdit(reviserAttribs.id);
		return AchievementUnlock({editorId: reviserAttribs.id,
			achievementId: revisionistAttribs.id})
			.fetch()
			.should.eventually.not.equal(null);
	});

	it('should not give someone without a revision Revisionist I', () => {
		Achievement.processEdit(editorAttribs.id);
		return AchievementUnlock({editorId: editorAttribs.id,
			achievementId: revisionistAttribs.id})
			.fetch()
			.should.eventually.equal(null);
	});
});
