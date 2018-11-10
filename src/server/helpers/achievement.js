/*
 * Copyright (C) 2016  Max Prettyjohns
 *               2018  Ben Ockmore
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

// @flow

/**
 * Achievement Module
 * @module Achievement
 */

/* eslint prefer-spread: 1, prefer-reflect: 1, no-magic-numbers: 0 */
import * as error from './error';
import Log from 'log';
import _ from 'lodash';
import config from './config';


const log = new Log(config.site.log);

/**
 * Awards an Unlock type with awardAttribs if not already awarded
 * @param {function} UnlockType - Either TitleUnlock or AchievementUnlock
 * @param {object} awardAttribs - Values that are supplied to Unlock constructor
 * @returns {object} - 'already unlocked' or JSON of new unlock
 */
async function awardUnlock(UnlockType, awardAttribs) {
	try {
		const award = await new UnlockType(awardAttribs).fetch();
		if (award === null) {
			const unlock = await new UnlockType(awardAttribs)
				.save(null, {method: 'insert'});

			return unlock.toJSON();
		}

		return 'already unlocked';
	}
	catch (err) {
		throw err;
	}
}

/**
 * Awards an Achievement
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} editorID - The editor the achievement will be awarded to
 * @param {string} achievementName - Name of achievement in database
 * @returns {object} - {achievementName: unlock} where unlock is JSON returned
 * from awardUnlock
 * @memberof module:Achievement
 */
async function awardAchievement(orm, editorID, achievementName) {
	const {AchievementType, AchievementUnlock} = orm;
	const achievementTier = await new AchievementType({name: achievementName})
		.fetch();

	if (achievementTier === null) {
		throw new error.AwardNotUnlockedError(
			`Achievement ${achievementName} not found in database`
		);
	}

	const achievementAttribs = {
		achievementId: achievementTier.id,
		editorId: editorID
	};
	try {
		const unlock = await awardUnlock(AchievementUnlock, achievementAttribs);

		const out = {};
		out[achievementName] = unlock;
		return out;
	}
	catch (err) {
		throw new error.AwardNotUnlockedError(err.message);
	}
}

/**
 * Awards a Title
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} editorID - The editor the title will be assigned to
 * @param {object} tier - Achievement Tier the Title (if it exists) belongs to
 * @returns {object} - {tier.titleName: unlock} where unlock comes from
 * awardUnlock or false if the title is not in the tier
 * @memberof module:Achievement
 */
