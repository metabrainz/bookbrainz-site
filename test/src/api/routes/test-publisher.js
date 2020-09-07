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
	createAuthor,
	createEdition,
	createEditor,
	createPublisher,
	createWork,
	getRandomUUID,
	truncateEntities
} from '../../../test-helpers/create-entities';
import _ from 'lodash';
import app from '../../../../src/api/app';
import {browsePublisherBasicTests} from '../helpers';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';


const {PublisherSet, Relationship, RelationshipSet, RelationshipType, Revision} = orm;


chai.use(chaiHttp);
const {expect} = chai;


const aBBID = getRandomUUID();
const bBBID = getRandomUUID();
const inValidBBID = 'akjd-adjjk-23123';

describe('GET /Publisher', () => {
	before(() => createPublisher(aBBID));
	after(truncateEntities);
	// Test to get basic information of a Publisher
	it('should get basic information of a Publisher', async function () {
		const res = await chai.request(app).get(`/publisher/${aBBID}`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'defaultAlias',
			'disambiguation',
			'publisherType',
			'area',
			'beginDate',
			'endDate',
			'ended'
		);
	 });

	 it('should return list of aliases of a Publisher', async function () {
		const res = await chai.request(app).get(`/publisher/${aBBID}/aliases`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'aliases'
		);
		expect(res.body.aliases).to.be.an('array');
		expect(res.body.aliases).to.have.lengthOf(1);
	 });

	 it('should return list of identifiers of a Publisher', async function () {
		const res = await chai.request(app).get(`/publisher/${aBBID}/identifiers`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'identifiers'
		);
		expect(res.body.identifiers).to.be.an('array');
		expect(res.body.identifiers).to.have.lengthOf(1);
	 });
	 it('should return list of relationships of a Publisher', async function () {
		const res = await chai.request(app).get(`/publisher/${aBBID}/relationships`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'relationships'
		);
		expect(res.body.relationships).to.be.an('array');
		expect(res.body.relationships).to.have.lengthOf(1);
	 });
	 it('should throw a 404 error if trying to access a publisher that does not exist', function (done) {
		chai.request(app)
			.get(`/publisher/${bBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Publisher not found');
				return done();
			});
	 });

	it('should throw a 400 error if trying to access a publisher with invalid BBID', function (done) {
		chai.request(app)
			.get(`/publisher/${inValidBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(400);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('BBID is not valid uuid');
				return done();
			});
	 });

	 it('should throw a 404 error if trying to access identifiers of a Publisher that does not exist', function (done) {
		chai.request(app)
			.get(`/publisher/${bBBID}/identifiers`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Publisher not found');
				return done();
			});
	 });


	it('should throw a 404 error if trying to access aliases of a Publisher that does not exist', function (done) {
		chai.request(app)
			.get(`/publisher/${bBBID}/aliases`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Publisher not found');
				return done();
			});
	 });

	it('should throw a 404 error if trying to access relationships of a Publisher that does not exist', function (done) {
		chai.request(app)
			.get(`/publisher/${bBBID}/relationships`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Publisher not found');
				return done();
			});
	 });
});

