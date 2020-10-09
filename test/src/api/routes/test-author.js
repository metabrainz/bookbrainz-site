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

import {
	createAuthor, createEditor, createWork,
	getRandomUUID, truncateEntities
} from '../../../test-helpers/create-entities';

import app from '../../../../src/api/app';
import {browseAuthorBasicTests} from '../helpers';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';


const {Relationship, RelationshipSet, RelationshipType, Revision} = orm;


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
			'authorType',
			'bbid',
			'defaultAlias',
			'disambiguation',
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

	it('should throw a 400 error if trying to access an author with invalid BBID', function (done) {
		chai.request(app)
			.get(`/author/${inValidBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(400);
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

/* eslint-disable no-await-in-loop */
describe('Browse Author', () => {
	let work;
	before(async () => {
		// create a work which is related to 3 authors
		const authorBBIDs = [];
		for (let typeId = 1; typeId <= 3; typeId++) {
			const authorBBID = getRandomUUID();
			const authorAttribs = {
				bbid: authorBBID,
				// Make type id alternate between "person" (1) and "group" (2)
				typeId: (typeId % 2) + 1
			};
			await createAuthor(authorBBID, authorAttribs);
			authorBBIDs.push(authorBBID);
		}
		work = await createWork();

		// Now create a revision which forms the relationship b/w work and authors
		const editor = await createEditor();
		const revision = await new Revision({authorId: editor.id})
			.save(null, {method: 'insert'});

		const relationshipTypeData = {
			description: 'test descryption',
			id: 1,
			label: 'test label',
			linkPhrase: 'test phrase',
			reverseLinkPhrase: 'test reverse link phrase',
			sourceEntityType: 'Author',
			targetEntityType: 'Work'
		};
		await new RelationshipType(relationshipTypeData)
			.save(null, {method: 'insert'});

		const relationshipsPromise = [];
		for (const authorBBID of authorBBIDs) {
			const relationshipData = {
				sourceBbid: authorBBID,
				targetBbid: work.get('bbid'),
				typeId: relationshipTypeData.id
			};
			relationshipsPromise.push(
				new Relationship(relationshipData)
					.save(null, {method: 'insert'})
			);
		}
		const relationships = await Promise.all(relationshipsPromise);

		const workRelationshipSet = await new RelationshipSet()
			.save(null, {method: 'insert'})
			.then((model) => model.relationships().attach(relationships).then(() => model));

		work.set('relationshipSetId', workRelationshipSet.id);
		work.set('revisionId', revision.id);
		await work.save(null, {method: 'update'});
	});
	after(truncateEntities);


	it('should throw an error if trying to browse more than one entity', (done) => {
		chai.request(app)
			.get(`/author?work=${work.get('bbid')}&edition=${work.get('bbid')}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(400);
				return done();
			});
	});

	it('should return list of authors associated with the work (without any filter)', async () => {
		const res = await chai.request(app).get(`/author?work=${work.get('bbid')}`);
		await browseAuthorBasicTests(res);
		expect(res.body.authors.length).to.equal(3);
	});

	it('should return list of authors associated with the work (with Type filter)', async () => {
		const res = await chai.request(app).get(`/author?work=${work.get('bbid')}&type=Person`);
		await browseAuthorBasicTests(res);
		expect(res.body.authors.length).to.equal(1);
		expect(res.body.authors[0].entity.authorType).to.equal('Person');
	});

	it('should return 0 authors (with Incorrect Type filter)', async () => {
		const res = await chai.request(app).get(`/author?work=${work.get('bbid')}&type=wrongFilter`);
		await browseAuthorBasicTests(res);
		expect(res.body.authors.length).to.equal(0);
	});

	it('should allow params to be case insensitive', async () => {
		const res = await chai.request(app).get(`/aUThor?wOrk=${work.get('bbid')}&tYPe=pERsOn`);
		await browseAuthorBasicTests(res);
		expect(res.body.authors.length).to.equal(1);
		expect(res.body.authors[0].entity.authorType).to.equal('Person');
	});

	it('should NOT throw an error if there is no related entity', async () => {
		const work2 = await createWork();
		const res = await chai.request(app).get(`/author?work=${work2.get('bbid')}`);
		await browseAuthorBasicTests(res);
		expect(res.body.authors.length).to.equal(0);
	});

	it('should throw 400 error for invalid bbid', (done) => {
		chai.request(app)
			.get('/author?work=1212121')
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(400);
				return done();
			});
	});

	it('should throw 404 error for incorrect bbid', (done) => {
		chai.request(app)
			.get(`/author?work=${aBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				return done();
			});
	});
});
