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

import * as error from '../../common/helpers/error';

import {differenceInCalendarDays, parseISO} from 'date-fns';
import {flattenDeep, isNil} from 'lodash';
import log from 'log';


/**
 * Awards an Unlock type with awardAttribs if not already awarded
 * @param {function} UnlockType - Either TitleUnlock or AchievementUnlock
 * @param {object} awardAttribs - Values that are supplied to Unlock constructor
 * @returns {object} - 'already unlocked' or JSON of new unlock
 */
async function awardUnlock(UnlockType, awardAttribs) {
	const award = await new UnlockType(awardAttribs).fetch({require: false});
	if (award === null || typeof award === 'undefined') {
		const unlock = await new UnlockType(awardAttribs).save(null, {method: 'insert'});
		return unlock.toJSON();
	}
	return 'Already unlocked';
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
async function awardAchievement(orm, editorId, achievementName) {
	const {AchievementType, AchievementUnlock} = orm;
	const achievementTier = await new AchievementType({name: achievementName})
		.fetch({require: false});
	if (achievementTier === null) {
		throw new error.AwardNotUnlockedError(`Achievement ${achievementName} not found in database`);
	}
	else {
		try {
			const achievementAttribs = {
				achievementId: achievementTier.id,
				editorId
			};
			const unlock = await awardUnlock(AchievementUnlock, achievementAttribs);
			return {[achievementName]: unlock};
		}
		catch (err) {
			throw new error.AwardNotUnlockedError(err.message);
		}
	}
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
async function awardTitle(orm, editorId, tier) {
	const {TitleType, TitleUnlock} = orm;
	if (tier.titleName) {
		const title = await new TitleType({title: tier.titleName})
			.fetch({require: false});
		if (title === null) {
			throw new error.AwardNotUnlockedError(`Title ${tier.titleName} not found in database`);
		}
		else {
			try {
				const titleAttribs = {
					editorId,
					titleId: title.id
				};
				const unlock = await awardUnlock(TitleUnlock, titleAttribs);
				return {[tier.titleName]: unlock};
			}
			catch (err) {
				throw new error.AwardNotUnlockedError(err.message);
			}
		}
	}
	else {
		return false;
	}
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
async function testTiers(orm, signal, editorId, tiers) {
	const tierPromise = tiers.map(async (tier) => {
		if (signal >= tier.threshold) {
			try {
				const achievementUnlock = await awardAchievement(orm, editorId, tier.name);
				const title = await awardTitle(orm, editorId, tier);
				const out = [];
				if (title) {
					out.push(title);
				}
				out.push(achievementUnlock);
				return out;
			}
			catch (err) {
				return log.debug(err);
			}
		}
		else {
			const out = {};
			out[tier.name] = false;
			if (tier.titleName) {
				out[tier.titleName] = false;
			}
			return [out];
		}
	});
	const awardList = await Promise.all(tierPromise);
	return awardListToAwardObject(awardList);
}

/**
 * Returns number of revisions of a certain type created by a specified
 * editor
 * @param {function} revisionType - Constructor for the revisionType
 * @param {string} revisionString - Snake case string of revisionType
 * @param {int} editor - Editor id being queried
 * @returns {int} - Number of revisions of type (type)
 */
export async function getTypeCreation(revisionType, revisionString, editor) {
	const out = await revisionType
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
		.fetchAll({require: false});
	return out.length;
}

async function processRevisionist(orm, editorId) {
	const {Editor} = orm;
	const editor = await new Editor({id: editorId})
		.fetch({require: false});
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
}

async function processAuthorCreator(orm, editorId) {
	const {AuthorRevision} = orm;
	const rowCount = await getTypeCreation(new AuthorRevision(), 'author_revision', editorId);
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
}

async function processLimitedEdition(orm, editorId) {
	const {EditionRevision} = orm;
	const rowCount = await getTypeCreation(new EditionRevision(), 'edition_revision', editorId);
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
}

async function processPublisher(orm, editorId) {
	const {EditionGroupRevision} = orm;
	const rowCount = await getTypeCreation(new EditionGroupRevision(),
		'edition_group_revision',
		editorId);
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
}

async function processPublisherCreator(orm, editorId) {
	const {PublisherRevision} = orm;
	const rowCount = await getTypeCreation(new PublisherRevision(),
		'publisher_revision',
		editorId);
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
}

async function processWorkerBee(orm, editorId) {
	const {WorkRevision} = orm;
	const rowCount = await getTypeCreation(new WorkRevision(),
		'work_revision',
		editorId);
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
}

async function processSeriesCreator(orm, editorId) {
	const {SeriesRevision} = orm;
	const rowCount = await getTypeCreation(new SeriesRevision(),
		'series_revision',
		editorId);
	const tiers = [
		{
			name: 'Series Creator III',
			threshold: 100,
			titleName: 'Series Creator'
		},
		{
			name: 'Series Creator II',
			threshold: 10
		},
		{
			name: 'Series Creator I',
			threshold: 1
		}
	];
	return testTiers(orm, rowCount, editorId, tiers);
}

async function processSprinter(orm, editorId) {
	const {bookshelf} = orm;
	const rawSql =
		`SELECT * from bookbrainz.revision WHERE author_id=${editorId} \
		and created_at > (SELECT CURRENT_DATE - INTERVAL '1 hour');`;

	const out = await bookshelf.knex.raw(rawSql);
	const tiers = [
		{
			name: 'Sprinter',
			threshold: 10,
			titleName: 'Sprinter'
		}
	];
	return testTiers(orm, out.rowCount, editorId, tiers);
}

/**
 * Gets number of consecutive days from today the editor created revisions upto a specified
 * time limit
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} editorId - Editor to query on
 * @param {int} days - Number of days before today to collect edits from
 * @returns {int} - Number of consecutive days edits were performed on
 */
export async function getConsecutiveDaysWithEdits(orm, editorId, days) {
	const {bookshelf} = orm;
	const rawSql =
		`SELECT DISTINCT created_at::date from bookbrainz.revision \
		WHERE author_id=${editorId} \
		and created_at > (SELECT CURRENT_DATE - INTERVAL '${days} days');`;

	const out = await bookshelf.knex.raw(rawSql);
	const dateList = out.rows.map(row => parseISO(row.created_at));
	let countDays = 0;
	let lastDate = new Date();
	// count number of consecutive days starting from today
	for (let i = dateList.length - 1; i >= 0; i--) {
		if (differenceInCalendarDays(lastDate, dateList[i]) > 1) {
			break;
		}
		countDays++;
		lastDate = dateList[i];
	}
	return countDays;
}

async function processFunRunner(orm, editorId) {
	const rowCount = await getConsecutiveDaysWithEdits(orm, editorId, 6);
	const tiers = [
		{
			name: 'Fun Runner',
			threshold: 7,
			titleName: 'Fun Runner'
		}
	];
	return testTiers(orm, rowCount, editorId, tiers);
}

async function processMarathoner(orm, editorId) {
	const rowCount = await getConsecutiveDaysWithEdits(orm, editorId, 29);
	const tiers = [{
		name: 'Marathoner',
		threshold: 30,
		titleName: 'Marathoner'
	}];
	return testTiers(orm, rowCount, editorId, tiers);
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
async function getEditionDateDifference(orm, revisionId) {
	const {EditionRevision} = orm;
	try {
		const edition = await new EditionRevision({id: revisionId}).fetch({withRelated: 'data.releaseEventSet.releaseEvents'});
		const editionJSON = edition.toJSON();
		const {releaseEvents} = editionJSON.data.releaseEventSet;

		if (releaseEvents.length > 0) {
			const msInOneDay = 86400000;
			const attribs = releaseEvents[0];
			const date = new Date(
				attribs.year,
				attribs.month - 1,
				attribs.day
			);
			const now = Date.now();
			return Math.round((date.getTime() - now) / msInOneDay);
		}

		throw new Error('no date attribute');
	}
	catch (err) {
		throw new Error('no date attribute');
	}
}
async function processTimeTraveller(orm, editorId, revisionId) {
	try {
		const diff = await getEditionDateDifference(orm, revisionId);
		const tiers = [{
			name: 'Time Traveller',
			threshold: 0,
			titleName: 'Time Traveller'
		}];
		return testTiers(orm, diff, editorId, tiers);
	}
	catch (err) {
		return {'Time Traveller': err};
	}
}

async function processHotOffThePress(orm, editorId, revisionId) {
	try {
		const diff = await getEditionDateDifference(orm, revisionId);
		if (diff < 0) {
			const tiers = [{
				name: 'Hot Off the Press',
				threshold: -7,
				titleName: 'Hot Off the Press'
			}];
			return testTiers(orm, diff, editorId, tiers);
		}

		return	{'Hot Off the Press': false};
	}
	catch (err) {
		return {'Hot Off the Press': err};
	}
}

/**
 * Returns number of distinct entities viewed by an editor
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} editorId - Editor to get views for
 * @returns {int} - Number of views user has
 */
export async function getEntityVisits(orm, editorId) {
	const {EditorEntityVisits} = orm;
	try {
		const visits = await new EditorEntityVisits()
			.where('editor_id', editorId)
			.fetchAll({require: true});
		return visits.length;
	}
	catch (err) {
		return 0;
	}
}

async function processExplorer(orm, editorId) {
	try {
		const visits = await getEntityVisits(orm, editorId);

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
	}
	catch (err) {
		return {Explorer: err};
	}
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
export async function processEdit(orm, userId, revisionId) {
	const revisionist = await processRevisionist(orm, userId);
	const authorCreator = await processAuthorCreator(orm, userId);
	const limitedEdition = await processLimitedEdition(orm, userId);
	const publisher = await processPublisher(orm, userId);
	const publisherCreator = await processPublisherCreator(orm, userId);
	const workerBee = await processWorkerBee(orm, userId);
	const seriesCreator = await processSeriesCreator(orm, userId);
	const sprinter = await processSprinter(orm, userId);
	const funRunner = await processFunRunner(orm, userId);
	const marathoner = await processMarathoner(orm, userId);
	const timeTraveller = await processTimeTraveller(orm, userId, revisionId);
	const hotOffThePress = await processHotOffThePress(orm, userId, revisionId);
	let alert = [];
	alert.push(
		achievementToUnlockId(revisionist),
		achievementToUnlockId(authorCreator),
		achievementToUnlockId(limitedEdition),
		achievementToUnlockId(publisher),
		achievementToUnlockId(publisherCreator),
		achievementToUnlockId(workerBee),
		achievementToUnlockId(seriesCreator),
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
		seriesCreator,
		sprinter,
		timeTraveller,
		workerBee
	};
}
