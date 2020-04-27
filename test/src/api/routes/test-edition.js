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
	createEdition, createEditionGroup,
	createEditor,
	getRandomUUID,
	truncateEntities
} from '../../../test-helpers/create-entities';
import _ from 'lodash';
import app from '../../../../src/api/app';
import {browseEditionBasicTests} from '../helpers';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';
import {random} from 'faker';
const {EditionFormat, Language, Relationship, RelationshipSet, RelationshipType, Revision} = orm;


chai.use(chaiHttp);
const {expect} = chai;


const aBBID = getRandomUUID();
const bBBID = getRandomUUID();
const inValidBBID = 'akjd-adjjk-23123';

describe('GET /Edition', () => {
	before(() => createEdition(aBBID));
	after(truncateEntities);
	// Test to get basic information of an Edition
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
			'height',
			'width',
			'depth',
			'pages',
			'status',
			'releaseEventDates',
			'weight'
		);
	 });

	 it('should return list of aliases of an Edition', async function () {
		const res = await chai.request(app).get(`/edition/${aBBID}/aliases`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'aliases'
		);
		expect(res.body.aliases).to.be.an('array');
		expect(res.body.aliases).to.have.lengthOf(1);
	 });

	 it('should return list of identifiers of an Edition', async function () {
		const res = await chai.request(app).get(`/edition/${aBBID}/identifiers`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'identifiers'
		);
		expect(res.body.identifiers).to.be.an('array');
		expect(res.body.identifiers).to.have.lengthOf(1);
	 });

	 it('should return list of relationships of an Edition', async function () {
		const res = await chai.request(app).get(`/edition/${aBBID}/relationships`);
		expect(res.status).to.equal(200);
		expect(res.body).to.be.an('object');
		expect(res.body).to.have.all.keys(
			'bbid',
			'relationships'
		);
		expect(res.body.relationships).to.be.an('array');
		expect(res.body.relationships).to.have.lengthOf(1);
	 });

	 it('should throw a 404 error if trying to access an edition that does not exist', function (done) {
		chai.request(app)
			.get(`/edition/${bBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Edition not found');
				return done();
			});
	 });

	it('should throw a 406 error if trying to access an edition with invalid BBID', function (done) {
		chai.request(app)
			.get(`/edition/${inValidBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(406);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('BBID is not valid uuid');
				return done();
			});
	 });

	 it('should throw a 404 error if trying to identifiers  of an Edition that does not exist', function (done) {
		chai.request(app)
			.get(`/edition/${bBBID}/identifiers`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Edition not found');
				return done();
			});
	 });

	 it('should throw a 404 error if trying to relationships of an Edition that does not exist', function (done) {
		chai.request(app)
			.get(`/edition/${bBBID}/relationships`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Edition not found');
				return done();
			});
	 });


	it('should throw a 404 error if trying to access aliases of an Edition that does not exist', function (done) {
		chai.request(app)
			.get(`/edition/${bBBID}/aliases`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Edition not found');
				return done();
			});
	 });
});

