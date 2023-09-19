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
	cachedMetabrainzName: 'Bob',
	id: 1,
	metabrainzUserId: 1,
	name: 'bob',
	revisionsApplied: 0,
	typeId: 1
};

export const revisionistIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create one revision',
	id: 1,
	name: 'Revisionist I'
};

export const revisionistIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 25 revisions',
	id: 2,
	name: 'Revisionist II'
};

export const revisionistIIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 250 revisions',
	id: 3,
	name: 'Revisionist III'
};

export const revisionistAttribs = {
	description: 'create 250 revisions',
	id: 1,
	title: 'Revisionist'
};

export const authorCreatorIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create one author',
	id: 1,
	name: 'Author Creator I'
};

export const authorCreatorIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 10 authors',
	id: 2,
	name: 'Author Creator II'
};

export const authorCreatorIIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 100 authors',
	id: 3,
	name: 'Author Creator III'
};

export const authorCreatorAttribs = {
	description: 'Complete Author Creator track',
	id: 1,
	title: 'Author Creator'
};

export const limitedEditionIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create one edition',
	id: 1,
	name: 'Limited Edition I'
};

export const limitedEditionIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 10 editions',
	id: 2,
	name: 'Limited Edition II'
};

export const limitedEditionIIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 100 edtions',
	id: 3,
	name: 'Limited Edition III'
};

export const limitedEditionAttribs = {
	description: 'Complete limited edition track',
	id: 1,
	title: 'Limited Edition'
};


export const publisherIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create one publisher',
	id: 1,
	name: 'Publisher I'
};

export const publisherIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 10 publishers',
	id: 2,
	name: 'Publisher II'
};

export const publisherIIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 100 publishers',
	id: 3,
	name: 'Publisher III'
};

export const publisherAttribs = {
	description: 'Complete publisher track',
	id: 1,
	title: 'Publisher'
};

export const sprinterAttribs = {
	badgeUrl: 'http://test.com',
	description: 'Create 10 revisions in an hour',
	id: 1,
	name: 'Sprinter'
};


export const seriesCreatorIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 1 series',
	id: 1,
	name: 'Series Creator I'
};

export const seriesCreatorIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 10 series',
	id: 2,
	name: 'Series Creator II'
};

export const seriesCreatorIIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 100 series',
	id: 3,
	name: 'Series Creator III'
};

export const seriesCreatorAttribs = {
	description: 'finish series creator track',
	id: 1,
	title: 'Series Creator'
};


export const workerBeeIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 1 work',
	id: 1,
	name: 'Worker Bee I'
};

export const workerBeeIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 10 works',
	id: 2,
	name: 'Worker Bee II'
};

export const workerBeeIIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 100 works',
	id: 3,
	name: 'Worker Bee III'
};

export const workerBeeAttribs = {
	description: 'finish worker bee track',
	id: 1,
	title: 'Worker Bee'
};

export const explorerIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'view 10 entities',
	id: 1,
	name: 'Explorer I'
};

export const explorerIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'view 100 entities',
	id: 2,
	name: 'Explorer II'
};

export const explorerIIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'view 1000 entities',
	id: 3,
	name: 'Explorer III'
};

export const explorerTitleAttribs = {
	description: 'finish explorer track',
	id: 1,
	title: 'Explorer'
};

export const publisherCreatorIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 1 publisher',
	id: 1,
	name: 'Publisher Creator I'
};

export const publisherCreatorIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 10 publishers',
	id: 2,
	name: 'Publisher Creator II'
};

export const publisherCreatorIIIAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create 100 publishers',
	id: 3,
	name: 'Publisher Creator III'
};

export const publisherCreatorAttribs = {
	description: 'finish publisher creator track',
	id: 1,
	title: 'Publisher Creator'
};

export const sprinterTitleAttribs = {
	description: 'Complete Sprinter track',
	id: 1,
	title: 'Sprinter'
};

export const funRunnerAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create a revision a day for a week',
	id: 1,
	name: 'Fun Runner'
};

export const funRunnerTitleAttribs = {
	description: 'Complete Fun Runner track',
	id: 1,
	title: 'Fun Runner'
};

export const marathonerAttribs = {
	badgeUrl: 'http://test.com',
	description: 'create a revision a day for 30 days',
	id: 1,
	name: 'Marathoner'
};

