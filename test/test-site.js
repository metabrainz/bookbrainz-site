/*
 * Copyright (C) 2015  Sean Burke
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

import app from '../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import status from 'http-status';


chai.use(chaiHttp);
const {expect} = chai;

describe('GET /', () => {
	it('should return 200', (done) => {
		chai.request(app)
			.get('/')
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res.status).to.equal(status.OK);
				expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
				done();
			});
	});
});

describe('GET /about', () => {
	it('should return 200', (done) => {
		chai.request(app)
			.get('/about')
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res.status).to.equal(status.OK);
				expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
				done();
			});
	});
});

describe('GET /contribute', () => {
	it('should return 200', (done) => {
		chai.request(app)
			.get('/contribute')
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res.status).to.equal(status.OK);
				expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
				done();
			});
	});
});

describe('GET /develop', () => {
	it('should return 200', (done) => {
		chai.request(app)
			.get('/develop')
			.end((err, res) => {
				expect(err).to.be.null;
				expect(res.status).to.equal(status.OK);
				expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
				done();
			});
	});
});
