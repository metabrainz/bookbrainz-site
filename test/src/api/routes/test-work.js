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

import {createWork, getRandomUUID, truncateEntities} from '../../../test-helpers/create-entities';

import app from '../../../../src/api/app';
import chai from 'chai';
import chaiHttp from 'chai-http';


chai.use(chaiHttp);
const {expect} = chai;


const aBBID = getRandomUUID();
const bBBID = getRandomUUID();
const inValidBBID = 'akjd-adjjk-23123';

describe('GET /work', () => {
	before(() => createWork(aBBID));
	after(truncateEntities);
	// Test to get basic information of a Work
	it('should get basic information of work', async function () {
		const res = await chai.request(app).get(`/work/${aBBID}`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'defaultAlias',
			'languages',
			'disambiguation',
			'workType',
			'entityType'
		);
	 });

	 it('should return list of aliases of a Work', async function () {
		const res = await chai.request(app).get(`/work/${aBBID}/aliases`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'aliases'
		);
		expect(res.body.aliases).to.be.an('array');
		expect(res.body.aliases).to.have.lengthOf(1);
	 });

	 it('should return list of identifiers of work', async function () {
		const res = await chai.request(app).get(`/work/${aBBID}/identifiers`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'identifiers'
		);
		expect(res.body.identifiers).to.be.an('array');
		expect(res.body.identifiers).to.have.lengthOf(1);
	 });

	 it('should return list of relationships of a Work', async function () {
		const res = await chai.request(app).get(`/work/${aBBID}/relationships`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'relationships'
		);
		expect(res.body.relationships).to.be.an('array');
		expect(res.body.relationships).to.have.lengthOf(1);
	 });

	 it('should throw a 404 error if trying to access a work that does not exist', function (done) {
		chai.request(app)
			.get(`/work/${bBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Work not found');
				return done();
			});
	 });

	it('should throw a 406 error if trying to access a work with invalid BBID', function (done) {
		chai.request(app)
			.get(`/work/${inValidBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(406);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('BBID is not valid uuid');
				return done();
			});
	 });

	 it('should throw a 404 error if trying to identifiers aliases of a Work that does not exist', function (done) {
		chai.request(app)
			.get(`/work/${bBBID}/identifiers`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Work not found');
				return done();
			});
	 });


	it('should throw a 404 error if trying to access aliases of a Work that does not exist', function (done) {
		chai.request(app)
			.get(`/work/${bBBID}/aliases`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Work not found');
				return done();
			});
	 });

	 it('should throw a 404 error if trying to access relationships of a Work that does not exist', function (done) {
		chai.request(app)
			.get(`/work/${bBBID}/relationships`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Work not found');
				return done();
			});
	 });
});