export const marathonerTitleAttribs = {
	description: 'Complete Marathoner track',
	id: 1,
	title: 'Marathoner'
};

export const timeTravellerAttribs = {
	badgeUrl: 'http://test.com',
	description: 'test description',
	id: 1,
	name: 'Time Traveller'
};

export const timeTravellerTitleAttribs = {
	description: 'test description',
	id: 1,
	title: 'Time Traveller'
};

export const hotOffThePressAttribs = {
	badgeUrl: 'http://test.com',
	description: 'test description',
	id: 1,
	name: 'Hot Off the Press'
};

export const hotOffThePressTitleAttribs = {
	description: 'test description',
	id: 1,
	title: 'Hot Off the Press'
};

export function createEditor() {
	return new EditorType(editorTypeAttribs)
		.save(null, {method: 'insert'})
		.then(
			() => new Editor(editorAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createRevisionist() {
	return new AchievementType(revisionistIAttribs)
		.save(null, {method: 'insert'})
		.then(
			() => new AchievementType(revisionistIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new AchievementType(revisionistIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new TitleType(revisionistAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createAuthorCreator() {
	return new AchievementType(authorCreatorIAttribs)
		.save(null, {method: 'insert'})
		.then(
			() => new AchievementType(authorCreatorIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new AchievementType(authorCreatorIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new TitleType(authorCreatorAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createLimitedEdition() {
	return new AchievementType(limitedEditionIAttribs)
		.save(null, {method: 'insert'})
		.then(
			() => new AchievementType(limitedEditionIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new AchievementType(limitedEditionIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new TitleType(limitedEditionAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createPublisher() {
	return new AchievementType(publisherIAttribs)
		.save(null, {method: 'insert'})
		.then(
			() => new AchievementType(publisherIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new AchievementType(publisherIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new TitleType(publisherAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createWorkerBee() {
	return new AchievementType(workerBeeIAttribs)
		.save(null, {method: 'insert'})
		.then(
			() => new AchievementType(workerBeeIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new AchievementType(workerBeeIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new TitleType(workerBeeAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createSeriesCreator() {
	return new AchievementType(seriesCreatorIAttribs)
		.save(null, {method: 'insert'})
		.then(
			() => new AchievementType(seriesCreatorIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new AchievementType(seriesCreatorIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new TitleType(seriesCreatorAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createPublisherCreator() {
	return new AchievementType(publisherCreatorIAttribs)
		.save(null, {method: 'insert'})
		.then(
			() => new AchievementType(publisherCreatorIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new AchievementType(publisherCreatorIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new TitleType(publisherCreatorAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createExplorer() {
	return new AchievementType(explorerIAttribs)
		.save(null, {method: 'insert'})
		.then(
			() => new AchievementType(explorerIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new AchievementType(explorerIIIAttribs)
				.save(null, {method: 'insert'})
		)
		.then(
			() => new TitleType(explorerTitleAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createSprinter() {
	return new AchievementType(sprinterAttribs)
		.save(null, {method: 'insert'})
		.then(
			() => new TitleType(sprinterTitleAttribs)
				.save(null, {method: 'insert'})
		);
}

export async function sprinterHelper(numRevisions) {
	const promiseList = [];
	for (let i = 0; i < numRevisions; i++) {
		promiseList.push(
			new Revision({authorId: editorAttribs.id})
				.save(null, {method: 'insert'})
		);
	}
	const result = await Promise.all(promiseList);
	return result;
}

export function createFunRunner() {
	return new AchievementType(funRunnerAttribs)
		.save(null, {method: 'insert'})
		.then(
			() => new TitleType(funRunnerTitleAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createMarathoner() {
	return new AchievementType(marathonerAttribs)
		.save(null, {method: 'insert'})
		.then(
			() => new TitleType(marathonerTitleAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createTimeTraveller() {
	return new AchievementType(timeTravellerAttribs)
		.save(null, {method: 'insert'})
		.then(
			() => new TitleType(timeTravellerTitleAttribs)
				.save(null, {method: 'insert'})
		);
}

export function createHotOffThePress() {
	return new AchievementType(hotOffThePressAttribs)
		.save(null, {method: 'insert'})
		.then(
			() => new TitleType(hotOffThePressTitleAttribs)
				.save(null, {method: 'insert'})
		);
}

export function typeRevisionHelper(revisionType, rowcount) {
	return (type) => {
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
	return (type, string) => {
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
