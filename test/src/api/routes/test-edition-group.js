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
	createEdition,
	createEditionGroup,
	createEditor,
	getRandomUUID,
	truncateEntities
} from '../../../test-helpers/create-entities';

import _ from 'lodash';
import app from '../../../../src/api/app';
import {browseEditionGroupBasicTests} from '../helpers';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';


const {Revision} = orm;

chai.use(chaiHttp);
const {expect} = chai;


const aBBID = getRandomUUID();
const bBBID = getRandomUUID();
const inValidBBID = 'akjd-adjjk-23123';

describe('GET /EditionGroup', () => {
	before(() => createEditionGroup(aBBID));
	after(truncateEntities);
	// Test to get basic information of an Edition Group
	it('should get basic information of an Edition Group', async () => {
		const res = await chai.request(app).get(`/edition-group/${aBBID}`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'defaultAlias',
			'disambiguation',
			'editionGroupType'
		);
	 });

	 it('should return list of aliases of an Edition Group', async () => {
		const res = await chai.request(app).get(`/edition-group/${aBBID}/aliases`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'aliases'
		);
		expect(res.body.aliases).to.be.an('array');
		expect(res.body.aliases).to.have.lengthOf(1);
	 });

	 it('should return list of identifiers of an Edition Group', async () => {
		const res = await chai.request(app).get(`/edition-group/${aBBID}/identifiers`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'identifiers'
		);
		expect(res.body.identifiers).to.be.an('array');
		expect(res.body.identifiers).to.have.lengthOf(1);
	 });

	it('should return list of relationships of an Edition Group', async () => {
		const res = await chai.request(app).get(`/edition-group/${aBBID}/relationships`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'relationships'
		);
		expect(res.body.relationships).to.be.an('array');
		expect(res.body.relationships).to.have.lengthOf(1);
	 });

	 it('should throw a 404 error if trying to access an edition group that does not exist', (done) => {
		chai.request(app)
			.get(`/edition-group/${bBBID}`)
			.end((err, res) => {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Edition Group not found');
				return done();
			});
	 });

	it('should throw a 400 error if trying to access an edition with invalid BBID', (done) => {
		chai.request(app)
			.get(`/edition-group/${inValidBBID}`)
			.end((err, res) => {
				if (err) { return done(err); }
				expect(res).to.have.status(400);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('BBID is not valid uuid');
				return done();
			});
	 });

	 it('should throw a 404 error if trying to access identifiers of an Edition Group that does not exist', (done) => {
		chai.request(app)
			.get(`/edition-group/${bBBID}/identifiers`)
			.end((err, res) => {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Edition Group not found');
				return done();
			});
	 });


	it('should throw a 404 error if trying to access aliases of an Edition Group that does not exist', (done) => {
		chai.request(app)
			.get(`/edition-group/${bBBID}/aliases`)
			.end((err, res) => {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Edition Group not found');
				return done();
			});
	 });

	it('should throw a 404 error if trying to access relationships of an Edition Group that does not exist', (done) => {
		chai.request(app)
			.get(`/edition-group/${bBBID}/relationships`)
			.end((err, res) => {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Edition Group not found');
				return done();
			});
	 });
});

describe('Browse EditionGroup', () => {
	// Test browse requests for Edition Group
	let edition;
	before(async () => {
		await truncateEntities();
		edition = await createEdition();
		const editionGroupBbid = getRandomUUID();
		const editionGroupAttribs = {
			bbid: editionGroupBbid,
			typeId: 1
		};
		await createEditionGroup(editionGroupBbid, editionGroupAttribs);
		// create a revision which adds these two edition in the editionGroup
		const editor = await createEditor();
		const revision = await new Revision({authorId: editor.id})
			.save(null, {method: 'insert'});

		edition.set('revisionId', revision.id);
		edition.set('editionGroupBbid', editionGroupBbid);
		await edition.save(null, {method: 'update'});
	});

	it('should return list of EditionGroups associated with the edition', async () => {
		const res = await chai.request(app).get(`/edition-group?edition=${edition.get('bbid')}`);
		await browseEditionGroupBasicTests(res);
		expect(res.body.editionGroups.length).to.equal(1);
	});

	it('should return list of EditionGroups associated with the edition (with Type Filter)', async () => {
		const res = await chai.request(app).get(`/edition-group?edition=${edition.get('bbid')}&type=Edition+Group+Type+1`);
		await browseEditionGroupBasicTests(res);
		expect(res.body.editionGroups.length).to.equal(1);
		expect(_.toLower(res.body.editionGroups[0].entity.editionGroupType)).to.equal('edition group type 1');
	});

	it('should return 0 EditionGroups (with Incorrect Type Filter)', async () => {
		const res = await chai.request(app).get(`/edition-group?edition=${edition.get('bbid')}&type=wrongEditionGroup`);
		await browseEditionGroupBasicTests(res);
		expect(res.body.editionGroups.length).to.equal(0);
	});

	it('should allow params to be case insensitive', async () => {
		const res = await chai.request(app).get(`/eDiTIon-gROuP?EDItion=${edition.get('bbid')}&TYpe=EdITIon+Group+TYPe+1`);
		await browseEditionGroupBasicTests(res);
		expect(res.body.editionGroups.length).to.equal(1);
		expect(_.toLower(res.body.editionGroups[0].entity.editionGroupType)).to.equal('edition group type 1');
	});

	it('should throw 400 error for invalid bbid', (done) => {
		chai.request(app)
			.get('/edition-group?edition=1212121')
			.end((err, res) => {
				if (err) { return done(err); }
				expect(res).to.have.status(400);
				return done();
			});
	});

	it('should throw 404 error for incorrect bbid', (done) => {
		chai.request(app)
			.get(`/edition-group?edition=${aBBID}`)
			.end((err, res) => {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				return done();
			});
	});

	it('should throw 400 error for incorrect linked entity', (done) => {
		chai.request(app)
			.get(`/edition-group?author=${aBBID}`)
			.end((err, res) => {
				if (err) { return done(err); }
				expect(res).to.have.status(400);
				return done();
			});
	});
});