/* eslint-disable no-await-in-loop */
describe('Browse Edition', () => {
	// Test browse requests of Edition
	let author;
	before(async () => {
		await truncateEntities();
		// first create English and French language set for editions
		const englishAttrib = {
			frequency: 1,
			isoCode1: 'en',
			isoCode2b: 'eng',
			isoCode2t: 'eng',
			isoCode3: 'eng',
			name: 'English'
		};
		const englishId = random.number();
		await new Language({...englishAttrib, id: englishId})
			.save(null, {method: 'insert'});
		const englishLanguageSet = await orm.func.language.updateLanguageSet(
			orm,
			null,
			null,
			[{id: englishId}]
		);
		const frenchAttrib = {
			frequency: 2,
			isoCode1: 'fr',
			isoCode2b: 'fre',
			isoCode2t: 'fra',
			isoCode3: 'fra',
			name: 'French'
		};
		const frenchId = random.number();
		await new Language({...frenchAttrib, id: frenchId})
			.save(null, {method: 'insert'});
		const frenchLanguageSet = await orm.func.language.updateLanguageSet(
			orm,
			null,
			null,
			[{id: frenchId}]
		);

		// create 10 editions. 5 of French Language and 5 of English Language
		// with 2 works of each format ( one of french and one english)
		const editionBBIDs = [];
		for (let formatId = 1; formatId <= 5; formatId++) {
			await new EditionFormat({id: formatId, label: `Edition Format ${formatId}`})
				.save(null, {method: 'insert'});

			const editionAttrib = {};

			const editionBBID = getRandomUUID();
			editionAttrib.bbid = editionBBID;
			editionAttrib.formatId = formatId;
			editionAttrib.languageSetId = englishLanguageSet.get('id');
			await createEdition(editionBBID, editionAttrib);

			const workBBID2 = getRandomUUID();
			editionAttrib.bbid = workBBID2;
			editionAttrib.languageSetId = frenchLanguageSet.get('id');
			await createEdition(workBBID2, editionAttrib);

			editionBBIDs.push(editionBBID, workBBID2);
		}

		author = await createAuthor();

		// Now create a revision which forms the relationship b/w author and editions
		const editor = await createEditor();
		const revision = await new Revision({authorId: editor.get('id'), id: random.number()})
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
		for (const workBBID of editionBBIDs) {
			const relationshipData = {
				id: random.number(),
				sourceBbid: author.get('bbid'),
				targetBbid: workBBID,
				typeId: relationshipTypeData.id
			};
			relationshipsPromise.push(
				new Relationship(relationshipData)
					.save(null, {method: 'insert'})
			);
		}
		const relationships = await Promise.all(relationshipsPromise);

		const authorRelationshipSet = await new RelationshipSet({id: random.number()})
			.save(null, {method: 'insert'})
			.then((model) => model.relationships().attach(relationships).then(() => model));

		author.set('relationshipSetId', authorRelationshipSet.get('id'));
		author.set('revisionId', revision.get('id'));
		await author.save(null, {method: 'update'});
	});

	it('should return list of editions associated with the author (without any filter)', async () => {
		const res = await chai.request(app).get(`/edition?author=${author.get('bbid')}`);
		await browseEditionBasicTests(res);
		expect(res.body.editions.length).to.equal(10);
	});

	it('should return list of editions associated with the author (with Language Filter)', async () => {
		const res = await chai.request(app).get(`/edition?author=${author.get('bbid')}&language=French`);
		await browseEditionBasicTests(res);
		// 5 work of French Language was created
		expect(res.body.editions.length).to.equal(5);
		res.body.editions.forEach((work) => {
			expect(work.entity.languages).to.contain('French');
		});
	});

	it('should return list of editions associated with the author (with Format Filter)', async () => {
		const res = await chai.request(app).get(`/edition?author=${author.get('bbid')}&format=Edition+Format+1`);
		await browseEditionBasicTests(res);
		// 2 work of Work Type 1 was created
		expect(res.body.editions.length).to.equal(2);
		res.body.editions.forEach((edition) => {
			expect(_.toLower(edition.entity.editionFormat)).to.equal('edition format 1');
		});
	});

	it('should return list of editions associated with the author (with Format Filter and Language Filter)', async () => {
		const res = await chai.request(app).get(`/edition?author=${author.get('bbid')}&format=edition+format+1&language=French`);
		await browseEditionBasicTests(res);
		// 1 work of Work Type 1 and French Language was created
		expect(res.body.editions.length).to.equal(1);
		res.body.editions.forEach((work) => {
			expect(_.toLower(work.entity.editionFormat)).to.equal('edition format 1');
			expect(work.entity.languages).to.contain('French');
		});
	});

	it('should allow params to be case insensitive', async () => {
		const res = await chai.request(app).get(`/edITion?aUThOr=${author.get('bbid')}&format=edItIOn+FoRmAT+1&LAnguage=fReNCh`);
		await browseEditionBasicTests(res);
		// 1 work of Work Type 1 and French Language was created
		expect(res.body.editions.length).to.equal(1);
		res.body.editions.forEach((work) => {
			expect(_.toLower(work.entity.editionFormat)).to.equal('edition format 1');
			expect(work.entity.languages).to.contain('French');
		});
	});

	it('should throw 406 error for invalid bbid', (done) => {
		chai.request(app)
			.get('/edition?author=1212121')
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(406);
				return done();
			});
	});

	it('should throw 404 error for incorrect bbid', (done) => {
		chai.request(app)
			.get(`/edition?author=${aBBID}`)
			.end(function (err, res) {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				return done();
			});
	});

	it('should return list of editions associated with edition-group', async () => {
		const editionA = await createEdition();
		const editionB = await createEdition();
		const editionGroup = await createEditionGroup();

		// create a revision which adds these two edition in the editionGroup
		const editor = await createEditor();
		const revision = await new Revision({authorId: editor.get('id'), id: random.number()})
			.save(null, {method: 'insert'});

		editionA.set('revisionId', revision.get('id'));
		editionA.set('editionGroupBbid', editionGroup.get('bbid'));
		editionB.set('revisionId', revision.get('id'));
		editionB.set('editionGroupBbid', editionGroup.get('bbid'));
		await editionA.save(null, {method: 'update'});
		await editionB.save(null, {method: 'update'});

		const res = await chai.request(app).get(`/edition?edition-group=${editionGroup.get('bbid')}`);
		await browseEditionBasicTests(res);
		expect(res.body.editions.length).to.equal(2);
	});
});
