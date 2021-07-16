/* eslint-disable prefer-arrow-callback,func-names */
/*
 * Copyright (C) 2021  Akash Gupta
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

import {
	createEditor, createSeries, createWork,
	getRandomUUID, truncateEntities
} from '../../../test-helpers/create-entities';

import app from '../../../../src/api/app';
import {browseSeriesBasicTests} from '../helpers';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';


const {Relationship, RelationshipSet, RelationshipType, Revision} = orm;


chai.use(chaiHttp);
const {expect} = chai;


const aBBID = getRandomUUID();
const bBBID = getRandomUUID();
const inValidBBID = 'akjd-adjjk-23123';


describe('GET /Series', () => {
	before(() => createSeries(aBBID));
	after(truncateEntities);
	// Test to get basic information of an Series
	it('should get basic information of an Series', async function () {
		const res = await chai.request(app).get(`/series/${aBBID}`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'seriesOrderingType',
			'seriesType',
			'bbid',
			'defaultAlias',
			'disambiguation'
		);
	 });

	 it('should return list of aliases of an Series', async function () {
		const res = await chai.request(app).get(`/series/${aBBID}/aliases`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'aliases'
		);
		expect(res.body.aliases).to.be.an('array');
		expect(res.body.aliases).to.have.lengthOf(1);
	 });

	 it('should return list of identifiers of an Series', async function () {
		const res = await chai.request(app).get(`/series/${aBBID}/identifiers`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'identifiers'
		);
		expect(res.body.identifiers).to.be.an('array');
		expect(res.body.identifiers).to.have.lengthOf(1);
	 });

	 it('should return list of relationships of an Series', async function () {
		const res = await chai.request(app).get(`/series/${aBBID}/relationships`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'relationships'
		);
		expect(res.body.relationships).to.be.an('array');
		expect(res.body.relationships).to.have.lengthOf(1);
	 });

	 it('should throw a 404 error if trying to access an series that does not exist', function (done) {
		chai.request(app)
			.get(`/series/${bBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Series not found');
				return done();
			});
	 });

	it('should throw a 400 error if trying to access an series with invalid BBID', function (done) {
		chai.request(app)
			.get(`/series/${inValidBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(400);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('BBID is not valid uuid');
				return done();
			});
	 });

	 it('should throw a 404 error if trying to access identifiers of an Series that does not exist', function (done) {
		chai.request(app)
			.get(`/series/${bBBID}/identifiers`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Series not found');
				return done();
			});
	 });


	it('should throw a 404 error if trying to access aliases of an Series that does not exist', function (done) {
		chai.request(app)
			.get(`/series/${bBBID}/aliases`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Series not found');
				return done();
			});
	 });

	it('should throw a 404 error if trying to access relationships of an Series that does not exist', function (done) {
		chai.request(app)
			.get(`/series/${bBBID}/relationships`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Series not found');
				return done();
			});
	 });
});

