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

import {createAuthor, createRelationship, getRandomUUID, truncateEntities} from '../../../test-helpers/create-entities';

import app from '../../../../src/api/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import {testAuthorBrowseRequest} from '../helpers';


chai.use(chaiHttp);
const {expect} = chai;


const aBBID = getRandomUUID();
const bBBID = getRandomUUID();
const inValidBBID = 'akjd-adjjk-23123';


describe('GET /Author', () => {
	before(() => createAuthor(aBBID));
	after(truncateEntities);
	// Test to get basic information of an Author
	it('should get basic information of an Author', async function () {
		const res = await chai.request(app).get(`/author/${aBBID}`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'defaultAlias',
			'disambiguation',
			'type',
			'gender',
			'beginArea',
			'beginDate',
			'endArea',
			'endDate',
			'ended'
		);
	 });

	 it('should return list of aliases of an Author', async function () {
		const res = await chai.request(app).get(`/author/${aBBID}/aliases`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'aliases'
		);
		expect(res.body.aliases).to.be.an('array');
		expect(res.body.aliases).to.have.lengthOf(1);
	 });

	 it('should return list of identifiers of an Author', async function () {
		const res = await chai.request(app).get(`/author/${aBBID}/identifiers`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'identifiers'
		);
		expect(res.body.identifiers).to.be.an('array');
		expect(res.body.identifiers).to.have.lengthOf(1);
	 });

	 it('should return list of relationships of an Author', async function () {
		const res = await chai.request(app).get(`/author/${aBBID}/relationships`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'relationships'
		);
		expect(res.body.relationships).to.be.an('array');
		expect(res.body.relationships).to.have.lengthOf(1);
	 });

	 it('should throw a 404 error if trying to access an author that does not exist', function (done) {
		chai.request(app)
			.get(`/author/${bBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Author not found');
				return done();
			});
	 });

	it('should throw a 406 error if trying to access an author with invalid BBID', function (done) {
		chai.request(app)
			.get(`/author/${inValidBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(406);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('BBID is not valid uuid');
				return done();
			});
	 });

	 it('should throw a 404 error if trying to access identifiers of an Author that does not exist', function (done) {
		chai.request(app)
			.get(`/author/${bBBID}/identifiers`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Author not found');
				return done();
			});
	 });


	it('should throw a 404 error if trying to access aliases of an Author that does not exist', function (done) {
		chai.request(app)
			.get(`/author/${bBBID}/aliases`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Author not found');
				return done();
			});
	 });

	it('should throw a 404 error if trying to access relationships of an Author that does not exist', function (done) {
		chai.request(app)
			.get(`/author/${bBBID}/relationships`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Author not found');
				return done();
			});
	 });
});


describe('Browse Author', () => {
	// Test browse requests of Author
	before(async () => {
		await createAuthor(aBBID);
		await createRelationship(aBBID, null, 'Author', 'Work');
		await createRelationship(aBBID, null, 'Author', 'Edition');
		await createRelationship(aBBID, null, 'Author', 'EditionGroup');
		await createRelationship(aBBID, null, 'Author', 'Publisher');
	});
	after(truncateEntities);

	it('should return list of Authors of the Work',
		() => testAuthorBrowseRequest(`/author?work=${aBBID}`));

	it('should return list of Authors, whose works are in the Edition',
		() => testAuthorBrowseRequest(`/author?edition=${aBBID}`));

	it('should return list of Authors, whose works are in the EditionGroup',
		() => testAuthorBrowseRequest(`/author?edition-group=${aBBID}`));

	it('should return list of Authors, who are associated with a Publisher',
		() => testAuthorBrowseRequest(`/author?publisher=${aBBID}`));
});
