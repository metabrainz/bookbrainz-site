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

'use strict';

process.env.NODE_ENV = 'testing';

const request = require('supertest');
const status = require('http-status');
const app = require('../app');

describe('GET /', () => {
	it('should return 200', (done) => {
		request(app)
			.get('/')
			.expect('Content-Type', 'text/html; charset=utf-8')
			.expect(status.OK, done);
	});
});

describe('GET /about', () => {
	it('should return 200', (done) => {
		request(app)
			.get('/about')
			.expect('Content-Type', 'text/html; charset=utf-8')
			.expect(status.OK, done);
	});
});

describe('GET /contribute', () => {
	it('should return 200', (done) => {
		request(app)
			.get('/contribute')
			.expect('Content-Type', 'text/html; charset=utf-8')
			.expect(status.OK, done);
	});
});

describe('GET /develop', () => {
	it('should return 200', (done) => {
		request(app)
			.get('/develop')
			.expect('Content-Type', 'text/html; charset=utf-8')
			.expect(status.OK, done);
	});
});
