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

import * as _ from 'lodash';
import {
	createAuthor, createEditor,
	createWork, getRandomUUID, truncateEntities
} from '../../../test-helpers/create-entities';

import app from '../../../../src/api/app';
import {browseWorkBasicTests} from '../helpers';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';


const {Language, Relationship, RelationshipSet, RelationshipType, Revision} = orm;
chai.use(chaiHttp);
const {expect} = chai;


const aBBID = getRandomUUID();
const bBBID = getRandomUUID();
const inValidBBID = 'akjd-adjjk-23123';


describe('GET /work', () => {
	before(() => createWork(aBBID));
	after(truncateEntities);
	// Test to get basic information of a Work
	it('should get basic information of work', async () => {
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

	it('should return list of aliases of a Work', async () => {
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

	it('should return list of identifiers of work', async () => {
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

	it('should return list of relationships of a Work', async () => {
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

	it('should throw a 404 error if trying to access a work that does not exist', (done) => {
		chai.request(app)
			.get(`/work/${bBBID}`)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Work not found');
				return done();
			});
	});

	it('should throw a 400 error if trying to access a work with invalid BBID', (done) => {
		chai.request(app)
			.get(`/work/${inValidBBID}`)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				expect(res).to.have.status(400);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('BBID is not valid uuid');
				return done();
			});
	});

	it('should throw a 404 error if trying to access identifiers of a Work that does not exist', (done) => {
		chai.request(app)
			.get(`/work/${bBBID}/identifiers`)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Work not found');
				return done();
			});
	});


	it('should throw a 404 error if trying to access aliases of a Work that does not exist', (done) => {
		chai.request(app)
			.get(`/work/${bBBID}/aliases`)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Work not found');
				return done();
			});
	});

	it('should throw a 404 error if trying to access relationships of a Work that does not exist', (done) => {
		chai.request(app)
			.get(`/work/${bBBID}/relationships`)
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				expect(res).to.have.status(404);
				expect(res.ok).to.be.false;
				expect(res.body).to.be.an('object');
				expect(res.body.message).to.equal('Work not found');
				return done();
			});
	});
});

