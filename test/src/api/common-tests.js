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

import app from '../../../src/api/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import {getRandomUUID} from '../../test-helpers/create-entities';


chai.use(chaiHttp);
const {expect} = chai;


const aBBID = getRandomUUID();
const bBBID = getRandomUUID();
const inValidBBID = 'akjd-adjjk-23123';

describe('Common test of API', () => {
	// Test API for envalid requests
	it('should throw a 405 error if send post request', function (done) {
		chai.request(app)
			.post(`/work/${bBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(405);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body).to.have.all.keys('message');
				return done();
			});
	 });
	 it('should throw a 405 error if send put request', function (done) {
		chai.request(app)
			.put(`/work/${bBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(405);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body).to.have.all.keys('message');
				return done();
			});
	 });
	 it('should throw a 405 error if send delete request', function (done) {
		chai.request(app)
			.delete(`/work/${bBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(405);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body).to.have.all.keys('message');
				return done();
			});
	 });

	 it('should throw a 404 error if endpoint is not valid', function (done) {
		chai.request(app)
			.get(`/work/${bBBID}/not-valid`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body).to.have.all.keys('message');
				return done();
			});
	 });
});

