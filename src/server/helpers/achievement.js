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

/**
 * Achievement Module
 * @module Achievement
 */

/* eslint prefer-spread: 1, prefer-reflect: 1, no-magic-numbers: 0 */
import * as error from '../../common/helpers/error';

import {flattenDeep, isNil} from 'lodash';
import log from 'log';


/**
 * Awards an Unlock type with awardAttribs if not already awarded
 * @param {function} UnlockType - Either TitleUnlock or AchievementUnlock
 * @param {object} awardAttribs - Values that are supplied to Unlock constructor
 * @returns {object} - 'already unlocked' or JSON of new unlock
 */
function awardUnlock(UnlockType, awardAttribs) {
	return new UnlockType(awardAttribs)
		.fetch({require: false})
		.then((award) => {
			if (award === null || typeof award === 'undefined') {
				return new UnlockType(awardAttribs)
					.save(null, {method: 'insert'})
					.then((unlock) => unlock.toJSON());
			}
			return new Promise((resolve) => resolve('Already unlocked'));
		})
		.catch(err => new Promise((resolve, reject) => reject(err)));
}

/**
 * Awards an Achievement
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} editorId - The editor the achievement will be awarded to
 * @param {string} achievementName - Name of achievement in database
 * @returns {object} - {achievementName: unlock} where unlock is JSON returned
 * from awardUnlock
 * @memberof module:Achievement
 */
function awardAchievement(orm, editorId, achievementName) {
	const {AchievementType, AchievementUnlock} = orm;
	return new AchievementType({name: achievementName})
		.fetch({require: false})
		.then((achievementTier) => {
			let awardPromise;
			if (achievementTier === null) {
				awardPromise = new Promise((resolve, reject) =>
					reject(new error.AwardNotUnlockedError(
						`Achievement ${achievementName} not found in database`
					)));
			}
			else {
				const achievementAttribs = {
					achievementId: achievementTier.id,
					editorId
				};
				awardPromise =
					awardUnlock(AchievementUnlock, achievementAttribs)
						.then((unlock) => {
							const out = {};
							out[achievementName] = unlock;
							return out;
						})
						.catch((err) => new Promise((resolve, reject) => reject(
							new error.AwardNotUnlockedError(err.message)
						)));
			}
			return awardPromise;
		});
}

/**
 * Awards a Title
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} editorId - The editor the title will be assigned to
 * @param {object} tier - Achievement Tier the Title (if it exists) belongs to
 * @returns {object} - {tier.titleName: unlock} where unlock comes from
 * awardUnlock or false if the title is not in the tier
 * @memberof module:Achievement
 */
