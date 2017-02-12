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

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const rewire = require('rewire');
const testData = require('../data/test-data.js');
const Promise = require('bluebird');
const {TEST_LIB} = process.env;
const Achievement =
	rewire(`../${TEST_LIB ? 'lib' : 'src'}/server/helpers/achievement.js`);

const awardAchievement = Achievement.__get__('awardAchievement');
const awardTitle = Achievement.__get__('awardTitle');
const testCreatorCreator = require('./test-creator-creator.js');
const testExplorer = require('./test-explorer.js');
const testFunRunner = require('./test-fun-runner.js');
const testLimitedEdition = require('./test-limited-edition.js');
const testMarathoner = require('./test-marathoner.js');
const testPublisher = require('./test-publisher.js');
const testPublisherCreator = require('./test-publisher-creator.js');
const testRevisionist = require('./test-revisionist.js');
const testSprinter = require('./test-sprinter.js');
const testWorkerBee = require('./test-worker-bee.js');
const testTimeTraveller = require('./test-time-traveller.js');
const testHotOffThePress = require('./test-hot-off-the-press.js');

function tests() {
	describe('awardAchievement', () => {
		afterEach(testData.truncate);

		it('should award achievements', () => {
			const unlockPromise = testData.createEditor()
				.then(() =>
					testData.createRevisionist()
				)
				.then(() =>
					awardAchievement(
						testData.editorAttribs.id,
						testData.revisionistIAttribs.name
					)
				);

			return Promise.all([
				expect(unlockPromise).to.eventually.have.deep.property(
					'Revisionist I.editorId',
					testData.editorAttribs.id
				),
				expect(unlockPromise).to.eventually.have.deep.property(
					'Revisionist I.achievementId',
					testData.revisionistIAttribs.id
				)
			]);
		});

		// suppress warnings from rejections
		Achievement.__set__('console', {
			error() {
				// empty
			},
			warn() {
				// empty
			}
		});

		it('should reject invalid editors', () => {
			const unlockPromise = testData.createRevisionist()
				.then(() =>
					awardAchievement(
						testData.editorAttribs.id,
						testData.revisionistIAttribs.name
					)
				);

			return expect(unlockPromise).to.eventually.be.rejected;
		});

		it('should reject invalid achievements', () => {
			const unlockPromise = testData.createEditor()
				.then(() =>
					awardAchievement(
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
				.then(() =>
					testData.createRevisionist()
				)
				.then(() =>
					awardTitle(
						testData.editorAttribs.id,
						{titleName: testData.revisionistAttribs.title}
					)
				);

			return Promise.all([
				expect(unlockPromise).to.eventually.have.deep.property(
					'Revisionist.editorId',
					testData.editorAttribs.id
				),
				expect(unlockPromise).to.eventually.have.deep.property(
					'Revisionist.titleId',
					testData.revisionistAttribs.id
				)
			]);
		});

		it('should reject invalid editors', () => {
			const unlockPromise = testData.createRevisionist()
				.then(() =>
					awardTitle(
						testData.editorAttribs.id,
						{titleName: testData.revisionistAttribs.title}
					)
				);

			return expect(unlockPromise).to.eventually.be.rejected;
		});

		it('should reject invalid titles', () => {
			const unlockPromise = testData.createEditor()
				.then(() =>
					awardTitle(
						testData.editorAttribs.id,
						{titleName: testData.revisionistAttribs.title}
					)
				);

			return expect(unlockPromise).to.eventually.be.rejected;
		});
	});
	describe('Creator Creator Achievement', testCreatorCreator);
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
