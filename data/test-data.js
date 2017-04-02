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

import orm from '../test/bookbrainz-data';

const {
	bookshelf, util, Editor, EditorType, AchievementType, TitleType, Revision
} = orm;

export const editorTypeAttribs = {
	id: 1,
	label: 'test_type'
};

export const editorAttribs = {
	id: 1,
	name: 'bob',
	typeId: 1,
	metabrainzUserId: 1,
	cachedMetabrainzName: 'Bob',
	revisionsApplied: 0
};

export const revisionistIAttribs = {
	id: 1,
	name: 'Revisionist I',
	description: 'create one revision',
	badgeUrl: 'http://test.com'
};

export const revisionistIIAttribs = {
	id: 2,
	name: 'Revisionist II',
	description: 'create 25 revisions',
	badgeUrl: 'http://test.com'
};

export const revisionistIIIAttribs = {
	id: 3,
	name: 'Revisionist III',
	description: 'create 250 revisions',
	badgeUrl: 'http://test.com'
};

export const revisionistAttribs = {
	id: 1,
	title: 'Revisionist',
	description: 'create 250 revisions'
};

export const creatorCreatorIAttribs = {
	id: 1,
	name: 'Creator Creator I',
	description: 'create one creator',
	badgeUrl: 'http://test.com'
};

export const creatorCreatorIIAttribs = {
	id: 2,
	name: 'Creator Creator II',
	description: 'create 10 creators',
	badgeUrl: 'http://test.com'
};

export const creatorCreatorIIIAttribs = {
	id: 3,
	name: 'Creator Creator III',
	description: 'create 100 creators',
	badgeUrl: 'http://test.com'
};

export const creatorCreatorAttribs = {
	id: 1,
	title: 'Creator Creator',
	description: 'Complete Creator Creator track'
};

export const limitedEditionIAttribs = {
	id: 1,
	name: 'Limited Edition I',
	description: 'create one edition',
	badgeUrl: 'http://test.com'
};

export const limitedEditionIIAttribs = {
	id: 2,
	name: 'Limited Edition II',
	description: 'create 10 editions',
	badgeUrl: 'http://test.com'
};

export const limitedEditionIIIAttribs = {
	id: 3,
	name: 'Limited Edition III',
	description: 'create 100 edtions',
	badgeUrl: 'http://test.com'
};

export const limitedEditionAttribs = {
	id: 1,
	title: 'Limited Edition',
	description: 'Complete limited edition track'
};


export const publisherIAttribs = {
	id: 1,
	name: 'Publisher I',
	description: 'create one publisher',
	badgeUrl: 'http://test.com'
};

export const publisherIIAttribs = {
	id: 2,
	name: 'Publisher II',
	description: 'create 10 publishers',
	badgeUrl: 'http://test.com'
};

export const publisherIIIAttribs = {
	id: 3,
	name: 'Publisher III',
	description: 'create 100 publishers',
	badgeUrl: 'http://test.com'
};

export const publisherAttribs = {
	id: 1,
	title: 'Publisher',
	description: 'Complete publisher track'
};

export const sprinterAttribs = {
	id: 1,
	name: 'Sprinter',
	description: 'create 100 creators',
	badgeUrl: 'http://test.com'
};

export const workerBeeIAttribs = {
	id: 1,
	name: 'Worker Bee I',
	description: 'create 1 work',
	badgeUrl: 'http://test.com'
};

export const workerBeeIIAttribs = {
	id: 2,
	name: 'Worker Bee II',
	description: 'create 10 works',
	badgeUrl: 'http://test.com'
};

export const workerBeeIIIAttribs = {
	id: 3,
	name: 'Worker Bee III',
	description: 'create 100 works',
	badgeUrl: 'http://test.com'
};

export const workerBeeAttribs = {
	id: 1,
	description: 'finish worker bee track',
	title: 'Worker Bee',
};

export const explorerIAttribs = {
	id: 1,
	name: 'Explorer I',
	description: 'view 10 entities',
	badgeUrl: 'http://test.com'
};

export const explorerIIAttribs = {
	id: 2,
	name: 'Explorer II',
	description: 'view 100 entities',
	badgeUrl: 'http://test.com'
};

export const explorerIIIAttribs = {
	id: 3,
	name: 'Explorer III',
	description: 'view 1000 entities',
	badgeUrl: 'http://test.com'
};

export const explorerTitleAttribs = {
	id: 1,
	description: 'finish explorer track',
	title: 'Explorer',
};

export const publisherCreatorIAttribs = {
	id: 1,
	name: 'Publisher Creator I',
	description: 'create 1 publisher',
	badgeUrl: 'http://test.com'
};

export const publisherCreatorIIAttribs = {
	id: 2,
	name: 'Publisher Creator II',
	description: 'create 10 publishers',
	badgeUrl: 'http://test.com'
};

export const publisherCreatorIIIAttribs = {
	id: 3,
	name: 'Publisher Creator III',
	description: 'create 100 publishers',
	badgeUrl: 'http://test.com'
};

export const publisherCreatorAttribs = {
	id: 1,
	description: 'finish publisher creator track',
	title: 'Publisher Creator',
};

