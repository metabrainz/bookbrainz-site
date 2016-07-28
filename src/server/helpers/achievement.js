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
const TitleType = require('bookbrainz-data').TitleType;
const TitleUnlock = require('bookbrainz-data').TitleUnlock;

const Promise = require('bluebird');
const Bookshelf = require('bookbrainz-data').bookshelf;

const _ = require('lodash');

/**
 * Achievement Module
 * @module Achievement
 */
const achievement = {};

/**
 * Awards an Unlock type with awardAttribs if not already awarded
 * @param {function} UnlockType - Either TitleUnlock or AchievementUnlock
 * @param {object} awardAttribs - Values that are supplied to Unlock constructor
 * @returns {object} - 'already unlocked' or JSON of new unlock
 */
function awardUnlock(UnlockType, awardAttribs) {
	return new UnlockType(awardAttribs)
		.fetch({require: true})
		.then(() =>
			Promise.resolve('already unlocked')
		)
		.catch(() =>
			new UnlockType(awardAttribs)
				.save(null, {method: 'insert'})
				.then((unlock) =>
					unlock.toJSON()
				)
		);
}

/**
 * Awards an Achievement
 * @param {int} editorId - The editor the achievement will be awarded to
 * @param {string} achievementName - Name of achievement in database
 * @returns {object} - {achievementName: unlock} where unlock is JSON returned
 * from awardUnlock
 * @memberof module:Achievement
 */
function awardAchievement(editorId, achievementName) {
	return new AchievementType({name: achievementName})
		.fetch({require: true})
		.then((achievementTier) => {
			const achievementAttribs = {
				editorId,
				achievementId: achievementTier.id
			};
			return awardUnlock(AchievementUnlock, achievementAttribs)
				.then((unlock) => {
					const out = {};
					out[achievementName] = unlock;
					return out;
				});
		})
		.catch((error) => {
			console.error(error);
			return Promise.reject(error);
		});
}

/**
 * Awards a Title
 * @param {int} editorId - The editor the title will be assigned to
 * @param {object} tier - Achievement Tier the Title (if it exists) belongs to
 * @returns {object} - {tier.titleName: unlock} where unlock comes from
 * awardUnlock or false if the title is not in the tier
 * @memberof module:Achievement
 */
function awardTitle(editorId, tier) {
	let titlePromise;
	if (tier.titleName) {
		titlePromise = new TitleType({title: tier.titleName})
			.fetch({require: true})
			.then((title) => {
				const titleAttribs = {
					editorId,
					titleId: title.id
				};
				return awardUnlock(TitleUnlock, titleAttribs)
					.then((unlock) => {
						const out = {};
						out[tier.titleName] = unlock;
						return out;
					});
			})
			.catch((error) => {
				console.error(error);
				return Promise.reject(error);
			});
	}
	else {
		titlePromise = Promise.resolve(false);
	}
	return titlePromise;
}

/**
 * Reformats a list of list of achievements objects to an object keyed by the
 * achievement names
 * @example
 * awardListToAwardObject([[{'Achievement I': unlockI}]])
 * //returns {'Achievement I': unlockI}
 * @param {object} awardList - List of List of achievement unlocks
 * @returns {object} - Object keyed by achievement name with values
 * unlock json
 */
function awardListToAwardObject(awardList) {
	const track = {};
	awardList.forEach((awardSet) => {
		awardSet.forEach((award) => {
			Object.keys(award).forEach((key) => {
				track[key] = award[key];
			});
		});
	});
	return track;
}

/**
 * Takes a list of achievement 'tiers' and awards the related achievement and
 * title if the signal is greater than or equal to the threshold
 * @param {int} signal - Value tier threshold will be compared against
 * @param {int} editorId - Editor to award achievements/titles to
 * @param {object} tiers - Object with threshold and relatedachievement/title
 * names
 * @example
 * testTiers(10, 1, [{
 * 	threshold: 10, name: 'achievement I', titleName: 'achievement'
 * }])
 * //returns {'achievement I': achievementJSON}
 * @returns {object} - Returns a track of achievements keyed by achievement
 * name/title containing their respective unlockJSON each tier
 */
function testTiers(signal, editorId, tiers) {
	const tierPromise = tiers.map((tier) => {
		let tierOut;
		if (signal >= tier.threshold) {
			tierOut = Promise.join(
				awardAchievement(editorId, tier.name),
				awardTitle(editorId, tier),
				(achievementUnlock, title) => {
					const out = [];
					if (title) {
						out.push(title);
					}
					out.push(achievementUnlock);
					return out;
				}
			);
		}
		else {
			const out = {};
			out[tier.name] = false;
			if (tier.titleName) {
				out[tier.titleName] = false;
			}
			tierOut = [out];
		}
		return tierOut;
	});
	return Promise.all(tierPromise)
		.then((awardList) =>
			awardListToAwardObject(awardList)
		);
}

