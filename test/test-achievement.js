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

import * as testData from '../data/test-data.js';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import orm from './bookbrainz-data';
import rewire from 'rewire';
import testAuthorCreator from './test-author-creator.js';
import testExplorer from './test-explorer.js';
import testFunRunner from './test-fun-runner.js';
import testHotOffThePress from './test-hot-off-the-press.js';
import testLimitedEdition from './test-limited-edition.js';
import testMarathoner from './test-marathoner.js';
import testPublisher from './test-publisher.js';
import testPublisherCreator from './test-publisher-creator.js';
import testRevisionist from './test-revisionist.js';
import testSprinter from './test-sprinter.js';
import testTimeTraveller from './test-time-traveller.js';
import testWorkerBee from './test-worker-bee.js';


chai.use(chaiAsPromised);
const {expect} = chai;

const Achievement =	rewire('../src/server/helpers/achievement.js');
const awardAchievement = Achievement.__get__('awardAchievement');
const awardTitle = Achievement.__get__('awardTitle');

function tests() {
	describe('awardAchievement', () => {
		afterEach(testData.truncate);

		it('should award achievements', () => {
			const unlockPromise = testData.createEditor()
				.then(() => testData.createRevisionist())
				.then(
					() => awardAchievement(
						orm,
						testData.editorAttribs.id,
						testData.revisionistIAttribs.name
					)
				);

			return Promise.all([
				expect(unlockPromise).to.eventually.have.nested.property(
					'Revisionist I.editorId',
					testData.editorAttribs.id
				),
				expect(unlockPromise).to.eventually.have.nested.property(
					'Revisionist I.achievementId',
					testData.revisionistIAttribs.id
				)
			]);
		});

		// suppress warnings from rejections
		// Somehow modifies the global console object in Nove v10+ and causes a failure in Mocha

		// Achievement.__set__('console', {
		// 	error() {
		// 		// empty
		// 	},
		// 	warn() {
		// 		// empty
		// 	}
		// });

		it('should reject invalid editors', () => {
			const unlockPromise = testData.createRevisionist()
				.then(
					() => awardAchievement(
						orm,
						testData.editorAttribs.id,
						testData.revisionistIAttribs.name
					)
				);

			return expect(unlockPromise).to.eventually.be.rejected;
		});

		it('should reject invalid achievements', () => {
			const unlockPromise = testData.createEditor()
				.then(
					() => awardAchievement(
						orm,
						testData.editorAttribs.id,
						testData.revisionistIAttribs.name
					)
				);

			return expect(unlockPromise).to.eventually.be.rejected;
		});
	});
	describe('awardTitle', () => {
		afterEach(testData.truncate);

		it('should award titles', () => {
			const unlockPromise = testData.createEditor()
				.then(() => testData.createRevisionist())
				.then(
					() => awardTitle(
						orm,
						testData.editorAttribs.id,
						{titleName: testData.revisionistAttribs.title}
					)
				);

			return Promise.all([
				expect(unlockPromise).to.eventually.have.nested.property(
					'Revisionist.editorId',
					testData.editorAttribs.id
				),
				expect(unlockPromise).to.eventually.have.nested.property(
					'Revisionist.titleId',
					testData.revisionistAttribs.id
				)
			]);
		});

		it('should reject invalid editors', () => {
			const unlockPromise = testData.createRevisionist()
				.then(
					() => awardTitle(
						orm,
						testData.editorAttribs.id,
						{titleName: testData.revisionistAttribs.title}
					)
				);

			return expect(unlockPromise).to.eventually.be.rejected;
		});

		it('should reject invalid titles', () => {
			const unlockPromise = testData.createEditor()
				.then(
					() => awardTitle(
						orm,
						testData.editorAttribs.id,
						{titleName: testData.revisionistAttribs.title}
					)
				);

			return expect(unlockPromise).to.eventually.be.rejected;
		});
	});
	describe('Author Creator Achievement', testAuthorCreator);
	describe('Explorer Achievement', testExplorer);
	describe('Fun Runner Achievement', testFunRunner);
	describe('Hot Off the Press Achievement', testHotOffThePress);
	describe('Limited Edition Achievement', testLimitedEdition);
	describe('Marathoner Achievement', testMarathoner);
	describe('Publisher Achievement', testPublisher);
	describe('Publisher Creator Achievement', testPublisherCreator);
	describe('Revisionist Achievement', testRevisionist);
	describe('Sprinter Achievement', testSprinter);
	describe('Time Traveller Achievement', testTimeTraveller);
	describe('Worker Bee Achievement', testWorkerBee);
}

describe('achievement module', tests);
