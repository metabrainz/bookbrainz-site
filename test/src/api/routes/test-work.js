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
chai.should();


const aBBID = getRandomUUID();
const bBBID = getRandomUUID();

describe('GET /work', () => {
	beforeEach(() => createWork(aBBID));
	afterEach(truncateEntities);
	// Test to get basic information of a work
	it('should get basic information of work', (done) => {
		 chai.request(app)
			 .get(`/work/${aBBID}`)
			 .end((err, res) => {
				 if (err) {
					 throw err;
				 }
				 res.should.have.status(200);
				 res.body.should.be.a('object');
				 res.body.should.all.keys(
					'bbid',
					'defaultAlias',
					'languages',
					'disambiguation',
					'workType',
					'entityType'
				);
				 done();
			  });
	 });

	 it('should return status 404, if work is not founded', (done) => {
		 chai.request(app)
			 .get(`/work/${bBBID}`)
			 .end((err, res) => {
				 if (err) {
					 throw err;
				 }
				 res.should.have.status(404);
				 res.body.should.be.a('object');
				 res.body.message.should.equal(
					'This Work is not founded'
				);
				 done();
			  });
	 });

	 it('should return list of aliases of work', (done) => {
		 chai.request(app)
			 .get(`/work/${aBBID}/aliases`)
			 .end((err, res) => {
				 if (err) {
					 throw err;
				 }
				 res.should.have.status(200);
				 res.body.should.be.a('object');
				 res.body.should.all.keys(
					'bbid',
					'aliases'
				);
				 done();
			  });
	 });

	 it('should return list of identifiers of work', (done) => {
		 chai.request(app)
			 .get(`/work/${aBBID}/identifiers`)
			 .end((err, res) => {
				 if (err) {
					 throw err;
				 }
				 res.should.have.status(200);
				 res.body.should.be.a('object');
				 res.body.should.all.keys(
					'bbid',
					'identifiers'
				);
				 done();
			  });
	 });
});