// returns the number of typeRevisions an editor has
function getTypeRevisions(type, editor) {
	const snakeType = _.snakeCase(type);
	const rawsql = `SELECT revisions.id, bookbrainz.${snakeType}.id \
				FROM \
				(SELECT * FROM bookbrainz.revision \
				WHERE author_id=${editor}) AS revisions \
				INNER JOIN \
				bookbrainz.${snakeType} on \
				revisions.id = bookbrainz.${snakeType}.id`;
	return Bookshelf.knex.raw(rawsql)
		.then((out) => out.rowCount);
}

function processRevisionist(editorId) {
	return new Editor({id: editorId})
		.fetch()
		.then((editor) => {
			const revisions = editor.attributes.revisionsApplied;
			const tiers = [
				{threshold: 250, name: 'Revisionist III',
					titleName: 'Revisionist'},
				{threshold: 50, name: 'Revisionist II'},
				{threshold: 1, name: 'Revisionist I'}
			];
			return testTiers(revisions, editorId, tiers);
		});
}

function processCreatorCreator(editorId) {
	return getTypeRevisions('creatorRevision', editorId)
		.then((rowCount) => {
			const tiers = [
				{threshold: 100, name: 'Creator Creator III',
					titleName: 'Creator Creator'},
				{threshold: 10, name: 'Creator Creator II'},
				{threshold: 1, name: 'Creator Creator I'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}

function processLimitedEdition(editorId) {
	return getTypeRevisions('editionRevision', editorId)
		.then((rowCount) => {
			const tiers = [
				{threshold: 100, name: 'Limited Edition III',
					titleName: 'Limited Edition'},
				{threshold: 10, name: 'Limited Edition II'},
				{threshold: 1, name: 'Limited Edition I'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}

function processPublisher(editorId) {
	return getTypeRevisions('publisherRevision', editorId)
		.then((rowCount) => {
			const tiers = [
				{threshold: 100, name: 'Publisher III',
					titleName: 'Publisher'},
				{threshold: 10, name: 'Publisher II'},
				{threshold: 1, name: 'Publisher I'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}

function processSprinter(editorId) {
	const rawSql =
		`SELECT * from bookbrainz.revision WHERE author_id=${editorId} \
		and created_at > (SELECT CURRENT_DATE - INTERVAL \'1 hour\');`;

	return Bookshelf.knex.raw(rawSql)
		.then((out) => {
			const tiers = [
				{threshold: 10, name: 'Sprinter', titleName: 'Sprinter'}
			];
			return testTiers(out.rowCount, editorId, tiers);
		});
}

function achievementToUnlockId(achievementUnlock) {
	const unlockIds = [];
	Object.keys(achievementUnlock).forEach((key) => {
		if (achievementUnlock[key].id) {
			unlockIds.push(String(achievementUnlock[key].id));
		}
	});
	return unlockIds;
}

function getEditsInDays(editorId, days) {
	const rawSql =
		`SELECT DISTINCT created_at::date from bookbrainz.revision \
		WHERE author_id=${editorId} \
		and created_at > (SELECT CURRENT_DATE - INTERVAL \'${days} days\');`;

	return Bookshelf.knex.raw(rawSql)
		.then((out) => out.rowCount);
}

function processFunRunner(editorId) {
	return getEditsInDays(editorId, 6)
		.then((rowCount) => {
			const tiers = [
				{threshold: 7, name: 'Fun Runner', titleName: 'Fun Runner'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}

function processMarathoner(editorId) {
	return getEditsInDays(editorId, 29)
		.then((rowCount) => {
			const tiers = [
				{threshold: 30, name: 'Marathoner', titleName: 'Marathoner'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}


achievement.processPageVisit = () => {
};

achievement.processEdit = (userid) =>
	Promise.join(
		processRevisionist(userid),
		processCreatorCreator(userid),
		processLimitedEdition(userid),
		processPublisher(userid),
		processSprinter(userid),
		processFunRunner(userid),
		processMarathoner(userid),
		(revisionist,
		creatorCreator,
		limitedEdition,
		publisher,
		sprinter,
		funRunner,
		marathoner) => {
			let alert = [];
			alert.push(
				achievementToUnlockId(revisionist),
				achievementToUnlockId(creatorCreator),
				achievementToUnlockId(limitedEdition),
				achievementToUnlockId(publisher),
				achievementToUnlockId(sprinter),
				achievementToUnlockId(funRunner),
				achievementToUnlockId(marathoner)
			);
			alert = [].concat.apply([], alert);
			alert = alert.join(',');
			return {
				revisionist,
				creatorCreator,
				limitedEdition,
				publisher,
				sprinter,
				funRunner,
				marathoner,
				alert
			};
		}
	);


achievement.processComment = () => {

};

module.exports = achievement;