/* eslint-disable no-await-in-loop */
describe('Browse Works', () => {
	let author;
	before(async () => {
		// first create English and French language set for works
		const englishAttrib = {
			frequency: 1,
			isoCode1: 'en',
			isoCode2b: 'eng',
			isoCode2t: 'eng',
			isoCode3: 'eng',
			name: 'English'
		};
		const englishLanguage = await new Language(englishAttrib)
			.save(null, {method: 'insert'});
		const englishLanguageSet = await orm.func.language.updateLanguageSet(
			orm,
			null,
			null,
			[{id: englishLanguage.id}]
		);
		const frenchAttrib = {
			frequency: 2,
			isoCode1: 'fr',
			isoCode2b: 'fre',
			isoCode2t: 'fra',
			isoCode3: 'fra',
			name: 'French'
		};
		const frenchLanguage = await new Language(frenchAttrib)
			.save(null, {method: 'insert'});
		const frenchLanguageSet = await orm.func.language.updateLanguageSet(
			orm,
			null,
			null,
			[{id: frenchLanguage.id}]
		);

		// create 4 works
		// 2 of French Language (of 2 different workType)
		// 2 of English Language (of 2 different workType)
		const workBBIDs = [];
		const workAttrib = {};
		for (let workTypeId = 1; workTypeId <= 2; workTypeId++) {
			const workBBID = getRandomUUID();
			workAttrib.bbid = workBBID;
			workAttrib.typeId = workTypeId;
			workAttrib.languageSetId = englishLanguageSet.id;
			await createWork(workBBID, workAttrib);

			const workBBID2 = getRandomUUID();
			workAttrib.bbid = workBBID2;
			workAttrib.languageSetId = frenchLanguageSet.id;
			await createWork(workBBID2, workAttrib);

			workBBIDs.push(workBBID, workBBID2);
		}

		author = await createAuthor();

		// Now create a revision which forms the relationship b/w author and works
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
		for (const workBBID of workBBIDs) {
			const relationshipData = {
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

		const authorRelationshipSet = await new RelationshipSet()
			.save(null, {method: 'insert'})
			.then((model) => model.relationships().attach(relationships).then(() => model));

		author.set('relationshipSetId', authorRelationshipSet.id);
		author.set('revisionId', revision.id);
		await author.save(null, {method: 'update'});
	});
	after(truncateEntities);

	it('should throw an error if trying to browse more than one entity', (done) => {
		chai.request(app)
			.get(`/work?author=${author.get('bbid')}&edition=${author.get('bbid')}`)
			.end((err, res) => {
				if (err) { return done(err); }
				expect(res).to.have.status(400);
				return done();
			});
	});

	it('should return list of works associated with the author (without any filter)', async () => {
		const res = await chai.request(app).get(`/work?author=${author.get('bbid')}`);
		await browseWorkBasicTests(res);
		expect(res.body.works.length).to.equal(4);
	});

	it('should return list of works associated with the author (with Language Filter)', async () => {
		const res = await chai.request(app).get(`/work?author=${author.get('bbid')}&language=fra`);
		await browseWorkBasicTests(res);
		// 5 work of French Language was created
		expect(res.body.works.length).to.equal(2);
		res.body.works.forEach((work) => {
			expect(work.entity.languages).to.contain('fra');
		});
	});

	it('should return list of works associated with the author (with Type Filter)', async () => {
		const res = await chai.request(app).get(`/work?author=${author.get('bbid')}&type=Work+Type+1`);
		await browseWorkBasicTests(res);
		// 2 work of Work Type 1 was created
		expect(res.body.works.length).to.equal(2);
		res.body.works.forEach((work) => {
			expect(_.toLower(work.entity.workType)).to.equal('work type 1');
		});
	});

	it('should return list of works associated with the author (with Type Filter and Language Filter)', async () => {
		const res = await chai.request(app).get(`/work?author=${author.get('bbid')}&type=Work+Type+1&language=fra`);
		await browseWorkBasicTests(res);
		// 1 work of Work Type 1 and French Language was created
		expect(res.body.works.length).to.equal(1);
		res.body.works.forEach((work) => {
			expect(_.toLower(work.entity.workType)).to.equal('work type 1');
			expect(work.entity.languages).to.contain('fra');
		});
	});

	it('should return 0 works (with Incorrect Type Filter and  Incorrect Language Filter)', async () => {
		const res = await chai.request(app).get(`/work?author=${author.get('bbid')}&type=incorrectType&language=incorrectLan`);
		await browseWorkBasicTests(res);
		expect(res.body.works.length).to.equal(0);
	});

	it('should NOT throw an error when there is no related entity', async () => {
		const author2 = await createAuthor();
		const res = await chai.request(app).get(`/work?author=${author2.get('bbid')}`);
		await browseWorkBasicTests(res);
		expect(res.body.works.length).to.equal(0);
	});

	it('should allow params to be case insensitive', async () => {
		const res = await chai.request(app).get(`/WoRK?aUThOr=${author.get('bbid')}&tYPe=WoRK+TyPe+1&LAnguage=fRA`);
		await browseWorkBasicTests(res);
		// 1 work of Work Type 1 and French Language was created
		expect(res.body.works.length).to.equal(1);
		res.body.works.forEach((work) => {
			expect(_.toLower(work.entity.workType)).to.equal('work type 1');
			expect(work.entity.languages).to.contain('fra');
		});
	});

	it('should throw 400 error for invalid bbid', (done) => {
		chai.request(app)
			.get('/work?author=1212121')
			.end((err, res) => {
				if (err) { return done(err); }
				expect(res).to.have.status(400);
				return done();
			});
	});

	it('should throw 404 error for incorrect bbid', (done) => {
		chai.request(app)
			.get(`/work?author=${aBBID}`)
			.end((err, res) => {
				if (err) { return done(err); }
				expect(res).to.have.status(404);
				return done();
			});
	});

	it('should throw 400 error for incorrect linked entity', (done) => {
		chai.request(app)
			.get(`/work?edition-group=${aBBID}`)
			.end((err, res) => {
				if (err) { return done(err); }
				expect(res).to.have.status(400);
				return done();
			});
	});
});