async function awardTitle(orm, editorID, tier) {
	const {TitleType, TitleUnlock} = orm;
	if (tier.titleName) {
		const title = await new TitleType({title: tier.titleName})
			.fetch();

		if (title === null) {
			throw new error.AwardNotUnlockedError(
				`Title ${tier.titleName} not found in database`
			);
		}

		const titleAttribs = {
			editorId: editorID,
			titleId: title.id
		};
		try {
			const unlock = await awardUnlock(TitleUnlock, titleAttribs);
			const out = {};
			out[tier.titleName] = unlock;
			return out;
		}
		catch (err) {
			throw new error.AwardNotUnlockedError(err.message);
		}
	}

	return false;
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
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} signal - Value tier threshold will be compared against
 * @param {int} editorID - Editor to award achievements/titles to
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
async function testTiers(orm, signal, editorID, tiers) {
	async function tierToAward(tier) {
		if (signal >= tier.threshold) {
			try {
				const [achievementUnlock, title] = await Promise.all([
					awardAchievement(orm, editorID, tier.name),
					awardTitle(orm, editorID, tier)
				]);

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

		const out = {};
		out[tier.name] = false;
		if (tier.titleName) {
			out[tier.titleName] = false;
		}
		return [out];
	}

	const awardList = await Promise.all(tiers.map(tierToAward));

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
async function getTypeCreation(revisionType, revisionString, editor) {
	// TODO: Use database count(*) rather than JavaScript Array.length
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
		.fetchAll();

	return out.length;
}

async function processRevisionist(orm, editorID: number) {
	const {Editor} = orm;
	const editor = await new Editor({id: editorID}).fetch();

	const revisions = editor.get('revisionsApplied');
	const tiers = [
		{name: 'Revisionist III', threshold: 250, titleName: 'Revisionist'},
		{name: 'Revisionist II', threshold: 50},
		{name: 'Revisionist I', threshold: 1}
	];
	return testTiers(orm, revisions, editorID, tiers);
}

async function processCreatorCreator(orm, editorID: number) {
	const {CreatorRevision} = orm;
	const rowCount = await getTypeCreation(
		new CreatorRevision(), 'creator_revision', editorID
	);

	const tiers = [
		{
			name: 'Creator Creator III',
			threshold: 100,
			titleName: 'Creator Creator'
		},
		{name: 'Creator Creator II', threshold: 10},
		{name: 'Creator Creator I', threshold: 1}
	];
	return testTiers(orm, rowCount, editorID, tiers);
}

async function processLimitedEdition(orm, editorID: number) {
	const {EditionRevision} = orm;
	const rowCount = await getTypeCreation(
		new EditionRevision(), 'edition_revision', editorID
	);

	const tiers = [
		{
			name: 'Limited Edition III',
			threshold: 100,
			titleName: 'Limited Edition'
		},
		{name: 'Limited Edition II', threshold: 10},
		{name: 'Limited Edition I', threshold: 1}
	];
	return testTiers(orm, rowCount, editorID, tiers);
}

async function processPublisher(orm, editorID: number) {
	const {PublicationRevision} = orm;
	const rowCount = await getTypeCreation(
		new PublicationRevision(), 'publication_revision', editorID
	);

	const tiers = [
		{name: 'Publisher III', threshold: 100, titleName: 'Publisher'},
		{name: 'Publisher II', threshold: 10},
		{name: 'Publisher I', threshold: 1}
	];
	return testTiers(orm, rowCount, editorID, tiers);
}

async function processPublisherCreator(orm, editorID: number) {
	const {PublisherRevision} = orm;
	const rowCount = await getTypeCreation(
		new PublisherRevision(), 'publisher_revision', editorID
	);

	const tiers = [
		{
			name: 'Publisher Creator III',
			threshold: 100,
			titleName: 'Publisher Creator'
		},
		{name: 'Publisher Creator II', threshold: 10},
		{name: 'Publisher Creator I', threshold: 1}
	];
	return testTiers(orm, rowCount, editorID, tiers);
}

async function processWorkerBee(orm, editorID: number) {
	const {WorkRevision} = orm;
	const rowCount = await getTypeCreation(
		new WorkRevision(), 'work_revision', editorID
	);

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
	return testTiers(orm, rowCount, editorID, tiers);
}

async function processSprinter(orm, editorID: number) {
	const {bookshelf} = orm;
	const rawSql =
		`SELECT * from bookbrainz.revision WHERE author_id=${editorID} \
		and created_at > (SELECT CURRENT_DATE - INTERVAL '1 hour');`;

	const out = await bookshelf.knex.raw(rawSql);
	const tiers = [
		{
			name: 'Sprinter',
			threshold: 10,
			titleName: 'Sprinter'
		}
	];
	return testTiers(orm, out.rowCount, editorID, tiers);
}

/**
 * Gets number of distinct days the editor created revisions within specified
 * time limit
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} editorID - Editor to query on
 * @param {int} days - Number of days before today to collect edits from
 * @returns {int} - Number of days edits were performed on
 */
async function getEditsInDays(orm, editorID: number, days) {
	const {bookshelf} = orm;
	const rawSql =
		`SELECT DISTINCT created_at::date from bookbrainz.revision \
		WHERE author_id=${editorID} \
		and created_at > (SELECT CURRENT_DATE - INTERVAL '${days} days');`;

	const out = await bookshelf.knex.raw(rawSql);
	return out.rowCount;
}

async function processFunRunner(orm, editorID: number) {
	const rowCount = await getEditsInDays(orm, editorID, 6);

	const tiers = [
		{name: 'Fun Runner', threshold: 7, titleName: 'Fun Runner'}
	];
	return testTiers(orm, rowCount, editorID, tiers);
}

async function processMarathoner(orm, editorID: number) {
	const rowCount = await getEditsInDays(orm, editorID, 29);

	const tiers = [
		{name: 'Marathoner', threshold: 30, titleName: 'Marathoner'}
	];
	return testTiers(orm, rowCount, editorID, tiers);
}

/**
 * Converts achievementTier object to a list of achievementUnlock id's,
 * this will be used to notify the user which achievement they unlocked
 * @param {object}  achievementUnlock - A track of achievements containing
 * unlock JSON for each
 * @returns {list} - A list of achievementUnlock id's
 */
function achievementToUnlockID(achievementUnlock) {
	const unlockIDs = [];
	Object.keys(achievementUnlock).forEach((key) => {
		if (achievementUnlock[key].id) {
			unlockIDs.push(String(achievementUnlock[key].id));
		}
	});
	return unlockIDs;
}

/**
 * Gets days since edition release date, positive implies released in future
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} revisionID - Revision to get release date of
 * @returns {int} - Days since edition was released
 */
async function getEditionDateDifference(orm, revisionID) {
	const {EditionRevision} = orm;

	try {
		const edition = await new EditionRevision({id: revisionID}).fetch();
		const data = await edition.related('data').fetch();
		const releaseEventSet = await data.related('releaseEventSet').fetch();
		const releaseEvents = await releaseEventSet.related('releaseEvents').fetch();

		if (releaseEvents.length > 0) {
			const msInOneDay = 86400000;
			const attribs = releaseEvents.models[0].attributes;
			const date = new Date(
				attribs.year,
				attribs.month - 1,
				attribs.day
			);
			const now = new Date(Date.now());
			return Math.round((date.getTime() - now.getTime()) / msInOneDay);
		}

		throw new Error('no date attribute');
	}
	catch (err) {
		throw new Error('no date attribute');
	}
}

async function processTimeTraveller(orm, editorID, revisionID) {
	try {
		const diff = await getEditionDateDifference(orm, revisionID);

		const tiers = [{
			name: 'Time Traveller',
			threshold: 0,
			titleName: 'Time Traveller'
		}];
		return testTiers(orm, diff, editorID, tiers);
	}
	catch (err) {
		return {'Time Traveller': err};
	}
}

async function processHotOffThePress(orm, editorID, revisionID) {
	try {
		const diff = await getEditionDateDifference(orm, revisionID);

		if (diff < 0) {
			const tiers = [{
				name: 'Hot Off the Press',
				threshold: -7,
				titleName: 'Hot Off the Press'
			}];
			return testTiers(orm, diff, editorID, tiers);
		}

		return {'Hot Off the Press': false};
	}
	catch (err) {
		return {'Hot Off the Press': err};
	}
}

/**
 * Returns number of distinct entities viewed by an editor
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} editorID - Editor to get views for
 * @returns {int} - Number of views user has
 */
async function getEntityVisits(orm, editorID) {
	const {EditorEntityVisits} = orm;
	const visits = await new EditorEntityVisits().where('editor_id', editorID)
		.fetchAll({require: true});

	return visits.length;
}

async function processExplorer(orm, editorID) {
	try {
		const visits = await getEntityVisits(editorID);

		const tiers = [
			{name: 'Explorer I', threshold: 10},
			{name: 'Explorer II', threshold: 100},
			{name: 'Explorer III', threshold: 1000, titleName: 'Explorer'}
		];
		return testTiers(orm, visits, editorID, tiers);
	}
	catch (err) {
		return {Explorer: err};
	}
}


export async function processPageVisit(orm, editorID) {
	const explorer = await processExplorer(orm, editorID);

	const unlockIDs = achievementToUnlockID(explorer);
	const alert = unlockIDs.join(',');

	return {alert, explorer};
}

/**
 * Run each time an edit occurs on the site, will test for each achievement
 * type
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {int} editorID - ID of the user to query
 * @param {int} revisionID - ID of latest revision
 * @returns {object} - Output of each achievement test as well as an alert
 * containing id's for each unlocked achievement in .alert
 */
export async function processEdit(orm, editorID, revisionID) {
	const results = await Promise.all([
		processRevisionist(orm, editorID),
		processCreatorCreator(orm, editorID),
		processLimitedEdition(orm, editorID),
		processPublisher(orm, editorID),
		processPublisherCreator(orm, editorID),
		processWorkerBee(orm, editorID),
		processSprinter(orm, editorID),
		processFunRunner(orm, editorID),
		processMarathoner(orm, editorID),
		processTimeTraveller(orm, editorID, revisionID),
		processHotOffThePress(orm, editorID, revisionID)
	]);

	const [
		revisionist, creatorCreator, limitedEdition, publisher,
		publisherCreator, workerBee, sprinter, funRunner, marathoner,
		timeTraveller, hotOffThePress
	] = results;

	const alertList = _.flatten(results.map(achievementToUnlockID));
	const alert = alertList.join(',');

	return {
		alert,
		creatorCreator,
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
}

export function processComment() {
	// empty
}