/* eslint-disable no-await-in-loop */
describe('Browse Publishers', () => {
	let work;
	before(async () => {
		await truncateEntities();
		// create 4 publishers 2 each of type 1 and type 2
		const publisherBBIDs = [];
		for (let areaId = 1; areaId <= 2; areaId++) {
			const publisherAttrib = {};
			const publisherBBID = getRandomUUID();
			publisherAttrib.bbid = publisherBBID;
			publisherAttrib.areaId = areaId;
			publisherAttrib.typeId = 1;
			await createPublisher(publisherBBID, publisherAttrib);

			const publisherBBID2 = getRandomUUID();
			publisherAttrib.bbid = publisherBBID2;
			publisherAttrib.typeId = 2;
			await createPublisher(publisherBBID2, publisherAttrib);

			publisherBBIDs.push(publisherBBID, publisherBBID2);
		}

		work = await createWork();

		// Now create a revision which forms the relationship b/w work and publishers
		const editor = await createEditor();
		const revision = await new Revision({authorId: editor.get('id')})
			.save(null, {method: 'insert'});

		const relationshipTypeData = {
			description: 'test descryption',
			id: 1,
			label: 'test label',
			linkPhrase: 'test phrase',
			reverseLinkPhrase: 'test reverse link phrase',
			sourceEntityType: 'Author',
			targetEntityType: 'Edition'
		};
		await new RelationshipType(relationshipTypeData)
			.save(null, {method: 'insert'});
		const relationshipsPromise = [];
		for (const publisherBBID of publisherBBIDs) {
			const relationshipData = {
				sourceBbid: work.get('bbid'),
				targetBbid: publisherBBID,
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

		work.set('relationshipSetId', workRelationshipSet.get('id'));
		work.set('revisionId', revision.id);
		await work.save(null, {method: 'update'});
	});
	after(truncateEntities);

	it('should throw an error if trying to browse more than one entity', (done) => {
		chai.request(app)
			.get(`/publisher?author=${work.get('bbid')}&work=${work.get('bbid')}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(400);
				return done();
			});
	});

	it('should return list of Publisher, associated with the Work', async () => {
		const res = await chai.request(app).get(`/publisher?work=${work.get('bbid')}`);
		await browsePublisherBasicTests(res);
		expect(res.body.publishers.length).to.equal(4);
	});

	it('should return list of Publisher, associated with the Work (with Area Filter)', async () => {
		const res = await chai.request(app).get(`/publisher?work=${work.get('bbid')}&area=Area+1`);
		await browsePublisherBasicTests(res);
		expect(res.body.publishers.length).to.equal(2);
		res.body.publishers.forEach((publisher) => {
			expect(_.toLower(publisher.entity.area)).to.equal('area 1');
		});
	});

	it('should return list of Publisher, associated with the Work (with Type Filter)', async () => {
		const res = await chai.request(app).get(`/publisher?work=${work.get('bbid')}&type=Publisher+Type+1`);
		await browsePublisherBasicTests(res);
		expect(res.body.publishers.length).to.equal(2);
		res.body.publishers.forEach((publisher) => {
			expect(_.toLower(publisher.entity.publisherType)).to.equal('publisher type 1');
		});
	});

	it('should return list of Publisher, associated with the Work (with Type Filter and Area filter)', async () => {
		const res = await chai.request(app).get(`/publisher?work=${work.get('bbid')}&type=Publisher+Type+1&area=Area+1`);
		await browsePublisherBasicTests(res);
		expect(res.body.publishers.length).to.equal(1);
		expect(_.toLower(res.body.publishers[0].entity.publisherType)).to.equal('publisher type 1');
		expect(_.toLower(res.body.publishers[0].entity.area)).to.equal('area 1');
	});

	it('should return publishers associated with an edition', async () => {
		const edition = await createEdition();
		const publishers = [];
		// though UI allows one edition to have only one publisher; creating 2 for testing only
		for (let i = 1; i <= 2; i++) {
			publishers.push(
				await createPublisher()
			);
		}

		// Now create a revision which forms the relationship b/w publisher and editions
		const editor = await createEditor();
		const revision = await new Revision({authorId: editor.get('id')})
			.save(null, {method: 'insert'});
		const publisherSet = await new PublisherSet()
			.save(null, {method: 'insert'})
			.then((model) => model.publishers().attach(publishers).then(() => model));

		edition.set('publisherSetId', publisherSet.get('id'));
		edition.set('revisionId', revision.id);
		await edition.save(null, {method: 'update'});

		const res = await chai.request(app).get(`/publisher?edition=${edition.get('bbid')}`);
		await browsePublisherBasicTests(res);
		expect(res.body.publishers.length).to.equal(2);
	});

	it('should return no publisher (Incorrect Filters)', async () => {
		const res = await chai.request(app).get(`/publisher?work=${work.get('bbid')}&type=incorrectType`);
		await browsePublisherBasicTests(res);
		expect(res.body.publishers.length).to.equal(0);
	});

	it('should NOT throw error with no related edition', async () => {
		const edition = await createEdition();
		const res = await chai.request(app).get(`/publisher?edition=${edition.get('bbid')}`);
		await browsePublisherBasicTests(res);
		expect(res.body.publishers.length).to.equal(0);
	});

	it('should NOT throw error with no related entity', async () => {
		const author = await createAuthor();
		const res = await chai.request(app).get(`/publisher?author=${author.get('bbid')}`);
		await browsePublisherBasicTests(res);
		expect(res.body.publishers.length).to.equal(0);
	});

	it('should allow params to be case insensitive', async () => {
		const res = await chai.request(app).get(`/pubLIshEr?wORk=${work.get('bbid')}&TYPe=PuBLIsher+TYpE+1&area=Area+1`);
		await browsePublisherBasicTests(res);
		expect(res.body.publishers.length).to.equal(1);
		expect(_.toLower(res.body.publishers[0].entity.publisherType)).to.equal('publisher type 1');
		expect(_.toLower(res.body.publishers[0].entity.area)).to.equal('area 1');
	});

	it('should throw 400 error for invalid bbid', (done) => {
		chai.request(app)
			.get('/publisher?work=121212')
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(400);
				return done();
			});
	});

	it('should throw 404 error for incorrect bbid', (done) => {
		chai.request(app)
			.get(`/publisher?work=${aBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				return done();
			});
	});

	it('should throw 400 error for incorrect linked entity', (done) => {
		chai.request(app)
			.get(`/publisher?edition-group=${aBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(400);
				return done();
			});
	});
});
