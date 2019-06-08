/* eslint-disable prefer-arrow-callback,func-names */
/*
 * Copyright (C) 2019  Akhilesh Kumar
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

import {createEdition, getRandomUUID, truncateEntities} from '../../../test-helpers/create-entities';

import app from '../../../../src/api/app';
import chai from 'chai';
import chaiHttp from 'chai-http';


chai.use(chaiHttp);
const {expect} = chai;


const aBBID = getRandomUUID();
const bBBID = getRandomUUID();
const inValidBBID = 'akjd-adjjk-23123';

describe('GET /Edition', () => {
	before(() => createEdition(aBBID));
	after(truncateEntities);
	// Test to get basic information of a work
	it('should get basic information of edition', async function () {
		const res = await chai.request(app).get(`/edition/${aBBID}`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'defaultAlias',
			'languages',
			'disambiguation',
			'editionFormat',
			'hight',
			'width',
			'depth',
			'pages',
			'status',
			'releaseEventDates',
			'weight'
		);
	 });

	 it('should return list of aliases of Edition', async function () {
		const res = await chai.request(app).get(`/edition/${aBBID}/aliases`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body.aliases).to.be.an('array');
		expect(res.body).to.have.all.keys(
			'bbid',
			'aliases'
		);
	 });

	 it('should return list of identifiers of edition', async function () {
		const res = await chai.request(app).get(`/edition/${aBBID}/identifiers`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body.identifiers).to.be.an('array');
		expect(res.body).to.have.all.keys(
			'bbid',
			'identifiers'
		);
	 });
});

