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
const Revision = require('bookbrainz-data').Revision;
const TitleType = require('bookbrainz-data').TitleType;
const TitleUnlock = require('bookbrainz-data').TitleUnlock;
const CreatorRevision = require('bookbrainz-data').CreatorRevision;
const EditionRevision = require('bookbrainz-data').EditionRevision;
const PublicationRevision = require('bookbrainz-data').PublicationRevision;
const PublisherRevision = require('bookbrainz-data').PublisherRevision;
const WorkRevision = require('bookbrainz-data').WorkRevision;

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
 * In testTiers a tier is mapped to a list of achievements/titles this
 * converts it to an object keyed by achievementName where it is easier
 * to find a specific achievement.
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

/**
 * Returns number of revisions of a certain type there are for the specified
 * editor
 * @param {function} revisionType - Constructor for the revisionType
 * @param {string} revisionString - Snake case string of revisionType
 * @param {int} editor - Editor id being queried
 * @returns {int} - Number of revisions of type (type)
 */
function getTypeRevisions(revisionType, revisionString, editor) {
	return revisionType
		.query((qb) => {
			qb.innerJoin('bookbrainz.revision',
				'bookbrainz.revision.id',
				`bookbrainz.${revisionString}.id`);
			qb.groupBy(`${revisionString}.id`,
				`${revisionString}.bbid`,
				'revision.id');
			qb.where('bookbrainz.revision.author_id', '=', editor);
		})
		.fetchAll()
		.then((out) => out.length);
}

/**
 * Returns number of revisions of a certain type created by a specified
 * editor
 * @param {function} revisionType - Constructor for the revisionType
 * @param {string} revisionString - Snake case string of revisionType
 * @param {int} editor - Editor id being queried
 * @returns {int} - Number of revisions of type (type)
 */
function getTypeCreation(revisionType, revisionString, editor) {
	return revisionType
		.query((qb) => {
			qb.innerJoin('bookbrainz.revision',
				'bookbrainz.revision.id',
				`bookbrainz.${revisionString}.id`);
			qb.groupBy(`${revisionString}.id`,
				`${revisionString}.bbid`,
				'revision.id');
			qb.where('bookbrainz.revision.author_id', '=', editor);
			qb.leftOuterJoin('bookbrainz.revision_parent',
				'bookbrainz.revision_parent.child_id',
				`bookbrainz.${revisionString}.id`);
			qb.whereNull('bookbrainz.revision_parent.parent_id');
		})
		.fetchAll()
		.then((out) => out.length);
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
	return getTypeCreation(new CreatorRevision(), 'creator_revision', editorId)
		.then((rowCount) => {
			const tiers = [
				{threshold: 25, name: 'Creator Creator III',
					titleName: 'Creator Creator'},
				{threshold: 10, name: 'Creator Creator II'},
				{threshold: 1, name: 'Creator Creator I'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}

function processLimitedEdition(editorId) {
	return getTypeCreation(new EditionRevision(), 'edition_revision', editorId)
		.then((rowCount) => {
			const tiers = [
				{threshold: 25, name: 'Limited Edition III',
					titleName: 'Limited Edition'},
				{threshold: 10, name: 'Limited Edition II'},
				{threshold: 1, name: 'Limited Edition I'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}

function processPublisher(editorId) {
	return getTypeCreation(new PublicationRevision(),
		'publication_revision',
		editorId)
		.then((rowCount) => {
			const tiers = [
				{threshold: 25, name: 'Publisher III',
					titleName: 'Publisher'},
				{threshold: 10, name: 'Publisher II'},
				{threshold: 1, name: 'Publisher I'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}

function processPublisherCreator(editorId) {
	return getTypeCreation(new PublisherRevision(),
		'publisher_revision',
		editorId)
		.then((rowCount) => {
			const tiers = [
				{threshold: 25, name: 'Publisher Creator III',
					titleName: 'Publisher Creator'},
				{threshold: 10, name: 'Publisher Creator II'},
				{threshold: 1, name: 'Publisher Creator I'}
			];
			return testTiers(rowCount, editorId, tiers);
		});
}

function processWorkerBee(editorId) {
	return getTypeCreation(new WorkRevision(),
		'work_revision',
		editorId)
		.then((rowCount) => {
			const tiers = [
				{threshold: 25, name: 'Worker Bee III',
					titleName: 'Worker Bee'},
				{threshold: 10, name: 'Worker Bee II'},
				{threshold: 1, name: 'Worker Bee I'}
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

/**
 * Gets number of distinct days the editor created revisions within specified
 * time limit
 * @param {int} editorId - Editor to query on
 * @param {int} days - Number of days before today to collect edits from
 * @returns {int} - Number of days edits were performed on
 */
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

/**
 * Converts achievementTier object to a list of achievementUnlock id's,
 * this will be used to notify the user which achievement they unlocked
 * @param {object}  achievementUnlock - A track of achievements containing
 * unlock JSON for each
 * @returns {list} - A list of achievementUnlock id's
 */
function achievementToUnlockId(achievementUnlock) {
	const unlockIds = [];
	Object.keys(achievementUnlock).forEach((key) => {
		if (achievementUnlock[key].id) {
			unlockIds.push(String(achievementUnlock[key].id));
		}
	});
	return unlockIds;
}

achievement.processPageVisit = () => {
};

/**
 * Run each time an edit occurs on the site, will test for each achievement
 * type
 * @param {int} userid - Id of the user to query
 * @returns {object} - Output of each achievement test as well as an alert
 * containing id's for each unlocked achievement in .alert
 */
achievement.processEdit = (userid) =>
	Promise.join(
		processRevisionist(userid),
		processCreatorCreator(userid),
		processLimitedEdition(userid),
		processPublisher(userid),
		processPublisherCreator(userid),
		processWorkerBee(userid),
		processSprinter(userid),
		processFunRunner(userid),
		processMarathoner(userid),
		(revisionist,
		creatorCreator,
		limitedEdition,
		publisher,
		publisherCreator,
		workerBee,
		sprinter,
		funRunner,
		marathoner) => {
			let alert = [];
			alert.push(
				achievementToUnlockId(revisionist),
				achievementToUnlockId(creatorCreator),
				achievementToUnlockId(limitedEdition),
				achievementToUnlockId(publisher),
				achievementToUnlockId(publisherCreator),
				achievementToUnlockId(workerBee),
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
				publisherCreator,
				workerBee,
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