export const sprinterTitleAttribs = {
	id: 1,
	title: 'Sprinter',
	description: 'Complete Creator Creator track'
};

export const funRunnerAttribs = {
	id: 1,
	name: 'Fun Runner',
	description: 'create a revision a day for a week',
	badgeUrl: 'http://test.com'
};

export const funRunnerTitleAttribs = {
	id: 1,
	title: 'Fun Runner',
	description: 'Complete Fun Runner track'
};

export const marathonerAttribs = {
	id: 1,
	name: 'Marathoner',
	description: 'create a revision a day for 30 days',
	badgeUrl: 'http://test.com'
};

export const marathonerTitleAttribs = {
	id: 1,
	title: 'Marathoner',
	description: 'Complete Marathoner track'
};

export const timeTravellerAttribs = {
	id: 1,
	name: 'Time Traveller',
	description: 'test description',
	badgeUrl: 'http://test.com'
};

export const timeTravellerTitleAttribs = {
	id: 1,
	title: 'Time Traveller',
	description: 'test description'
};

export const hotOffThePressAttribs = {
	id: 1,
	name: 'Hot Off the Press',
	description: 'test description',
	badgeUrl: 'http://test.com'
};

export const hotOffThePressTitleAttribs = {
	id: 1,
	title: 'Hot Off the Press',
	description: 'test description'
};

export function createEditor() {
	return new EditorType(editorTypeAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new Editor(editorAttribs)
			.save(null, {method: 'insert'})
		);
}

export function createRevisionist() {
	return new AchievementType(revisionistIAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new AchievementType(revisionistIIAttribs)
			.save(null, {method: 'insert'})
		)
		.then(() =>
			new AchievementType(revisionistIIIAttribs)
			.save(null, {method: 'insert'})
		)
		.then(() =>
			new TitleType(revisionistAttribs)
			.save(null, {method: 'insert'})
		);
}

export function createCreatorCreator() {
	return new AchievementType(creatorCreatorIAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new AchievementType(creatorCreatorIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new AchievementType(creatorCreatorIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new TitleType(creatorCreatorAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createLimitedEdition() {
	return new AchievementType(limitedEditionIAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new AchievementType(limitedEditionIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new AchievementType(limitedEditionIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new TitleType(limitedEditionAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createPublisher() {
	return new AchievementType(publisherIAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new AchievementType(publisherIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new AchievementType(publisherIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new TitleType(publisherAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createWorkerBee() {
	return new AchievementType(workerBeeIAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new AchievementType(workerBeeIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new AchievementType(workerBeeIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new TitleType(workerBeeAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createPublisherCreator() {
	return new AchievementType(publisherCreatorIAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new AchievementType(publisherCreatorIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new AchievementType(publisherCreatorIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new TitleType(publisherCreatorAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createExplorer() {
	return new AchievementType(explorerIAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new AchievementType(explorerIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new AchievementType(explorerIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(() =>
			new TitleType(explorerTitleAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createSprinter() {
	return new AchievementType(sprinterAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new TitleType(sprinterTitleAttribs)
			.save(null, {method: 'insert'})
		);
}

export function sprinterHelper(numRevisions) {
	const promiseList = [];
	for (let i = 0; i < numRevisions; i++) {
		promiseList.push(
			new Revision({authorId: editorAttribs.id})
				.save(null, {method: 'insert'})
		);
	}
	return Promise.all(promiseList);
}

export function createFunRunner() {
	return new AchievementType(funRunnerAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new TitleType(funRunnerTitleAttribs)
			.save(null, {method: 'insert'})
		);
}

export function createMarathoner() {
	return new AchievementType(marathonerAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new TitleType(marathonerTitleAttribs)
			.save(null, {method: 'insert'})
		);
}

export function createTimeTraveller() {
	return new AchievementType(timeTravellerAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new TitleType(timeTravellerTitleAttribs)
			.save(null, {method: 'insert'})
		);
}

export function createHotOffThePress() {
	return new AchievementType(hotOffThePressAttribs)
		.save(null, {method: 'insert'})
		.then(() =>
			new TitleType(hotOffThePressTitleAttribs)
			.save(null, {method: 'insert'})
		);
}

export function typeRevisionHelper(revisionType, rowcount) {
	return function(type, editor) {
		let rowCountPromise;
		if (type === revisionType) {
			rowCountPromise = Promise.resolve(rowcount);
		}
		else {
			rowCountPromise = Promise.resolve(0);
		}
		return rowCountPromise;
	};
}

export function typeCreationHelper(revisionTypeString, rowCount) {
	return function(type, string, editor) {
		let rowCountPromise;
		if (string === revisionTypeString) {
			rowCountPromise = Promise.resolve(rowCount);
		}
		else {
			rowCountPromise = Promise.resolve(0);
		}
		return rowCountPromise;
	};
}

export function truncate() {
	return util.truncateTables(bookshelf, [
		'bookbrainz.editor',
		'bookbrainz.editor_type',
		'bookbrainz.achievement_type',
		'bookbrainz.achievement_unlock',
		'bookbrainz.title_type',
		'bookbrainz.title_unlock',
		'bookbrainz.revision',
		'musicbrainz.gender'
	]);
}