function awardTitle(orm, editorId, tier) {
	const {TitleType, TitleUnlock} = orm;
	let titlePromise;
	if (tier.titleName) {
		titlePromise = new TitleType({title: tier.titleName})
			.fetch({require: false})
			.then((title) => {
				let awardPromise;
				if (title === null) {
					awardPromise = new Promise((resolve, reject) => reject(
						new error.AwardNotUnlockedError(
							`Title ${tier.titleName} not found in database`
						)
					));
				}
				else {
					const titleAttribs = {
						editorId,
						titleId: title.id
					};
					awardPromise = awardUnlock(TitleUnlock, titleAttribs)
						.then((unlock) => {
							const out = {};
							out[tier.titleName] = unlock;
							return out;
						})
						.catch((err) => new Promise((resolve, reject) => reject(
							new error.AwardNotUnlockedError(err.message)
						)));
				}
				return awardPromise;
			});
	}
	else {
		titlePromise = new Promise(resolve => resolve(false));
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
	if (awardList) {
		awardList.forEach((awardSet) => {
			if (!isNil(awardSet)) {
				awardSet.forEach((award) => {
					if (!isNil(award)) {
						Object.keys(award).forEach((key) => {
							track[key] = award[key];
						});
					}
				});
			}
		});
	}
	return track;
}

/**
 * Takes a list of achievement 'tiers' and awards the related achievement and
 * title if the signal is greater than or equal to the threshold
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
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
function testTiers(orm, signal, editorId, tiers) {
	const tierPromise = tiers.map((tier) => {
		let tierOut;
		if (signal >= tier.threshold) {
			tierOut = Promise.all([
				awardAchievement(orm, editorId, tier.name),
				awardTitle(orm, editorId, tier)
			])
				.then(([achievementUnlock, title]) => {
					const out = [];
					if (title) {
						out.push(title);
					}
					out.push(achievementUnlock);
					return out;
				})
				.catch((err) => log.debug(err));
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
		.then((awardList) => awardListToAwardObject(awardList));
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
		.fetchAll({require: false})
		.then((out) => out.length);
}

function processRevisionist(orm, editorId) {
	const {Editor} = orm;
	return new Editor({id: editorId})
		.fetch({require: false})
		.then((editor) => {
			const revisions = editor.get('revisionsApplied');
			const tiers = [
				{
					name: 'Revisionist III',
					threshold: 250,
					titleName: 'Revisionist'
				},
				{
					name: 'Revisionist II',
					threshold: 50
				},
				{
					name: 'Revisionist I',
					threshold: 1
				}
			];
			return testTiers(orm, revisions, editorId, tiers);
		});
}

function processAuthorCreator(orm, editorId) {
	const {AuthorRevision} = orm;
	return getTypeCreation(new AuthorRevision(), 'author_revision', editorId)
		.then((rowCount) => {
			const tiers = [
				{
					name: 'Author Creator III',
					threshold: 100,
					titleName: 'Author Creator'
				},
				{
					name: 'Author Creator II',
					threshold: 10
				},
				{
					name: 'Author Creator I',
					threshold: 1
				}
			];
			return testTiers(orm, rowCount, editorId, tiers);
		});
}

function processLimitedEdition(orm, editorId) {
	const {EditionRevision} = orm;
	return getTypeCreation(new EditionRevision(), 'edition_revision', editorId)
		.then((rowCount) => {
			const tiers = [
				{
					name: 'Limited Edition III',
					threshold: 100,
					titleName: 'Limited Edition'
				},
				{
					name: 'Limited Edition II',
					threshold: 10
				},
				{
					name: 'Limited Edition I',
					threshold: 1
				}
			];
			return testTiers(orm, rowCount, editorId, tiers);
		});
}

function processPublisher(orm, editorId) {
	const {EditionGroupRevision} = orm;
	return getTypeCreation(new EditionGroupRevision(),
		'edition_group_revision',
		editorId)
		.then((rowCount) => {
			const tiers = [
				{
					name: 'Publisher III',
					threshold: 100,
					titleName: 'Publisher'
				},
				{
					name: 'Publisher II',
					threshold: 10
				},
				{
					name: 'Publisher I',
					threshold: 1
				}
			];
			return testTiers(orm, rowCount, editorId, tiers);
		});
}

function processPublisherCreator(orm, editorId) {
	const {PublisherRevision} = orm;
	return getTypeCreation(new PublisherRevision(),
		'publisher_revision',
		editorId)
		.then((rowCount) => {
			const tiers = [
				{
					name: 'Publisher Creator III',
					threshold: 100,
					titleName: 'Publisher Creator'
				},
				{
					name: 'Publisher Creator II',
					threshold: 10
				},
				{
					name: 'Publisher Creator I',
					threshold: 1
				}
			];
			return testTiers(orm, rowCount, editorId, tiers);
		});
}

function processWorkerBee(orm, editorId) {
	const {WorkRevision} = orm;
	return getTypeCreation(new WorkRevision(),
		'work_revision',
		editorId)
		.then((rowCount) => {
			const tiers = [
				{
					name: 'Worker Bee III',
					threshold: 100,
					titleName: 'Worker Bee'
				},
				{
					name: 'Worker Bee II',
					threshold: 10
				},
				{
					name: 'Worker Bee I',
					threshold: 1
				}
			];
			return testTiers(orm, rowCount, editorId, tiers);
		});
}

function processSprinter(orm, editorId) {
	const {bookshelf} = orm;
	const rawSql =
		`SELECT * from bookbrainz.revision WHERE author_id=${editorId} \
		and created_at > (SELECT CURRENT_DATE - INTERVAL '1 hour');`;

	return bookshelf.knex.raw(rawSql)
		.then((out) => {
			const tiers = [
				{
					name: 'Sprinter',
					threshold: 10,
					titleName: 'Sprinter'
				}
			];
			return testTiers(orm, out.rowCount, editorId, tiers);
		});
}

/**
 * Gets number of distinct days the editor created revisions within specified
 * time limit
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} editorId - Editor to query on
 * @param {int} days - Number of days before today to collect edits from
 * @returns {int} - Number of days edits were performed on
 */
function getEditsInDays(orm, editorId, days) {
	const {bookshelf} = orm;
	const rawSql =
		`SELECT DISTINCT created_at::date from bookbrainz.revision \
		WHERE author_id=${editorId} \
		and created_at > (SELECT CURRENT_DATE - INTERVAL '${days} days');`;

	return bookshelf.knex.raw(rawSql)
		.then((out) => out.rowCount);
}

function processFunRunner(orm, editorId) {
	return getEditsInDays(orm, editorId, 6)
		.then((rowCount) => {
			const tiers = [
				{
					name: 'Fun Runner',
					threshold: 7,
					titleName: 'Fun Runner'
				}
			];
			return testTiers(orm, rowCount, editorId, tiers);
		});
}

function processMarathoner(orm, editorId) {
	return getEditsInDays(orm, editorId, 29)
		.then((rowCount) => {
			const tiers = [{
				name: 'Marathoner',
				threshold: 30,
				titleName: 'Marathoner'
			}];
			return testTiers(orm, rowCount, editorId, tiers);
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

/**
 * Gets days since edition release date, positive implies released in future
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} revisionId - Revision to get release date of
 * @returns {int} - Days since edition was released
 */
function getEditionDateDifference(orm, revisionId) {
	const {EditionRevision} = orm;
	return new EditionRevision({id: revisionId}).fetch()
		.then((edition) => edition.related('data').fetch())
		.then((data) => data.related('releaseEventSet').fetch())
		.then(
			(releaseEventSet) =>
				releaseEventSet.related('releaseEvents').fetch()
		)
		.then((releaseEvents) => {
			let differencePromise;
			if (releaseEvents.length > 0) {
				const msInOneDay = 86400000;
				const attribs = releaseEvents.models[0].attributes;
				const date = new Date(
					attribs.year,
					attribs.month - 1,
					attribs.day
				);
				const now = new Date(Date.now());
				differencePromise =
					Math.round((date.getTime() - now.getTime()) / msInOneDay);
			}
			else {
				differencePromise =
				new Promise((resolve, reject) => reject(new Error('no date attribute')));
			}
			return differencePromise;
		})
		.catch(() => new Promise((resolve, reject) => reject(new Error('no date attribute'))));
}

function processTimeTraveller(orm, editorId, revisionId) {
	return getEditionDateDifference(orm, revisionId)
		.then((diff) => {
			const tiers = [{
				name: 'Time Traveller',
				threshold: 0,
				titleName: 'Time Traveller'
			}];
			return testTiers(orm, diff, editorId, tiers);
		})
		.catch((err) => ({'Time Traveller': err}));
}

function processHotOffThePress(orm, editorId, revisionId) {
	return getEditionDateDifference(orm, revisionId)
		.then((diff) => {
			let achievementPromise;
			if (diff < 0) {
				const tiers = [{
					name: 'Hot Off the Press',
					threshold: -7,
					titleName: 'Hot Off the Press'
				}];
				achievementPromise = testTiers(orm, diff, editorId, tiers);
			}
			else {
				achievementPromise = new Promise(resolve => resolve(
					{'Hot Off the Press': false}
				));
			}
			return achievementPromise;
		})
		.catch((err) => ({'Hot Off the Press': err}));
}

/**
 * Returns number of distinct entities viewed by an editor
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} editorId - Editor to get views for
 * @returns {int} - Number of views user has
 */
function getEntityVisits(orm, editorId) {
	const {EditorEntityVisits} = orm;
	return new EditorEntityVisits()
		.where('editor_id', editorId)
		.fetchAll({require: true})
		.then((visits) => visits.length);
}

function processExplorer(orm, editorId) {
	return getEntityVisits(editorId)
		.then((visits) => {
			const tiers = [
				{
					name: 'Explorer I',
					threshold: 10
				},
				{
					name: 'Explorer II',
					threshold: 100
				},
				{
					name: 'Explorer III',
					threshold: 1000,
					titleName: 'Explorer'
				}
			];
			return testTiers(orm, visits, editorId, tiers);
		})
		.catch((err) => ({Explorer: err}));
}


export async function processPageVisit(orm, userId) {
	const explorer = await processExplorer(orm, userId);

	const unlockIds = achievementToUnlockId(explorer);
	const alert = unlockIds.join(',');

	return {
		alert,
		explorer
	};
}

/**
 * Run each time an edit occurs on the site, will test for each achievement
 * type
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} userId - Id of the user to query
 * @param {int} revisionId - Id of latest revision
 * @returns {object} - Output of each achievement test as well as an alert
 * containing id's for each unlocked achievement in .alert
 */
export function processEdit(orm, userId, revisionId) {
	return Promise.all([
		processRevisionist(orm, userId),
		processAuthorCreator(orm, userId),
		processLimitedEdition(orm, userId),
		processPublisher(orm, userId),
		processPublisherCreator(orm, userId),
		processWorkerBee(orm, userId),
		processSprinter(orm, userId),
		processFunRunner(orm, userId),
		processMarathoner(orm, userId),
		processTimeTraveller(orm, userId, revisionId),
		processHotOffThePress(orm, userId, revisionId)
	])
		.then(([
			revisionist,
			authorCreator,
			limitedEdition,
			publisher,
			publisherCreator,
			workerBee,
			sprinter,
			funRunner,
			marathoner,
			timeTraveller,
			hotOffThePress
		]) => {
			let alert = [];
			alert.push(
				achievementToUnlockId(revisionist),
				achievementToUnlockId(authorCreator),
				achievementToUnlockId(limitedEdition),
				achievementToUnlockId(publisher),
				achievementToUnlockId(publisherCreator),
				achievementToUnlockId(workerBee),
				achievementToUnlockId(sprinter),
				achievementToUnlockId(funRunner),
				achievementToUnlockId(marathoner),
				achievementToUnlockId(timeTraveller),
				achievementToUnlockId(hotOffThePress)
			);
			alert = flattenDeep(alert);
			alert = alert.join(',');
			return {
				alert,
				authorCreator,
				funRunner,
				hotOffThePress,
				limitedEdition,
				marathoner,
				publisher,
				publisherCreator,
				revisionist,
				sprinter,
				timeTraveller,
				workerBee
			};
		});
}
