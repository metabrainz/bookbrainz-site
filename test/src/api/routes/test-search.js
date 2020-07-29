/*
 * Copyright (C) 2019  Akhilesh Kumar
 * Copyright (C) 2020  Prabal Singh
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


import * as search from '../../../../src/common/helpers/search';
import {aliasData, createEditionGroup, createWork, truncateEntities} from '../../../test-helpers/create-entities';
import app from '../../../../src/api/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import orm from '../../../bookbrainz-data';
import {searchBasicTests} from '../helpers';


chai.use(chaiHttp);
const {expect} = chai;

const searchString = 'name';

describe('GET /search', () => {
	before(async () => {
		// We create two entities of different types to test the entity type query parameter
		// note: create*Entity* function creates 2 entities
		// an extra entity of same type is created while creating a relationship (createEntityRequisites)
		await createWork();
		await createEditionGroup();

		// We also create another entity with a different name to make sure it is not returned
		aliasData.name = 'Fnord';
		aliasData.sortName = 'Fnord';
		await createEditionGroup();
		// reindex elasticSearch
		await search.generateIndex(orm);
	});
	after(truncateEntities);

	// Test search endpoint
	it('should return search result for given query', async () => {
		const res = await chai.request(app).get(`/search?q=${searchString}`);
		await searchBasicTests(res);
		expect(res.body.searchResult).to.be.of.length(4);
	 });
	 it('should return search result for given query (with type query)', async () => {
		const res = await chai.request(app).get(`/search?q=${searchString}&type=work`);
		 await searchBasicTests(res);
		 expect(res.body.searchResult).to.be.of.length(2);
	 });

	 it('should return search result for given query (with an offset)', async () => {
		 const res = await chai.request(app).get(`/search?q=${searchString}`);
		 const res2 = await chai.request(app).get(`/search?q=${searchString}&from=2`);
		 const allResult = res.body.searchResult;
		 const actualResult = res2.body.searchResult;
		 const expectedResult = allResult.slice(2, 4);
		 await searchBasicTests(res2);
		 expect(actualResult.length).to.equal(2);
		 expect(actualResult).to.deep.equal(expectedResult);
	 });

	 it('should return search result for given query (with both offset and size)', async () => {
		 const res = await chai.request(app).get(`/search?q=${searchString}`);
		 const res2 = await chai.request(app).get(`/search?q=${searchString}&from=2&size=1`);
		 const allResult = res.body.searchResult;
		 const actualResult = res2.body.searchResult;
		 const expectedResult = allResult.slice(2, 3);
		 await searchBasicTests(res2);
		 expect(actualResult.length).to.equal(1);
		 expect(actualResult).to.deep.equal(expectedResult);
	 });

	 it('should return no result for a type whose entity do not exist', async () => {
		 const res = await chai.request(app).get(`/search?q=${searchString}&type=publisher`);
		 await searchBasicTests(res);
		 expect(res.body.searchResult).to.be.of.length(0);
	 });

	 it('should throw 400 error if no search query is passed', (done) => {
		 chai.request(app)
			 .get('/search?q=')
			 .end((err, res) => {
				 if (err) { return done(err); }
				 expect(res).to.have.status(400);
				 return done();
			 });
	 });
});
