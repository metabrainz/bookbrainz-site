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
const Promise = require('bluebird');
const achievement = {};
const Bookshelf = require('bookbrainz-data').bookshelf;

const _ = require('lodash');

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

// tiers = [{threshold, name}]
function testTiers(signal, editorId, tiers) {
	const promiseList = [];
	let achievementPromise;
	let achievementAwarded = false;
	for (let i = 0; i < tiers.length; i++) {
		if (signal > tiers[i].threshold) {
			achievementAwarded = true;
			promiseList.push(
				new AchievementType({name: tiers[i].name})
					.fetch({require: true})
					.then((achievementTier) =>
						awardAchievement(editorId, achievementTier.id))
			);
		}
	}
	if (achievementAwarded) {
		achievementPromise = Promise.all(promiseList);
	}
	else {
		achievementPromise = Promise.resolve();
	}
	return achievementPromise;
}

function getTypeRevisions(type, editor) {
	// TODO make this work with bookshelf or move elsewhere
	const snakeType = _.snakeCase(type);
	const rawsql = 'SELECT foo.id, bookbrainz.' + snakeType + '.id ' +
				'FROM' +
				'(SELECT * FROM bookbrainz.revision ' +
				'WHERE author_id=' + editor + ') AS foo ' +
				'INNER JOIN ' +
				'bookbrainz.' + snakeType + ' on ' +
				'foo.id = bookbrainz.' + snakeType + '.id';
	return Bookshelf.knex.raw(rawsql)
		.then((out) => out.rowCount);

}

function processRevisionist(editorId) {
	return new Editor({id: editorId})
		.fetch()
		.then((editor) => {
			const revisions = editor.attributes.revisionsApplied;
			const tiers = [
				{threshold: 250, name: 'Revisionist III'},
				{threshold: 50, name: 'Revisionist II'},
				{threshold: 1, name: 'Revisionist I'}
			];
			return testTiers(revisions, editorId, tiers);
		});
}

function processCreatorCreator(editorId) {
	getTypeRevisions('creatorRevision', editorId)
		.then((rowCount) => {
			let creatorPromise;
			const tiers = [
				{threshold: 100, name: 'Creator Creator III'},
				{threshold: 10, name: 'Creator Creator II'},
				{threshold: 1, name: 'Creator Creator I'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}

function processLimitedEdition(editorId) {
	getTypeRevisions('editionRevision', editorId)
		.then((rowCount) => {
			const tiers = [
				{threshold: 100, name: 'Limited Edition III'},
				{threshold: 10, name: 'Limited Edition II'},
				{threshold: 1, name: 'Limited Edition I'}
			];
		});
}


achievement.processPageVisit = () => {

};

achievement.processEdit = (userid) =>
	Promise.join(
		processRevisionist(userid),
		processCreatorCreator(userid)
	);


achievement.processComment = () => {

};

module.exports = achievement;
