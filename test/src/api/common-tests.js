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

import {createAuthor, getRandomUUID, truncateEntities} from '../../test-helpers/create-entities';
import app from '../../../src/api/app';
import chai from 'chai';
import chaiHttp from 'chai-http';


chai.use(chaiHttp);
const {expect} = chai;

const aBBID = getRandomUUID();
const bBBID = getRandomUUID();

describe('Common test of API', () => {
	// Test API for envalid requests
	it('should throw a 405 error if send post request', (done) => {
		chai.request(app)
			.post(`/work/${bBBID}`)
			.end((err, res) => {
				if (err) { return done(err); }

				expect(res).to.have.status(405);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body).to.have.all.keys('message');
				return done();
			});
	 });

	 it('should throw a 405 error if send put request', (done) => {
		chai.request(app)
			.put(`/work/${bBBID}`)
			.end((err, res) => {
				if (err) { return done(err); }

				expect(res).to.have.status(405);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body).to.have.all.keys('message');
				return done();
			});
	 });

	 it('should throw a 405 error if send delete request', (done) => {
		chai.request(app)
			.delete(`/work/${bBBID}`)
			.end((err, res) => {
				if (err) { return done(err); }
				expect(res).to.have.status(405);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body).to.have.all.keys('message');
				return done();
			});
	 });

	 it('should throw a 404 error if endpoint is not valid', (done) => {
		chai.request(app)
			.get(`/work/${bBBID}/not-valid`)
			.end((err, res) => {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body).to.have.all.keys('message');
				return done();
			});
	 });
});

describe('Lookup endpoints', () => {
	before(() => createAuthor(aBBID));
	after(truncateEntities);
	it('GET {entity}/{BBID}/aliases should return aliases with a specific structure', async () => {
		const res = await chai.request(app).get(`/author/${aBBID}/aliases`);
		expect(res.body.aliases).to.be.an('array');
		expect(res.body.aliases[0]).to.be.an('object');
		expect(res.body.aliases[0]).to.have.all.keys(
			'language',
			'name',
			'sortName',
			'primary'
		);
		expect(res.body.aliases[0].language).to.be.a('string');
		expect(res.body.aliases[0].name).to.be.a('string');
		expect(res.body.aliases[0].sortName).to.be.a('string');
		expect(res.body.aliases[0].primary).to.be.a('boolean');
	 });

	 it('GET {entity}/{BBID}/identifiers should return identifiers with a specific structure', async () => {
		const res = await chai.request(app).get(`/author/${aBBID}/identifiers`);
		expect(res.body.identifiers).to.be.an('array');
		expect(res.body.identifiers[0]).to.be.an('object');
		expect(res.body.identifiers[0]).to.have.all.keys(
			'type',
			'value'
		);
		expect(res.body.identifiers[0].type).to.be.a('string');
		expect(res.body.identifiers[0].value).to.be.a('string');
	 });

	 it('GET {entity}/{BBID}/relationships should return relationships with a specific structure', async () => {
		const res = await chai.request(app).get(`/author/${aBBID}/relationships`);
		expect(res.body.relationships).to.be.an('array');
		expect(res.body.relationships[0]).to.have.all.keys(
			'direction',
			'id',
			'linkPhrase',
			'relationshipTypeId',
			'relationshipTypeName',
			'targetBbid',
			'targetEntityType'
		);
		expect(res.body.relationships[0].direction).to.be.a('string');
		expect(res.body.relationships[0].id).to.be.a('number');
		expect(res.body.relationships[0].linkPhrase).to.be.a('string');
		expect(res.body.relationships[0].relationshipTypeId).to.be.a('number');
		expect(res.body.relationships[0].targetBbid).to.be.a('string');
		expect(res.body.relationships[0].targetEntityType).to.be.a('string');
	 });
});
