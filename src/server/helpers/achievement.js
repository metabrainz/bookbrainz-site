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

const AchievementType = require('bookbrainz-data').AchievementType;
const AchievementUnlock = require('bookbrainz-data').AchievementUnlock;
const Editor = require('bookbrainz-data').Editor;
const CreatorRevision = require('bookbrainz-data').CreatorRevision;
const Revision = require('bookbrainz-data').Revision;
const Promise = require('bluebird');
const achievement = {};
const Bookshelf = require('bookbrainz-data').bookshelf;

function awardAchievement(editorId, achievementId) {
	const achievementAttribs = {
		editorId,
		achievementId
	};
	return new AchievementUnlock(achievementAttribs)
	.fetch()
	.then((unlock) => {
		let awardPromise;
		if (unlock === null) {
			awardPromise = new AchievementUnlock(achievementAttribs)
				.save(null, {method: 'insert'});
		}
		else {
			awardPromise = Promise.resolve();
		}
		return awardPromise;
	});
}

// list is in order of descending threshold
// { signal: number to compare, i.e num revisions,
// { tiers: list of objects with achievements name 
// [{threshold, "achievement string}, ...]}
function testTiers(attributes) {
	const signal = attributes.signal;
	for (let i = 0; i < tiers.length; i++) {
		if (signal > tiers[i].threshold) {
			return new AchievementType({
				name: tiers[i].name
			})
				.fetch()
				.then((achievement)) =>
				awardAchievement(editorId, achievement.id);
		}
	}
	return Promise.resolve();
}

function processRevisionist(editorId) {
	return new Editor({id: editorId})
		.fetch()
		.then((editor) => {
			let revisionistPromise;
			const revisions = editor.attributes.revisionsApplied;
			if (revisions > 0) {
				if (revisions > 250) {
					revisionistPromise =
						new AchievementType({name: 'Revisionist III'});
				}
				else if (revisions > 50) {
					revisionistPromise =
						new AchievementType({name: 'Revisionist II'});
				}
				else {
					revisionistPromise =
						new AchievementType({name: 'Revisionist I'});
				}
					revisionistPromise
						.fetch()
						.then((revisionist) =>
							awardAchievement(editorId, revisionist.id));
			}
			else {
				revisionistPromise = Promise.resolve();
			}
			return revisionistPromise;
		});
}

function processCreatorCreator(editorId) {
	// TODO make this work with bookshelf or move elsewhere
	const rawsql = 'SELECT foo.id, bookbrainz.creator_revision.id FROM (SELECT * FROM bookbrainz.revision WHERE author_id=' + editorId + ') AS foo INNER JOIN bookbrainz.creator_revision on foo.id = bookbrainz.creator_revision.id';
	Bookshelf.knex.raw(rawsql)
		.then((out) => {
			let creatorPromise;
			const rowCount = out.rowCount;
			if (rowCount > 0) {
				if (rowCount > 100) {
					creatorPromise =
						new AchievementType({name: 'Creator Creator III'});
				}
				else if (rowCount > 10) {
					creatorPromise =
						new AchievementType({name: 'Creator Creator II'});
				}
				else {
					creatorPromise =
						new AchievementType({name: 'Creator Creator I'});
				}
				creatorPromise
					.fetch()
					.then((creator) => {
						awardAchievement(editorId, creator.id);
					});
			}
			else {
				creatorPromise = Promise.resolve();
			}
			return creatorPromise;
		});
}


achievement.processPageVisit = () => {

};

achievement.processEdit = (userid) => {
	return Promise.join(
		processRevisionist(userid),
		processCreatorCreator(userid)
	);
}

achievement.processComment = () => {

};

module.exports = achievement;
