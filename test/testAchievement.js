'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const utils = require('../node_modules/bookbrainz-data/util.js');

const _ = require('lodash');

const bookbrainzData = require('./bookbrainz-data.js');
const Bookshelf = require('./bookbrainz-data.js').bookshelf;
const AchievementType = require('./bookbrainz-data').AchievementType;
const AchievementUnlock = require('./bookbrainz-data').AchievementUnlock;
const Editor = require('./bookbrainz-data').Editor;
const EditorType = require('./bookbrainz-data').EditorType;
const Achievement = require('../src/server/helpers/achievement.js');
const Gender = require('./bookbrainz-data').Gender;

const genderAttribs = {
	id: 1,
	name: 'test'
};

const editorTypeAttribs = {
	id: 1,
	label: 'test_type'
};

const reviserAttribs = {
	id: 1,
	name: 'alice',
	email: 'alice@test.org',
	password: 'test',
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

const reviserAttribsOptional = _.assign(_.clone(reviserAttribs), {
	genderId: 1
});

const editorAttribsOptional = _.assign(_.clone(editorAttribs), {
	genderId: 1
});

const revisionistAttribs = {
	id: 1,
	name: 'Revisionist I',
	description: 'create one revision',
	badgeUrl: 'http://test.com'
};

const unlockAttribs = {editorId: reviserAttribsOptional.id};

function truncate() {
	return utils.truncateTables(Bookshelf, [
		'bookbrainz.editor',
		'bookbrainz.editor_type',
		'bookbrainz.achievement_type',
		'bookbrainz.achievement_unlock',
		'musicbrainz.gender'
	]);
}

describe('Revisionist achievement', () => {
	beforeEach(() => new Gender(genderAttribs)
			.save(null, {method: 'insert'})
			.then(() => {
				new EditorType(editorTypeAttribs)
				.save(null, {method: 'insert'});
			})
			.then(() =>
				new AchievementType(revisionistAttribs)
				.save(null, {method: 'insert'})
			)
	);

	afterEach(truncate);

	it('should give someone with a revision Revisionist I', () => {
		const achievementPromise = new Editor(reviserAttribsOptional)
			.save(null, {method: 'insert'})
			.then((editor) => {
				Achievement.processEdit(editor);
			})
			.then(() =>
				new AchievementUnlock(unlockAttribs)
					.fetch()
			);

		return expect(achievementPromise).to.eventually.not.equal(null);
	});

	it('should not give someone without a revision Revisionist I', () => {
		const achievementPromise = new Editor(editorAttribsOptional)
			.save(null, {method: 'insert'})
			.then((editor) => {
				Achievement.processEdit(editor);
			})
			.then(() =>
				new AchievementUnlock(unlockAttribs)
					.fetch()
			);

		return expect(achievementPromise).to.be.rejected;
	});
});
